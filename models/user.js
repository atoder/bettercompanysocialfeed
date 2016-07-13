var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required : true,
    dropDups: true
  },
  password: {
    type: String,
    required : true
  },
  description: {
    type: String
  },
  avatar: {
    type: String
  },
  join_date: {
    type: Date
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

var User = mongoose.model('User', userSchema);
module.exports = User;

// Get user by id
module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

// Get user by email
module.exports.getUserByEmail = function(email, callback){
  User.findOne({email: email}, callback);
}

// Compare password
module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch){
    if(err){
      return callback(err);
    } else {
      callback(null, isMatch);
    }
  });
}

// Add user
module.exports.addUser = function(user, callback){
  User.create(user, callback);
}

// Get user avatar by e-mail
module.exports.getUserAvatarByEmail = function(email, callback){
  User.findOne({email: email}, 'avatar', callback);
}
