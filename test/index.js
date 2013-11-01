var run = require('tape').test
var http = require('http')
var can = require('../')()

// Home
can.get(/^\/$/,
  function(req, res) {
    res.setHeader('x-test', 'home')
    res.end()
  }
)

// Item
can.get(/^\/(:<id>[a-f0-9]{16})\/?$/i,
  function(req, res, params) {
    res.setHeader('x-test', 'item')
    res.setHeader('x-test-id', params.id) 
    res.end()
  }
)

// Dog
can.get(/^\/dog\/(:<speak>w[o0]{2,}f)\/?$/i,
  function(req, res, params) {
    res.setHeader('x-test', 'dog')
    res.setHeader('x-test-speak', params.speak)
    res.end()
  }
)

var server = http.createServer(function(req, res) {
  res.setHeader('Connection', 'close')
  if (!can.route(req, res)) {
    res.setHeader('x-test', 'no')
    res.end()
  }
})

server.listen(4444, function() {

  run('it works', function(test) {
    test.plan(7)
    test.on('end', function() {
      server.close()
    })

    var base = 'http://localhost:4444'

    var home = base + '/' 
    http.get(home, function(res) {
      test.equal(
        res.headers['x-test'], 'home',
        'correct route: home'
      )
    })

    var dog = base + '/dog/w0o0Of#hash'
    http.get(dog, function(res) {
      test.equal(
        res.headers['x-test'], 'dog',
        'correct route: dog'
      )
      test.equal(
        res.headers['x-test-speak'], 'w0o0Of',
        'named capture groups work'
      )
    })

    var item = base + '/aBcdEf1234567890?has=query'
    http.get(item, function(res) {
      test.equal(
        res.headers['x-test'], 'item',
        'correct route: item'
      )
      test.equal(
        res.headers['x-test-id'],
        'aBcdEf1234567890',
        'regexp modifiers work'
      )
    })

    try {
      // Dupe 
      can.get(/^\/dog\/(:<speak>w[o0]{2,}f)\/?$/i,
        function(req, res, params) {
          res.setHeader('x-test', 'dog')
          res.setHeader('x-test-speak', params.speak)
          res.end()
        }
      )
    }
    catch (error) {
      test.ok(!!error, 'doesn’t create duplicates')
    }

    var no = base + '/blah'
    http.get(no, function(res) {
      test.equal( 
        res.headers['x-test'], 'no',
        'returns false if can’t route'
      )
    })
  })
})
