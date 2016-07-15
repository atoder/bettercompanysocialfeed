var mongoose = require('mongoose');

// Chat Schema
var chatSchema = mongoose.Schema({
  email: String,
  msg: String,
  avatar: String,
  localTimestamp: String,
  created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Chat', chatSchema);
