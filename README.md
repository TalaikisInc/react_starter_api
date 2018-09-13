# React Starter GraphQL API

## How that does work

PostgresQL schema -> Postgraphile -> GraphQLAPI
or:
PostgresQL schema -> PostgREST -> REST API

## Features

* Benchmarking along with the tests.
* User management system (through JWT).
* Referral system
* CMS system (??)
* payment system (??)
* Blockchain functions (??)

## TODO

* oauth signup/signin
* return user data after login and update
* JWT verify.

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

### Run API server

```bash
npm install -g postgraphile
postgraphile -c postgres://postgres:dsdsdasd@127.0.0.1:5432/blue -j --watch

# For all CLI options:
# https://www.graphile.org/postgraphile/usage-cli/

# OR:
npm run start
```

### Run Postgres PubSub service:

```bash
cd utils/
node pubsub.js
# OR:
npm run pubsub
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
  updateUserInfo(input: {mail: "foo2@example.com", password: "123456", firstname: "First", lastname: "Last", about: "About me"}) {
    clientMutationId
  }
}
```

### Delete user

```graphql
mutation {
  deleteUserAccount(input: {mail: "foo2@example.com", password: "123456"}) {
    clientMutationId
  }
}
```

### Password reset

```graphql
mutation {
  requestPasswordReset(input: {email: "foo2@example.com"}) {
    clientMutationId
  }
}

mutation {
  resetPassword(input: {email: "foo2@example.com", token: "1644a2aa-ded2-47f3-945c-e79399015dc7", password: "65321"}) {
    clientMutationId
  }
}

```

## Tests

1. Create test database and edit appropirate .env file.
2. Graphile API and pubsub listener should be running.
3. Then:

```bash
npm run test
```

## Licence

MIT
