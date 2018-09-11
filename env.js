const path = require('path')
const envLoc = process.env.NODE_ENV === 'production' ? path.join(__dirname, '.env') : path.join(__dirname, '.env.development')
require('dotenv').config({ path: envLoc })
const assert = require('assert')
assert.equal(typeof process.env.JWT_SECRET, 'string', 'You should set database encryption password')
assert.equal(typeof process.env.PG_DB, 'string', 'You should set database name')

const siteTitle = 'TestSite'
const fromEmail = 'info@dd.dd.com'

const emailConfig = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
}

const db = {
  user: process.env.PG_USER,
  host: process.env.PG_SERVER,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: 5432
}

module.exports = {
  emailConfig,
  db,
  siteTitle,
  fromEmail
}
