const express = require('express')
const router = express.Router()
const refController = require('./ref.controller')

router.post('/invite', twitterAuth, refController.invite)
router.get('/invitations', googleAuth, refController.invitattions)
router.get('/used/:id', facebookAuth, refController.used)

module.exports = router
