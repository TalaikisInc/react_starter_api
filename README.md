# React Starter GraphQL API

## Status

-- In development, don't use due to breaking changes.

## TODO

* change email
* change role
* oauth signup/signin
* return user data after login and update
* autogenerate ref. link
* programatic tests

## Features

* User management system (through JWT).
* Referral system
* CMS system (??)
* Blockchain functions (??)

## How that does work

Postgres schema -> Postgraphile -> GraphQLAPI

## How to prepare

```bash
npm i
```

Create database.
Edit .env or .env.development
Modify schema inside db/createTables.js if needed.
Create tables:

```bash
cd db/
node createTables.js
```

## How to start

Run API server:
```bash
npm install -g postgraphile
postgraphile -c postgres://postgres:dsdsdasd@127.0.0.1:5432/blue -j --watch

# For all CLI options:
# https://www.graphile.org/postgraphile/usage-cli/
```

Run Postgres PubSub service:

```bash
cd utils/
node pubsub.js
```

OR use build.sh

## Use Postgres on Docker

```bash
# Install and run:
./postgres_docker.sh container_name postgres_password

# Connect to:
psql -h 0.0.0.0 -p 5432 -U postgres
```

## Use Postgraphile  on Docker

```bash
./graphile_docker.sh name_of_container postgres_password database_name port
```

## Use PostgREST

Edit postgrest.conf, then:

```bash
./postgrest_install.sh
./gen_pass.sh
./postgrest postgrest.conf
```

## Generate docs

```bash
./docs.sh project_name
```

## Example GraphQL requests

### Signup

```graphql
mutation {
  signup(input: {email: "foo2@example.com", password: "123456"}) {
    clientMutationId
  }
}
```

### Signin

```graphql
mutation {
  login(input: {email: "foo2@example.com", password: "123456"}) {
    json
  }
}
```

### Validate

```graphql
mutation {
  validate(input: {tok: "fbd10f39-88cf-4850-b599-8df0b43aa2ac"}) {
    clientMutationId
  }
}
```

### Update user

```graphql
mutation {
  updateUserInfo(input: {email: "foo2@example.com", password: "123456", firstName: "First", lastName: "Last", about: "About me"}) {
    clientMutationId
  }
}
```

### Delete user

```graphql
mutation {
  deleteUserAccount(input: {email: "foo2@example.com", password: "123456"}) {
    clientMutationId
  }
}
```

## Licence

MIT
