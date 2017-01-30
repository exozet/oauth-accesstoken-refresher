# oauth-accesstoken-refresher

Latest Release: [![GitHub version](https://badge.fury.io/gh/exozet%2Foauth-accesstoken-refresher.png)](https://github.com/exozet/oauth-accesstoken-refresher/releases)

This is a simple webservice, which:

1. stores `client_id` + `client_secret` for a oauth2 service
2. makes a current `access_token` available with basic auth credentials
3. refreshs the `access_token` as soon as it's expired

## Install

``` console
$ git clone https://github.com/exozet/oauth-accesstoken-refresher.git
$ cd oauth-accesstoken-refresher
```

## Usage

Set the required environment variables (e.g. create a `.env` file with the following contents):
 
``` bash
OAUTH_CLIENT_ID='129832903821'
OAUTH_CLIENT_SECRET='thesecret'
OAUTH_AUTHORIZED_URL='https://example.org/oauth/authorize'
OAUTH_ACCESS_URL='https://example.org/oauth/access_token'
OAUTH_REFRESH_URL='https://example.org/oauth/refresh_token'
OAUTH_REDIRECT_URI='http://localhost:3000/connect/now/callback'
OAUTH_SCOPE='default other_scope'
BASIC_AUTH_USERNAME='admin'
BASIC_AUTH_PASSWORD='password'
PORT=3000
```

and launch the server:

``` console
$ npm run start
```

Afterwards navigate to: <http://localhost:3000/> and type the basic auth username and password.

Then you will see a "connect" button.

## Debugging

Use

``` console
$ DEBUG=oauth-accesstoken-refresher node index.js
  oauth-accesstoken-refresher listening on port 3000 +0ms
```

to run the script in debug mode.

## License

This work is copyright by Exozet (<http://exozet.com>) and licensed under the terms of MIT License.

