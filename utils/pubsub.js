const envLoc = process.env.NODE_ENV === 'production' ? '../.env' : '../.env.development'
require('dotenv').config({ path: envLoc })
const PGPubsub = require('pg-pubsub')

const pubsubInstance = new PGPubsub(`postgres://${process.env.PG_USER}:${process.env.PG_PASS}@${process.env.PG_SERVER}:5432/${process.env.PG_DB}`)

pubsubInstance.addChannel('validate', (payload) => {
  console.log(payload)
  /*
  validation notif:
  { email: 'foo3@example.com',
  token: 'b41ad4bd-16cb-40d5-a396-1ef59abab8ca',
  token_type: 'validation' }
  */
})
