// models/Message.js
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    room: String,
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema);