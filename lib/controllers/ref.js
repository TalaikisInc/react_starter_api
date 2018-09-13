const shortid = require('shortid')
const mongoose = require('mongoose-sql')
const { db } = require('../../env')
const { sendEmail, getInvite } = require('../../utils/email')

mongoose.connect({
  client: 'pg',
  connection: {
    host: db.host,
    user: db.user,
    password: fb.password,
    database: db.database
  }
})

const { Invitations } = require('../models/ref')
const InvitationsModel = mongoose.model('Invitations', Invitations)

exports.invite = (req, res) => {
  const senderId = req.body.link
  const sendermsg = req.body.msg
  const receiverId = req.body.to
  const newLink = shortid.generate()
  const senderName = req.body.name

  const i = new InvitationsModel({
    link: newLink,
    senderId: senderId,
    sendermsg: sendermsg,
    senderName: senderName,
    receiverId: receiverId
  })

  i.save((err) => {
    if (err) {
      return console.log(err)
    }
  })
  res.status(200)
}

exports.invitations = (req, res) => {
  const link = req.query.link
  InvitationsModel.where({ senderId: link }).exec((err, result) => {
    if (err) {
      return console.log(err)
    } else {
      res.status(200).send(result)
    }
  })
}

exports.used = (req, res) => {
  const senderId = req.params.id.trim().split('-')[0].trim()
  const inviteLink = req.params.id.trim().split('-')[1].trim()
  InvitationsModel.where({ senderId: senderId, link: inviteLink }).exec((err, result) => {
    if (err) {
      return console.log(err)
    } else {
      const seen = new Date().toISOString()
      InvitationsModel.where({ senderId: senderId, link: inviteLink })(id, (err, i) => {
        if (err) return console.log(err)
        i.updated_at = seen
        i.save((err, updated) => {
          if (err) return console.log(err)
          res.status(200).render('invite', { result: updated.rows[0] })
        })
      })
    }
  })
}
