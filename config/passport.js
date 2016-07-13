var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcryptjs');

module.exports = function(passport){
  passport.serializeUser(function(user, done) {
      //done(null, user.id);
      done(null, user.email);
  });

  passport.deserializeUser(function(email, done) {
      User.getUserByEmail(email, function(err, user) {
        done(err, user);
      });
  });

  // Login
  passport.use('local-login', new LocalStrategy({
    // changing default username field to email
    usernameField: 'email',
    passReqToCallback: true
  },
  function(req, username, password, done){
    User.getUserByEmail(username, function(err, user){
      if(err){
        return done(err);
      }
      // Does user Exist?
      if(!user){
        req.flash('error','User Not Found');
        return done(null, false);
      }
      // Is Password Valid?
      if(!isValidPassword(user, password)){
        req.flash('error','Invalid Password');
        return done(null, false);
      }

      req.flash('success','You are now logged in');
      return done(null, user);
    });
  }
  ));

  // Register
  passport.use('local-register', new LocalStrategy({
    // changing default username field to email
    usernameField: 'email',
    passReqToCallback: true
  },
    function(req, username, password, done){
      findOrCreateUser = function(){
        // Find a user with this username
        User.findOne({email: username}, function(err, user){
          if(err){
            console.log('Error: '+err);
            return done(err);
          }
          // Does user exist?
          if(user){
            console.log('That user already exists');
            return done(null, false, req.flash('message','User already exists'));
          } else {
            var newUser = new User();
            
            newUser.email = req.body.email;
            newUser.password = createHash(password);
            newUser.description = req.body.description;
            newUser.join_date = new Date();

            // User Profile Picture 
            // If req.file exists, use the file's filename
            // otherwise will be blank and handled to display default profile picture later
            if (req.file) {
              newUser.avatar = req.file.filename;
            } 
        
            // Add User
            User.addUser(newUser, function(err, user){
              if(err){
                console.log('Error: '+err);
                throw err;
              } else {
                req.flash('success','You are now registered and logged in');
                return done(null, newUser);
              }
            });
          }
        });
      };
      process.nextTick(findOrCreateUser);
    }
  ));

  var isValidPassword = function(user, password){
    return bcrypt.compareSync(password, user.password);
  }

  var createHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  }
}
