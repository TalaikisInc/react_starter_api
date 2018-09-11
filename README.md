# React Starter GraphQL API

## Status

-- In development, don't use.

## Features

* User management system (through JWT).
* CMS system (maybe???)

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
postgraphile -c postgres://postgres:dsdsdasd@127.0.0.1:5432/blue

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

## Licence

MIT
