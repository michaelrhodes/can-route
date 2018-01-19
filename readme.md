# did-route

did-route is an isomorphic router that returns false when it didn’t handle a request.

[![Build status](https://travis-ci.org/michaelrhodes/did-route.svg?branch=master)](https://travis-ci.org/michaelrhodes/did-route)

[![Browser support](https://ci.testling.com/michaelrhodes/can-route.png)](https://ci.testling.com/michaelrhodes/can-route)

## Install

```sh
$ npm install did-route
```

### Example

```js
var http = require('http')
var did = require('did-route')()

// Home
did.get('/', function (req, res) {
  res.end('Welcome to the homepage\n')
})

// Item
did.patch('/item/:id([a-f0-9]{16})',
  function (req, res, params) {
    res.end('Updated ' + params.id + '\n')
  }
)

http.createServer(function (req, res) {
  // No route has not been registered for
  // this URI and HTTP method.
  if (!did.route(req, res)) {

    // A route *has* been registered for this
    // URI, but not for this HTTP method.
    if (did.match(req)) {
      res.statusCode = 405
      res.end()
      return
    }

    res.statusCode = 404
    res.end()
  }
}).listen(8080)
```

Which would result in the following responses:

```sh
$ curl http://localhost:8080
> Welcome to the homepage

$ curl -X PATCH http://localhost:8080/item/6d80eb0c50b49a5
> Updated 6d80eb0c50b49a5

$ curl -iX DELETE http://localhost:8080/item/6d80eb0c50b49a5
> HTTP/1.1 405 Method Not Allowed
```

#### Browser

did-route also works in the browser with basically the same API. The only differences are that a) `did.get` is the only available routing method, and b) route handlers receive just one argument: the params object.

```js
var did = require('did-route')()

did.get('/', function () {
  // No request or response in the browser.
})

did.get('/:name([a-zA-Z]+)', function (params) {
  // The only argument is the params object.
})

did.get('*#/:name([a-zA-Z]+)', function (params) {
  // It's possible to define routes based on
  // the value of location.hash.
})

window.onpopstate = function () {
  var path = window.location || '/path/to/page'
  if (!did.route(path)) {
    // Handle 404
  }
}

window.onhashchange = function () {
  var includeQueryAndHash = true
  if (!did.route(window.location, includeQueryAndHash)) {
    // Handle 404
  }
}
```

#### Page weight

`require('did-route')`

| compression         |    size |
| :------------------ | ------: |
| did-route.js        | 2.85 kB |
| did-route.min.js    | 1.65 kB |
| did-route.min.js.gz |   850 B |


#### Running the tests

```sh
$ git clone git@github.com:michaelrhodes/did-route
$ cd did-route
$ npm install
$ npm run test:server
$ npm run test:browser
```

#### License

[MIT](http://opensource.org/licenses/MIT)
