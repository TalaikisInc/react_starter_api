const PGPubsub = require('pg-pubsub')
const { db } = require('../env')

const pubsubInstance = new PGPubsub(`postgres://${db.user}:${db.password}@${db.host}:5432/${db.database}`)

pubsubInstance.addChannel('validate', (payload) => {
  console.log(payload)
  /*
  validation notif:
  { email: 'foo3@example.com',
   token: 'b41ad4bd-16cb-40d5-a396-1ef59abab8ca',
  token_type: 'validation' }
  */
})
