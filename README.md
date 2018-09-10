# React Starter GraphQL API

## How to start

```bash
npm i
```

Create database.
Edit .env or .env.development
Make schemas inside db/schema.

```bash
node db/createTables.js
```

```bash
npm install -g postgraphile
postgraphile --connection postgres://POSTGRES_USER:POSTGRES_PASSWORD@POSTGRES_HOST:POSTGRES_PORT/POSTGRES_DATABASE --watch --jwt-token-identifier public.jwt_token --jwt-secret <jwt_secret> --default-role anon --show-error-stack

--connection postgres://POSTGRES_USER:POSTGRES_PASSWORD@POSTGRES_HOST:POSTGRES_PORT/POSTGRES_DATABASE

 --schema app_public --watch
```

## Licence

MIT
