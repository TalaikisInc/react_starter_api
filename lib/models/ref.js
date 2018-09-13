const mongoose = require('mongoose-sql')
const Schema = mongoose.Schema

const Invitations = new Schema({
    link: String,
    senderId: { type: String, unique: true },
    sendermsg: String,
    senderName: String,
    receiverId: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

module.exports = {
  Invitations
}
