const envLoc = process.env.NODE_ENV === 'production' ? '../.env' : '../.env.development'
require('dotenv').config({ path: envLoc })

module.export = {
  siteTitle: 'TestSite',
  fromEmail: 'info@dd.dd.com',
  emailConfig: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  df: {
    user: process.env.PG_USER,
    host: process.env.PG_SERVER,
    database: process.env.PG_DB,
    password: process.env.PG_PASS,
    port: 5432
  }
}
