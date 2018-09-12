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

/*
backup from old API
const express = require('express')
const path = require('path')
const http = require('http')
const passport = require('passport')
const session = require('express-session')
const cors = require('cors')
const shortid = require('shortid')
const socketio = require('socket.io')
const authRouter = require('./lib/auth.router')
const passportInit = require('./lib/passport.init')
const bodyParser = require('body-parser')
const logger = require('morgan')
const { CLIENT_ORIGIN } = require('./config')
const app = express()
const envLoc = process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
require('dotenv').config({ path: envLoc })
const client = require('./db/conn')
const sendEmail = require('utils/email')

const server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(passport.initialize())

// passportInit()

app.use(cors({ origin: CLIENT_ORIGIN }))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(logger('dev'))

app.use('/', authRouter)

app.post('/invite', (req, res) => {
  const senderId = req.body.link, sendermsg = req.body.msg, receiverId = req.body.to, newLink = shortid.generate()
  const senderName = req.body.name
  const current = new Date().toISOString()
  client.query(`INSERT INTO invitations (created_at, updated_at, link, senderId, sendermsg,senderName, receiverId) VALUES ('${current}', '${current}', '${newLink}', '${senderId}', '${sendermsg}', '${senderName}', '${receiverId}')`, (err, result) => {
    if (err) {
      return console.log(err)
    } else {
      sendEmail(receiverId, senderId, newLink)
      res.send('invited')
    }
  })
})

app.get('/invitations', (req, res) => {
  const link = req.query.link
  client.query(`SELECT * from invitations where senderId='${link}'`, (err, doc) => {
    if (err) {
      console.log(err)
    } else {
      res.status(200).send(doc.rows)
    }
  })
})

app.get('/invite/:id', (req, res) => {
  const sender = req.params.id.trim().split('-')[0].trim()
  const inviteLink = req.params.id.trim().split('-')[1].trim()
  client.query(`SELECT * FROM invitations WHERE senderid='${sender}' AND link='${inviteLink}'`, (err, doc) => {
    if (err) {
      return console.log(err)
    } else {
      const seen = new Date().toISOString()
      client.query(`UPDATE invitations SET updated_at='${seen}' WHERE senderid='${sender}' AND link='${inviteLink}'`, (err, resp) => {
        if (err) {
          console.log(err)
        } else {
          res.render('invite', { result: resp.rows[0] })
        }
      })
    }
  })
})

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

/*
mongoose docs
var db = require("mongoose-sql");
var e = process.environment;
 
// Create connection: note default environment variables
// returns a Knex instance
db.connect({
    client: e.DB_CLIENT || "pg",
    connection: {
      host: e.DB_HOST || "127.0.0.1",
      user: e.DB_USER || "user",
      password: e.DB_PASSWORD || "",
      database: e.DB_DATABASE || "test"
    }
});
 
// Get Knex instance if needed
var knex = db.getKnex();
 
// Use Mongoose-like operations upon PostgreSQL tables
var Cat_Schema = new db.Schema(CatModel);
var Cat = db.model("Cat", Cat_Schema);
Cat.find().exec(myHandler); // find() returns all rows
Cat.findById(123).exec(myHandler); // find by row id
Cat.findOne({name: 'fluffy'}).exec(myHandler); // findOne
Cat.where({name: 'fluffy'}).findOne().exec(myHandler); // find by where
Cat.find().sort('breed').exec(myHandler); // sort
Cat.find().populate('owner').exec(myHandler); // outer left join
 
var simba = new Cat( { CatObject } );
simba.save(function() {
 
});
simba.remove(function() {
    
});
 
// Migrations (WIP)
var mongoose = require("mongoose"); // instance Mongoose
var Cat_Schema_Mongo = new mongoose.Schema(CatModel); // make a mongoose schema
var Cat_Mongo = mongoose.model("Cat", Cat_Schema_Mongo); // make a mongoose model
db.migreateSchemas([Cat_Mongo]).then(function() { // call migreateSchemas with model
    console.log("moved data to PostgreSQL from Mongoose");
});
*/