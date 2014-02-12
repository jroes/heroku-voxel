var Heroku = require('heroku-client');

var url = require('url');
var browserify = require('connect-browserify');
var express = require('express');
var RedisStore = require ('connect-redis')(express);
var async = require('async');
var app = express();

app.use(express.logger());
var passport = require('passport')
  , HerokuStrategy = require('passport-heroku').Strategy;

var HEROKU_OAUTH_ID = process.env.HEROKU_OAUTH_ID;
var HEROKU_OAUTH_SECRET = process.env.HEROKU_OAUTH_SECRET;
var HEROKU_OAUTH_CALLBACK_URL = process.env.HEROKU_OAUTH_CALLBACK_URL;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new HerokuStrategy({
    clientID: HEROKU_OAUTH_ID,
    clientSecret: HEROKU_OAUTH_SECRET,
    callbackURL: HEROKU_OAUTH_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      profile.accessToken = accessToken;
      
      return done(null, profile);
    });
  }
));

// configure Express
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

app.configure('development', function () {
  app.use(express.session({ secret: process.env.SESSION_SECRET || 'keyboard cat, lol!' }));
});  

app.configure('production', function () {
  var redisUrl = url.parse(process.env.REDISTOGO_URL),
      redisAuth = redisUrl.auth.split(':');  
  app.set('redisHost', redisUrl.hostname);
  app.set('redisPort', redisUrl.port);
  app.set('redisDb', redisAuth[0]);
  app.set('redisPass', redisAuth[1]);
  var sessionStore = new RedisStore({
    host: app.set('redisHost'),
    port: app.set('redisPort'),
    db: app.set('redisDb'),
    pass: app.set('redisPass')
  });
  app.use(express.session({ secret: process.env.SESSION_SECRET || 'keyboard cat, lol!', store: sessionStore, key: 'heroku-voxel.sid' }));
});  

app.configure(function() {
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/auth/heroku',
  passport.authenticate('heroku'),
  function(req, res){ });

app.get('/auth/heroku/callback', 
  passport.authenticate('heroku', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/yay.html');
    });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var getDynos = function (heroku) {
  return function(app, callback) {
    heroku.apps(app.name).dynos().list(function (err, dynos) {
      console.log("Got dynos for", app.name, "(", dynos.length, ")");
      app.dynos = dynos;
      callback(null, app);
    });
  };
};

var getCollaborators = function (heroku) {
  return function(app, callback) {
    heroku.apps(app.name).collaborators().list(function (err, collaborators) {
      console.log("Got collaborators for", app.name, "(", collaborators.length, ")");
      app.collaborators = collaborators;
      callback(null, app);
    });
  };
};

app.get('/apps', function(req, res){
  var heroku = new Heroku({ token: req.user.accessToken });
  heroku.apps().list(function (err, apps) {
    console.log("Retrieved apps list:", apps.length, "apps returned.");
    // Get the dynos and collaborators for each app
    async.map(apps, getDynos(heroku), function (err, apps) {
      console.log("Retrieved dynos.");
      async.map(apps, getCollaborators(heroku), function (err, apps) {
        console.log("Retrieved collaborators, returning apps to client.");
        console.log(apps);
        res.send(apps);
      })
    });
  });
});

console.log("Starting app in", process.env.NODE_ENV || "development", "env");

// Automatically rebundle client-side JS
if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
  console.log("Automatically bundling index.js via browserify.");
  app.use('/bundle.js', browserify.serve({
    entry: './public/index.js',            // entry for your application
  }));
}

app.use(express.static(__dirname + '/public'));
var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
    console.log("Listening on " + port);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

