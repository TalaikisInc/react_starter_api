const jwt = require('jsonwebtoken')
const _ = require('lodash')

function genJti() {
  let jti = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return jti
}

function createToken(payload = {}, secret = process.env.JWT_SECRET) {
  let token = _.assign({}, config.payload, payload)

  token.jti = genJti();
  token.exp =
    Math.floor(Date.now() / 1000) + (payload.exp || config.payload.exp)
  token.count = payload.count || 0

  return jwt.sign(token, secret)
}

module.exports = createToken
