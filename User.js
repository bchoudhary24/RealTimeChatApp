// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: String,
    phone: String,
    avatar: String
});
module.exports = mongoose.model('User', userSchema);