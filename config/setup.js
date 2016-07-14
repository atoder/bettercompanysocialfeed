// Env, db, and other set up vars

/**
 *
 * PRODUCTION/HEROKU
 *
 SET UP THESE CONFIG VARIABLES ON HEROKU
 'dbUrl': process.env.PROD_MONGODB,
 'sessionSecret': process.env.SESSION_SECRET,
// S3 information
'accessKeyId': process.env.AWS_ACCESS_KEY,
'secretAccessKey': process.env.AWS_SECRET_KEY,
'bucket': process.env.AWS_BUCKET
*/

/**
 *
 * FOR DEVELOPEMENT/LOCAL
 *
 Change dbUrl to your local mongo url and sessionSecret to whatever you want
 If you want to use S3 for image upload, put in proper keys
 If you want to upload images locally, remove S3 info or leave it as blank. For example:
 'accessKeyId': '',
 'secretAccessKey': '',
 'bucket': '',
 */

module.exports = {
  // mongodb url
  //'dbUrl': process.env.MONGODB_URI,
  'dbUrl': 'mongodb://localhost/socialfeed',

  // express-session secret
  'sessionSecret': 'mySecret',

  // S3 information
  'accessKeyId': process.env.AWS_ACCESS_KEY,
  'secretAccessKey': process.env.AWS_SECRET_KEY,
  'bucket': process.env.AWS_BUCKET
}
