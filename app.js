var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// For sanitizing user input
var sanitizer = require('sanitizer');

var expressValidator = require('express-validator');
//flash message middleware for Connect.
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var io = require('socket.io');

var fs = require('fs');

var mongooseUrl;
var sessionSecret;
var configFilePath = './config/setup.js';

// This file only will exist for local setup.js (local dev env usually)
// Otherwise use ENV variables (heroku)
var configFile = require(configFilePath);
mongooseUrl = configFile.dbUrl;
sessionSecret = configFile.sessionSecret;

mongoose.connect(mongooseUrl);
require('./config/passport.js')(passport);


// Chat Schema
var Chat = require('./models/chat');

// How many messages to display from chat history
var numberOfMessagesToShow = 22;

// main routes files definition
var routes = require('./routes/index');

// Express
var app = express();

app.set('views', path.join(__dirname, 'views'));

// handle bars template
var exphbs = require('express-handlebars');
// If you want to pass any option offered by express-handlebar module
// do it inside the create() in the handlebars.js file
var handlebars = require('./helpers/handlebars.js')(exphbs);

// The handlebars variable now has an object called engine.
// Use that to define your app.engine
// You don't need to define any options here.
// Everything is defined in the create() in handlebars.js
// If you are using a different extension, you can change handlebars to whatever you are using.
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express-session set up
// Set up the Session middleware using a MongoDB session store
var sessionMiddleware = session({
  secret: sessionSecret, 
  saveUninitialized: true,
  resave: true,
  // Store session in db
  store: new (require("connect-mongo")(session))({
      mongooseConnection: mongoose.connection
  })
})
app.use(sessionMiddleware);

// Passport init
app.use(passport.initialize());
app.use(passport.session());


// The flash is a special area of the session used for storing messages.
// Messages are written to the flash and cleared after being displayed to the user.
app.use(flash());

// The express-messages module provides flash notification rendering.
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Global Vars for our email
// and user avatar to pass into our socket session
app.use(function(req, res, next){
  if (req.user){
    res.locals.email = req.user.email;
    // set avatar to be available in  app.io.sockets.on('connection', function(socket) 
    req.session.avatar = req.user.avatar;
  }
  next();
});


// express-validator for error messages
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Socket.io
// For making making socket.io available in app.js.
app.io = io();

// Wrapping express middleware
app.io.use(function(socket, next){
    // Wrap the express middleware
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.io.sockets.on('connection', function(socket){
	console.log('a user connected');
	// req.session - Session object in a normal request as in routes. Example: app.get('/', function(req,res) { ....
	// socket.request.session - Now it's available from Socket.IO sockets too!
	var userEmail = socket.request.session.passport.user;
  var userAvatar = socket.request.session.avatar;

	// Look up all the message in the database
	var query = Chat.find({});
	// -created is desc
	// created is asc
	query.sort('created').limit(numberOfMessagesToShow).exec(function(err, data) {
		if (err) throw err;
		socket.emit('load old messages', data);
	});

	socket.on('send message', function(data){
    console.log('sending message');
    // sanitize user data
    data = sanitizer.sanitize(data);
		var newMessage = new Chat({email: userEmail, avatar: userAvatar, msg: data});
		newMessage.save(function(err) {
			if (err) throw err;
      socket.emit('show message', {email: userEmail, avatar: userAvatar, msg: data});
		});
	});

	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


// route set up
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers
// development error handler
// will print stacktrace
// you can find out your env locally by typing in a shell echo $NODE_ENV
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
