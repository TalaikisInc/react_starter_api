import express from 'express'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { postgraphile } from 'postgraphile'
import { createApolloFetch } from 'apollo-fetch'
import { makeRemoteExecutableSchema, introspectSchema, mergeSchemas } from 'graphql-tools'
import stripe from './stripe'

export default async (app, knex) => {
  const internalApp = express()
  internalApp.use(bodyParser.json())
  internalApp.use(postgraphile(process.env.DATABASE_URL, 'public', {
    pgSettings: (req) => {
      const userId = req.headers['user-id']
      return {
        role: 'app_user',
        ...(userId
          ? { 'basic_auth.jwt.claims.user_id': String(userId) }
          : {}),
      }
    }
  }))

  internalApp.listen(process.env.INTERNAL_PORT, () => {
    console.log(`Postgraphile server listening on port ${process.env.INTERNAL_PORT}`)
  })

  const pgFetcher = createApolloFetch({
    uri: `http://localhost:${process.env.INTERNAL_PORT}/graphql`
  })

  pgFetcher.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {} // eslint-disable-line
    }

    const { context } = request
    // eslint-disable-next-line
    options.headers['user-id'] = context && context.graphqlContext && context.graphqlContext.userId
    next()
  })

  const pgSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(pgFetcher),
    fetcher: pgFetcher
  })

  const schema = mergeSchemas({
    schemas: [pgSchema, stripe.schema, stripe.linkTypeDefs],
    resolvers: stripe.linkResolvers
  })

  // The GraphQL endpoint
  app.use('/graphql', graphqlExpress(req => ({
    schema,
    context: {
      userId: req.user && req.user.id,
      knex
    }
  })))

  // GraphiQL, a visual editor for queries
  if (process.env.NODE_ENV === 'development') {
    app.get('/graphiql', graphiqlExpress({
      endpointURL: '/graphql',
    }));
  }

  return true
}
