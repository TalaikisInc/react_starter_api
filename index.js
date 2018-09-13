const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { postgraphile } = require('postgraphile')
const { createApolloFetch } = require('apollo-fetch')
const { makeRemoteExecutableSchema, introspectSchema, mergeSchemas } = require('graphql-tools')
const stripe = require('stripe')
const path = require('path')
const fs = require('fs')
const http = require('http')
const passport = require('passport')
const session = require('express-session')
const cors = require('cors')
const shortid = require('shortid')
const socketio = require('socket.io')
const authRouter = require('./lib/routes/auth')
const refRouter = require('./lib/routes/ref')
const passportInit = require('./lib/passport.init')
const logger = require('morgan')
const { CLIENT_ORIGIN, SESSION_SECRET } = require('./env')
const app = express()
const envLoc = process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
require('dotenv').config({ path: envLoc })
const { sendEmail } = require('../utils/email')
const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(morgan('combined', { stream: logStream })))
// passportInit()
app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(session({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(logger('dev'))
app.use('/oauth', authRouter)
app.use('/ref', refRouter)

app.use(postgraphile(process.env.DATABASE_URL, 'public', {
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

app.listen(process.env.INTERNAL_PORT, () => {
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


/*
backup from old API

const server = http.createServer(app)

const io = socketio(server)
app.set('io', io)

const PORT = process.env.API_PORT ? process.env.API_PORT : 8080
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info(`==> listening on http://localhost:${PORT}.`)
})

*/
