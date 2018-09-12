const express = require('../express')
const router = express.Router()
const passport = require('../passport')
const authController = require('./auth.controller')

const twitterAuth = passport.authenticate('twitter')
const googleAuth = passport.authenticate('google', { scope: ['profile'] })
const facebookAuth = passport.authenticate('facebook', { scope: ['email'] })
// successRedirect: "/", failureRedirect: "/auth/provider",
const githubAuth = passport.authenticate('github')
const linkedinAuth = passport.authenticate('linkedin')

const addSocketIdtoSession = (req, res, next) => {
  req.session.socketId = req.query.socketId
  next()
}

router.get('/twitter', addSocketIdtoSession, twitterAuth)
router.get('/google', addSocketIdtoSession, googleAuth)
router.get('/facebook', addSocketIdtoSession, facebookAuth)
router.get('/github', addSocketIdtoSession, githubAuth)
router.get('/linkedin', addSocketIdtoSession, linkedinAuth)

router.get('/twitter/callback', twitterAuth, authController.twitter)
router.get('/google/callback', googleAuth, authController.google)
router.get('/facebook/callback', facebookAuth, authController.facebook)
router.get('/github/callback', githubAuth, authController.github)
router.get('/linkedin/callback', linkedinAuth, authController.linkedin)

module.exports = router
