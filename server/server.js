'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var crypto = require('crypto');
var path = require('path');
var app = module.exports = loopback();

var authCheck = jwt({
  secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        // YOUR-AUTH0-DOMAIN name e.g https://prosper.auth0.com
        jwksUri: "https://seesaw.auth0.com/.well-known/jwks.json"
    }),
    // This is the identifier we set when we created the API
    audience: 'localhost',
    issuer: 'https://seesaw.auth0.com/',
    algorithms: ['RS256']
});

// app.use('/api/services', authCheck);

// app.use('/api/services', function (err, req, res, next) {
//   if (err.name === 'UnauthorizedError') {
//       res.status(401).send('Invalid token, or no token supplied!');
//   } else {
//       res.status(401).send(err);
//   }
// });
// app.use('/api/services', function(req, res, next) {
//   res.json("It has valid token", req.user);
// });
// app.use('/api', function(req, res, next) {
  
//   if(req.query.hash != 'yoyo')
//   {
//     res.status(401).send(`${crypto.createHash('md5').update('yoyo').digest('hex')} is Invaild hash`);
//   }
// next();
// });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(loopback.token());
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
