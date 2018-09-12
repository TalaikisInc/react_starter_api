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

exports.twitter = (req, res) => {
  const io = req.app.get('io')
  const user = {
    name: req.user.username,
    photo: req.user.photos[0].value.replace(/_normal/, '')
  }
  io.in(req.session.socketId).emit('twitter', user)
  res.end()
}

exports.google = (req, res) => {
  const io = req.app.get('io')
  const user = {
    name: req.user.displayName,
    photo: req.user.photos[0].value.replace(/sz=50/gi, 'sz=250')
  }
  io.in(req.session.socketId).emit('google', user)
  res.end()
}

exports.facebook = (req, res) => {
  const io = req.app.get('io')
  const { givenName, familyName } = req.user.name
  const user = {
    name: `${givenName} ${familyName}`,
    photo: req.user.photos[0].value,
    email: req.user.emails[0].value
  }

  client.query(`SELECT * FROM basic_auth.users WHERE email='${user.email}'`, (err, resp) => {
    if (err) {
      console.log(err)
    }
    if (resp.rows.length >= 1) {
      console.log('ran')
      done(null, res)
    } else {
      let shortId = shortid.generate()
      while (shortId.indexOf('-') >= 0) {
        shortId = shortid.generate()
      }
      client.query(`INSERT INTO basic_auth.users (name, link, email, pass) VALUES ('${user.name}','${shortId}','${user.email}'),'${shortId}'`, (e, r) => {
        if (e) {
          console.log(e)
        } else {
          done(null, { rows: [{ name: user.name, link: shortId, email: user.email }] })
        }
      })
    }
  })

  io.in(req.session.socketId).emit('facebook', user)
  res.end()
}

exports.github = (req, res) => {
  const io = req.app.get('io')
  const user = {
    name: req.user.username,
    photo: req.user.photos[0].value
  }
  io.in(req.session.socketId).emit('github', user)
  res.end()
}

exports.linkedin = (req, res) => {
  const io = req.app.get('io')
  // @TODO
  const { givenName, familyName } = req.user.name
  const user = {
    name: `${givenName} ${familyName}`,
    photo: req.user.photos[0].value
  }
  io.in(req.session.socketId).emit('linkedin', user)
  res.end()
}
