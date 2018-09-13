const nodemailer = require('nodemailer')
const { siteTitle, fromEmail, emailConfig, apiUrl } = require('../env')
const transporter = nodemailer.createTransport(emailConfig)

const getInvite = (_from, _to, _link) => {
    const clientUrl = `${apiUrl}/invite/${_from}-${_link}`
    return {
      from: `'${siteTitle}' <${fromEmail}>`,
      to: _to,
      subject: `You have been Invited to ${siteTitle}`,
      html: '<p> Your invitation link is: <a href=' + clientUrl + `'> ${clientUrl}</a>`
    }
}

const getWelcome = (_to) => {
  return {
    from: `'${siteTitle}' <${fromEmail}>`,
    to: _to,
    subject: `Welcome to ${siteTitle}!`,
    html: 'Welcome'
  }
}

const resetPassword = (_to) => {
  return {
    from: `'${siteTitle}' <${fromEmail}>`,
    to: _to,
    subject: `Password reset ${siteTitle}!`,
    html: 'more'
  }
}

const sendEmail = (_body) => {
  transporter.sendMail(body, (error, info) => {
    if (error) {
      console.error(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response)
  })
}

module.exports = {
  sendEmail,
  getInvite,
  getWelcome,
  resetPassword
}
