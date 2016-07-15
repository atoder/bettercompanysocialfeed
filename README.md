# A Social Feed - Chat Room implemented with Node.js, Socket.IO, MongoDB
URL to working sample: ```https://bettercompanysocial.herokuapp.com/```

## Description/Features
A mobile friendly chat room/social feed with user registration/validation, a custom profile picture and a saved chat history.

Custom variable (var numberOfMessagesToShow = 22;) that sets how many messages to show from database/chat history - Default right now is at 22

Latest messages will be on the top of the social feed

Profile images are resized 88 by 88.

Datestamp of chats is local to the user of the message using Moment.js

User input is sanitized 

##Technology Stack Used:
Node.js

Socket.IO

MongoDB

Bootstrap

Handlebars template engine

JavaScript/JQuery

Passport for authentication

## Config

App will check to see if there are Amazon S3 keys in **config/setup.js** file

If no Amazon S3 keys are present, the app will resize and upload the profile picture to local non-public ./uploads directory for security reasons. GET /profile/images route will retrieve the profile images to display the correct image on profile page

The app will upload images to Amazon S3 as long as accesKeyID, secretAccesKey and bucket information is set up (also will use get /profile/images route to display images)

(./uploads will still be used by 'sharp' npm to resize the image and then upload it to S3)

Make sure your bucket name has a folder called /images

**config/setup.js**

```javascript
// config/setup.js file should look like below

// PRODUCTION - HEROKU SETUP
/*
  Heroku will need these 5 variables to be set
  PROD_MONGODB - which will include the user/pass and mLab MongoDB URL
  SESSION_SECRET - express-session secret variable
  AWS_ACCESS_KEY - S3 Key
  AWS_SECRET_KEY - S3 Secret Key
  AWS_BUCKET - S3 Bucket
*/
module.exports = {
    'dbUrl': process.env.PROD_MONGODB,
    'sessionSecret': process.env.SESSION_SECRET,
    // S3 information
    'accessKeyId': process.env.AWS_ACCESS_KEY,
    'secretAccessKey': process.env.AWS_SECRET_KEY,
    'bucket': process.env.AWS_BUCKET
}

// FOR DEVELOPMENT/LOCAL
// Change dbUrl to your local mongo URL and sessionSecret to whatever you want
// If you want to use S3 for image upload, put in proper keys
// If you want to upload images locally, remove S3 info or leave it as blank. For example:

module.exports = {
  // mongodb url
  'dbUrl': 'mongodb://localhost/bettercompany',
  'sessionSecret': 'whateverSecret',
  // S3 information
  'accessKeyId': '',
  'secretAccessKey': '',
  'bucket': ''
}
```


# Bonus/Future To do
- Use http://timeago.yarp.com/ for timestamp 
- Let user change profile picture in profile dashboard
- Let users access each other’s profiles
- Let user request username and password
- User's own chat can have different styling vs all other chats
- Unit tests
- React.js for front end?
