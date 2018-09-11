const nodemailer = require('nodemailer')
const { siteTitle, fromEmail } = require('../env')

const getInvite = (_url, _from, _to, _link) => {
    return {
      from: fromEmail,
      to: _to,
      clientUrl: `${_url}/invite/${_from}-${_link}`,
      subject: `You have been Invited to ${siteTitle}`,
      html: '<p> Your invitation link is: <a href=' + clientUrl + `'> ${clientUrl}</a>`
    }
}

const sendEmail = (_body) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  })

  transporter.sendMail(_body, (error, info) => {
    if (error) {
      return console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

module.exports = sendEmail
