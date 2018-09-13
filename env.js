const path = require('path')
const envLoc = process.env.NODE_ENV === 'production' ? path.join(__dirname, '.env') : path.join(__dirname, '.env.development')
require('dotenv').config({ path: envLoc })
const assert = require('assert')
assert.equal(typeof process.env.JWT_SECRET, 'string', 'You should set database encryption password')
assert.equal(typeof process.env.PG_DB, 'string', 'You should set database name')

const siteTitle = 'TestSite'
const fromEmail = 'info@dd.dd.com'
const authenticatorPassword = process.env.AUTHENTICATOR_PASSWORD
const jwtSecret = process.env.JWT_SECRET

const providers = ['twitter', 'google', 'facebook', 'github', 'linkedin']
const callbacks = providers.map(provider => {
  return process.env.NODE_ENV === 'production'
    ? `https://api.blueblood.ltd/oauth/${provider}/callback`
    : `http://127.0.0.1:8080/oauth/${provider}/callback`
})

const [twitterURL, googleURL, facebookURL, githubURL, linkedinURL] = callbacks

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

const TWITTER_CONFIG = {
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: twitterURL
}

const GOOGLE_CONFIG = {
  clientID: process.env.GOOGLE_KEY,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: googleURL
}

const FACEBOOK_CONFIG = {
  clientID: process.env.FACEBOOK_KEY,
  clientSecret: process.env.FACEBOOK_SECRET,
  profileFields: ['id', 'emails', 'name', 'picture.width(250)'],
  callbackURL: facebookURL
}

const GITHUB_CONFIG = {
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: githubURL
}

const LINKEDIN_CONFIG = {
  clientID: process.env.LINKEDIN_KEY,
  clientSecret: process.env.LINKEDIN_SECRET,
  callbackURL: linkedinURL
}

const CLIENT_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://blueblood.ltd'
  : 'http://localhost:3000'

module.exports = {
  emailConfig,
  db,
  siteTitle,
  fromEmail,
  authenticatorPassword,
  jwtSecret,
  LINKEDIN_CONFIG,
  GITHUB_CONFIG,
  FACEBOOK_CONFIG,
  GOOGLE_CONFIG,
  TWITTER_CONFIG,
  CLIENT_ORIGIN
}
