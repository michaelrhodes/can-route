# can-route
can-route is a simple router that runs inside a `http.createServer` handler and returns false when it can’t route a request. Its routes are defined with [named regular expressions](https://npm.im/named-regexp).

[![Build status](https://travis-ci.org/michaelrhodes/can-route.png?branch=master)](https://travis-ci.org/michaelrhodes/can-route)


## Install
```
npm install can-route
```

### Example
``` js
var http = require('http')
var can = require('can-route')()

// Home
can.get(/^\/$/,
  function(req, res) {
    res.end('Welcome to the homepage\n')
  }
)

// Item
can.patch(/^\/(:<id>[a-f0-9]{16})\/?$/i,
  function(req, res, params) {
    res.end(params.id + '\n')
  }
)

// Server
http.createServer(function(req, res) {
  if (!can.route(req, res)) {
    res.statusCode = 404
    res.end()
  }
}).listen(8080)
```

### License
[MIT](http://opensource.org/licenses/MIT)
