var express = require('express');
var router = express.Router();
var path = require('path')

var request = require('request');

// Passport authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


// Middleware for handling <code>multipart/form-data</code>
// Our profile image on registration form
var multer = require('multer');

// for resizing our profile picture
var sharp = require('sharp');
var fs = require('fs');

// Where our profile image will be uploaded
// profile-photo is the name of our profile input field
// local
router.use(multer({dest:'./uploads/'}).single('profile-photo'));


// pull out access keys from environment or our config file (heroku vs local)
var aws = require('aws-sdk');

var configFilePath = '../config/setup.js';
var configFile = require(configFilePath);

var accessKeyId;
var secretAccessKey;
var s3bucket;
accessKeyId = configFile.accessKeyId;
secretAccessKey = configFile.secretAccessKey;
s3bucket = configFile.bucket;


// GET login page.
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Better Company', subtitle: 'Chat with interesting people in your city.' });
});

// GET registration page.
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Better Company', subtitle: 'Create your account' });
});

// POST registration of the account
router.post('/register', function(req, res, next){

  var password = req.body.password;
  var password2 = req.body.password2;
  var profilePictureFile = req.file;

  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email must be a valid email address').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  req.checkBody('description', 'Email field is required').notEmpty();

  var errors = req.validationErrors();

  if (errors){
    res.render('register', {
      title: 'Better Company',
      subtitle: 'Create your account',
      errors: errors
    });
  } else {
    // If profie picture file exists, resize and write to upload directory locally
    if (profilePictureFile) {
      sharp(profilePictureFile.path).resize(88, 88).toBuffer(function (err, buff) {
        if (err) return next(err);

        // Write the resized buffer to file 
        // Upload to S3 if we have accesskeyid, secretaccesskey, and s3bucket setup 
        if (accessKeyId && secretAccessKey && s3bucket) {

          aws.config.update({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          });

          var s3 = new aws.S3();
          
          // Set the bucket object properties
          // Key == filename
          // Body == contents of file
          // ACL == Should it be public? Private?
          // ContentType == MimeType of file ie. image/jpeg.
          var params = {
            Bucket: s3bucket,
            Key: 'images/' + profilePictureFile.filename,
            Body: buff,
            ACL: 'public-read',
            ContentType: profilePictureFile.mimetype
          };
          
          // Put the Object in the Bucket
          s3.putObject(params, function(err, data) {
            if (err) {
              console.log(err)
            } else {
              console.log("Successfully uploaded data to s3 bucket");
            }
          });
        } else {
          fs.writeFile(profilePictureFile.path, buff, function (err) { if (err) return console.log(err);
              console.log('Finished resizing the profile picture file');
          });
        }
      })
    }
      
  passport.authenticate('local-register',{
    successRedirect: '/dashboard',
    failureRedirect: '/register',
    failureFlash: true
  })(req, res, next)
  }
});

// POST log into user's dashboard
router.post('/login', function(req, res, next){
  var email = req.body.email;
  var password = req.body.password;

  passport.authenticate('local-login', {
    successRedirect:'/dashboard',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

// GET log out user
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
});

// GET access main chat room page
router.get('/dashboard', function(req, res, next) {
  if (!req.user){
    req.flash('error','You are not logged in');
    res.render('login', { title: 'Please Log In' });
  } else {
    res.render('dashboard', { 
      title: 'Dashboard', 
      layout: 'dashboard_layout', 
      email: req.user.email,
      avatar: req.user.avatar
    });
  }
})

// GET access user's profile page
router.get('/profile', function(req, res, next) {
  if (!req.user){
    req.flash('error','You are not logged in');
    res.render('login', { title: 'Please Log In' });
  } else {
    res.render('profile', { 
      title: 'Profile', 
      email: req.user.email, 
      description: req.user.description, 
      avatar: req.user.avatar,
      layout: 'dashboard_layout'
    });
  }
});

// Development: For security reasons the profile images won't be uploaded to public folder, ./uploads outside public directory will be used
// Route GET /profile/images route will retrieve those images  to display the correct image on profile page

// If profile image exists, return it from ./uploads nonpublic dir if we are using dev environment
// If production environment, we use S3 

// If avatar profile picture was not set, we use default-profile.png
router.get('/profile/images', function(req, res, next) {

  // set up default picture
  var profilePicture = './public/images/default-profile.png';
  
  if (accessKeyId && secretAccessKey && s3bucket) {
    if (req.query.profile) {
      // Sending a file from remote S3 URL and pipe it back to res
      // http://stackoverflow.com/questions/26288055/how-to-send-a-file-from-remote-url-as-a-get-response-in-node-js-express-app
      // for the image to download to browser right away use attachment instead of inline
      //res.setHeader("content-disposition", "attachment; filename=" + req.query.profile);
      res.setHeader("content-disposition", "inline; filename=" + req.query.profile);
      request('https://s3.amazonaws.com/' + s3bucket + '/images/' + req.query.profile).pipe(res);
    } else {
          res.sendFile(path.resolve(profilePicture));
  }
  } else {
    // Local folder
    if (req.query.profile) {
      profilePicture = './uploads/' + req.query.profile; 
    } 
    // need to do path.resolve() because otherwise express sees relatives path as malicious
    res.sendFile(path.resolve(profilePicture));
  }
});

module.exports = router;
