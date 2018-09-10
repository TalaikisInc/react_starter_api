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
postgraphile -c postgres://postgres:dsdsdasd@127.0.0.1:5432/blue --default-role anon --token basic_auth.tokens
```

Run Postgres PubSub service:

```bash
cd utils/
node pubsub.js
```

OR use build.sh

## Licence

MIT
