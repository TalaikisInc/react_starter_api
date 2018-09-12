const PGPubsub = require('pg-pubsub')
const { db } = require('../env')
const { write } = require('../tests/fileFunctions')

const pubsubInstance = new PGPubsub(`postgres://${db.user}:${db.password}@${db.host}:5432/${db.database}`)

pubsubInstance.addChannel('validate', (payload) => {
  write('last_validation_token', payload.token)
})

pubsubInstance.addChannel('reset', (payload) => {
  write('last_reset_token', payload.token)
})
