const path = require('path')
const fs = require('fs')

const write = (name, contents) => {
  fs.writeFile(`../tests/${name}`, contents, (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const read = (name) => {
  return fs.readFileSync(`../tests/${name}`)
}

const del = (name) => {
  fs.unlinkSync(`../tests/${name}`)
}

module.exports = {
  write,
  read,
  del
}
