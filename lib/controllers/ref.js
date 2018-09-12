const shortid = require('shortid')
const mongoose = require('mongoose-sql')
const { db } = require('../env')
mongoose.connect({
  client: 'pg',
  connection: {
    host: db.host,
    user: db.user,
    password: fb.password,
    database: db.database
  }
})

exports.invite = (req, res) => {
}

///////////////////////////////////////////////// TODO from here

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