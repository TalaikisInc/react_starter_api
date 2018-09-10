# React Starter GraphQL API

## Status

-- In development, don't use.

## Features

* User management system (through JWT).
* CMS system (maybe???)

## How that does work

Postgres schema -> Postgraphile -> GraphQLAPI

## How to start

```bash
npm i
```

Create database.
Edit .env or .env.development
Modify schema inside db/createTables.js if needed.
Create tables:

```bash
node db/createTables.js
```

Run API server:
```bash
npm install -g postgraphile
postgraphile -c postgres://postgres:dsdsdasd@127.0.0.1:5432/blue --default-role anon --token basic_auth.tokens
```

## Licence

MIT
