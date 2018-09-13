const path = require('path')
const fs = require('fs')

const write = (name, contents) => {
  fs.writeFile(`${path.resolve(__dirname, name)}`, contents, (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const read = (name) => {
  return fs.readFileSync(`${path.resolve(__dirname, name)}`)
}

const del = (name) => {
  fs.unlinkSync(`${path.resolve(__dirname, name)}`)
}

module.exports = {
  write,
  read,
  del
}
