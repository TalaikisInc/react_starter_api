const sql = `
CREATE SCHEMA IF NOT EXISTS user;

    CREATE TABLE IF NOT EXISTS user.users (
        email TEXT PRIMARY KEY CHECK (email ~* '^.+@.+\..+$'),
        pass TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        link TEXT NOT NULL DEFAULT '',
        role NAME NOT NULL DEFAULT 'user',
        verified BOOLEAN NOT NULL DEFAULT false
    );

    DROP TYPE IF EXISTS token_type_enum CASCADE;
    CREATE TYPE token_type_enum AS enum ('validation', 'reset');

    CREATE TABLE IF NOT EXISTS user.tokens (
        token UUID PRIMARY KEY,
        token_type  token_type_enum NOT NULL,
        email TEXT NOT NULL REFERENCES user.users (email)
            ON DELETE CASCADE ON UPDATE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT current_date
    );

    CREATE OR REPLACE FUNCTION
    user.check_role_exists() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    BEGIN
        if not exists (SELECT 1 FROM pg_roles as r WHERE r.rolname = new.role) THEN
            RAISE foreign_key_violation USING message =
                'unknown database role: ' || new.role;
            return null;
        end if;
        return new;
    END
    $$;

    DROP TRIGGER IF EXISTS ensure_user_role_exists on user.users;
    CREATE CONSTRAINT TRIGGER ensure_user_role_exists
        AFTER INSERT OR UPDATE ON user.users FOR EACH ROW
        EXECUTE PROCEDURE user.check_role_exists();
    
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE OR REPLACE FUNCTION
    user.encrypt_pass() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    BEGIN
        if tg_op = 'INSERT' or new.pass <> old.pass then
            new.pass = crypt(new.pass, gen_salt('bf'));
        end if;
        return new;
    END;
    $$;

    DROP TRIGGER IF EXISTS encrypt_pass ON user.users;
    CREATE TRIGGER encrypt_pass
        before insert or update ON user.users
        for each row
        EXECUTE PROCEDURE user.encrypt_pass();
    
    CREATE OR REPLACE FUNCTION
    user.user_role(email text, pass text) RETURNS name
        LANGUAGE plpgsql
        AS $$
    BEGIN
        return (
            SELECT role FROM user.users
                WHERE users.email = user_role.email
                AND users.pass = crypt(user_role.pass, users.pass)
        );
    END;
    $$;

    CREATE OR REPLACE FUNCTION
    login(email text, pass text) RETURNS user.tokens
        LANGUAGE plpgsql
        AS $$
    DECLARE
        _role name;
        _verified boolean;
        _email text;
        result user.tokens;
    BEGIN
        SELECT user.user_role(email, pass) INTO _role;
        if _role is null then
            RAISE invalid_password USING message = 'invalid user or password';
        end if;

        _email := email;
        SELECT verified FROM user.users AS u WHERE u.email=_email LIMIT 1 INTO _verified;
        IF NOT _verified THEN
            RAISE invalid_authorization_specification USING message = 'user is not verified';
        end if;

        SELECT sign(row_to_json(r), '${process.env.ENCODING_SECRET}') AS token
            FROM (
                SELECT _role AS role, login.email AS email,
                extract(epoch from now())::integer + 60*60 AS exp
            ) r
            INTO result;
        return result;
    END;
    $$;

    ALTER DATABASE ${process.env.PG_DB} SET postgrest.claims.email TO '';

    CREATE OR REPLACE FUNCTION
    user.current_email() RETURNS text
        LANGUAGE plpgsql
        AS $$
    BEGIN
        return current_setting('postgrest.claims.email');
    END;
    $$;

    CREATE ROLE anon;
    CREATE ROLE authenticator NOINHERIT;
    GRANT anon TO authenticator;

    GRANT USAGE ON SCHEMA public, user TO anon;
    GRANT SELECT ON TABLE pg_authid, user.users TO anon;
    GRANT EXECUTE ON FUNCTION login(text, text) TO anon;

    CREATE OR REPLACE FUNCTION
    request_password_reset(email text) RETURNS void
        LANGUAGE plpgsql
        AS $$
    DECLARE
        tok uuid;
    BEGIN
        DELETE FROM user.tokens
            WHERE token_type = 'reset'
        AND tokens.email = request_password_reset.email;

        SELECT gen_random_uuid() into tok;
        INSERT INTO user.tokens (token, token_type, email)
            VALUES (tok, 'reset', request_password_reset.email);
        PERFORM pg_notify('reset', json_build_object(
            'email', request_password_reset.email,
            'token', tok,
            'token_type', 'reset'
            )::text
        );
    END;
    $$;

    CREATE OR REPLACE FUNCTION
    reset_password(email text, token uuid, pass text)
        RETURNS void
        LANGUAGE plpgsql
        AS $$
    DECLARE
        tok uuid;
    BEGIN
        if exists(
            SELECT 1 FROM user.tokens
                WHERE tokens.email = reset_password.email
                AND tokens.token = reset_password.token
                AND token_type = 'reset') then
            UPDATE user.users set pass=reset_password.pass
                WHERE users.email = reset_password.email;
            DELETE FROM user.tokens
                WHERE tokens.email = reset_password.email
                AND tokens.token = reset_password.token
                AND token_type = 'reset';
        else
            RAISE invalid_password USING message = 'invalid user or token';
        end if;
        DELETE FROM user.tokens WHERE token_type = 'reset'
            AND tokens.email = reset_password.email;

        SELECT gen_random_uuid() into tok;
        INSERT INTO user.tokens (token, token_type, email)
            VALUES (tok, 'reset', reset_password.email);
        PERFORM pg_notify('reset', json_build_object(
            'email', reset_password.email,
            'token', tok
            )::text
        );
    END;
    $$;

    CREATE OR REPLACE FUNCTION
    user.send_validation() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    DECLARE
        tok uuid;
    BEGIN
        SELECT gen_random_uuid() INTO tok;
        INSERT INTO user.tokens (token, token_type, email)
            VALUES (tok, 'validation', new.email);
        PERFORM pg_notify('validate', json_build_object(
            'email', new.email,
            'token', tok,
            'token_type', 'validation'
            )::text
        );
        return new;
    END;
    $$;

    CREATE OR REPLACE VIEW users AS
    SELECT actual.role AS role,
        '***'::text AS pass,
        actual.email AS email,
        actual.verified AS verified
    FROM user.users AS actual,
        (SELECT rolname FROM pg_authid
        WHERE pg_has_role(current_user, oid, 'member')
        ) AS member_of
    WHERE actual.role = member_of.rolname;

    DROP TRIGGER IF EXISTS send_validation ON user.users;
    CREATE TRIGGER send_validation
        AFTER INSERT ON user.users
        FOR EACH ROW
        EXECUTE PROCEDURE user.send_validation();

    create or replace function
        user.clearance_for_role(u name) returns void as
        $$
        declare
          ok boolean;
        begin
          select exists (
            select rolname
              from pg_authid
             where pg_has_role(current_user, oid, 'member')
               and rolname = u
          ) into ok;
          if not ok then
            raise invalid_password using message =
              'current user not member of role ' || u;
          end if;
        end
        $$ LANGUAGE plpgsql;
        create or replace function
        update_users() returns trigger
        language plpgsql
        AS $$
        begin
          if tg_op = 'INSERT' then
            perform user.clearance_for_role(new.role);
        
            insert into user.users
              (role, pass, email, verified)
            values
              (new.role, new.pass, new.email,
              coalesce(new.verified, false));
            return new;
          elsif tg_op = 'UPDATE' then
            -- no need to check clearance for old.role because
            -- an ineligible row would not have been available to update (http 404)
            perform user.clearance_for_role(new.role);
        
            update user.users set
              email  = new.email,
              role   = new.role,
              pass   = new.pass,
              verified = coalesce(new.verified, old.verified, false)
              where email = old.email;
            return new;
          elsif tg_op = 'DELETE' then
            -- no need to check clearance for old.role (see previous case)
        
            delete from user.users
             where user.email = old.email;
            return null;
          end if;
        end
        $$;
        
        drop trigger if exists update_users on users;
        create trigger update_users
          instead of insert or update or delete on
            users for each row execute procedure update_users();

    create or replace function
signup(email text, pass text) returns void
as $$
  insert into user.users (email, pass, role) values
    (signup.email, signup.pass, 'hardcoded-role-here');
$$ language sql;
`