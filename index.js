require('dotenv').config()

var express = require('express');
var session = require('express-session');
var request = require('request');
var basicAuth = require('express-basic-auth');
var uuidV4 = require('uuid/v4');
var debug = require('debug')('oauth-accesstoken-refresher');

var Grant = require('grant-express');
var grant = new Grant({
    "now": {
      "key": process.env.OAUTH_CLIENT_ID,
      "secret": process.env.OAUTH_CLIENT_SECRET,
      "callback": "/handle/now/callback",
      "oauth": 2,
      "state": true,
      "redirect_uri": process.env.OAUTH_REDIRECT_URI,
      "authorize_url": process.env.OAUTH_AUTHORIZED_URL,
      "access_url": process.env.OAUTH_ACCESS_URL,
      "scope": process.env.OAUTH_SCOPE.split(" ").join(" ")
    }
  }
);

var latestData = {};
var latestDataDate = null;

var app = express();
app.use(session({secret: uuidV4()}));
var basicAuthUsers = {};
basicAuthUsers[process.env.BASIC_AUTH_USERNAME] = process.env.BASIC_AUTH_PASSWORD;

app.use(basicAuth({users: basicAuthUsers, challenge: true}));
app.use(grant);

app.get('/handle/now/callback', function (req, res) {
  var body = req.query;
  if (body.access_token && body.raw.expires_in && body.refresh_token) {
    latestData = body.raw;
    latestDataDate = new Date();
    res.redirect('/');
  } else {
    debug('The raw access_token information does not contain access_token, expires_in AND refresh_token.');
    latestData = null;
    latestDataDate = null;
    res.status(400);
    res.end('Either access_token, expires_in or refresh_token was not set when refreshing the token. Please login again at <a href="/connect/oauth">/connect/oauth</a> once!');
  }
});

app.get('/', function(req, res) {
  var now = new Date();

  if (!latestDataDate) {
    debug('We don\'t have a access_token, yet');
    res.status(400);
    res.setHeader("Content-Type", "text/html");
    res.end('No token stored, yet. Please login at <a href="/connect/now">/connect/now</a> once!');
    return;
  }

  if (!latestData.expires_in) {
    debug("We don't know when it will expire: thus we don't refresh it!");
    latestData.cached = true;
    res.end(JSON.stringify(latestData, null, 4));
    return;
  }

  if (latestData.expires_in * 1000 + latestDataDate.getTime() >= now.getTime()) { /* expires date? */
    debug("We know when it expires and serve it as long as it's not expired!");
    latestData.cached = true;
    res.end(JSON.stringify(latestData, null, 4));
    return;
  }

  if (process.env.OAUTH_REFRESH_URL) {
    debug("We know how to refresh it and it's already expired!");
    request({
      "url": process.env.OAUTH_REFRESH_URL,
      "method": "POST",
      "qs": {
        "client_id": process.env.OAUTH_CLIENT_ID,
        "client_secret": process.env.OAUTH_CLIENT_SECRET,
        "refresh_token": latestData.refresh_token
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        debug("we got data from refresh token", body);
        if (body.access_token && body.expires_in && body.refresh_token) {
          latestData = body;
          latestDataDate = new Date();
          res.end(JSON.stringify(latestData, null, 4));
        } else {
          latestData = null;
          latestDataDate = null;
          res.status(400);
          res.end('Either access_token, expires_in or refresh_token was not set when refreshing the token. Please login again at <a href="/connect/oauth">/connect/oauth</a> once!');
        }
      } else {
        latestData = null;
        latestDataDate = null;
        res.status(400);
        res.setHeader("Content-Type", "text/html");
        res.end('Refreshing token did not work. Please login again at <a href="/connect/now">/connect/now</a> once!');
      }
    });
    return ;
  }

  debug("We don't know how to refresh it and it's already expired");
  res.status(400);
  res.setHeader("Content-Type", "text/html");
  res.end('Token data expired. Please login again at <a href="/connect/now">/connect/now</a> once!');
});

var serverPort = parseInt(process.env.PORT || "3000", 10);

app.listen(serverPort, function() {
  debug('listening on port %d', serverPort)
});
