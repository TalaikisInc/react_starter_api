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
  return fs.readFileSync(`../logs/${name}`)
}

const del = (name) => {
  fs.unlinkSync(`../logs/${name}`)
}

module.exports = {
  write,
  read,
  del
}
