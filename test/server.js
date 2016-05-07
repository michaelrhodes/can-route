var test = require('tape')
var http = require('http')
var did = require('../')()

// Home
did.get(/^\/$/,
  function (req, res) {
    res.setHeader('x-test', 'home')
    res.end()
  }
)

// Item
did.get('/:id([a-f0-9]{16})',
  function (req, res, params) {
    res.setHeader('x-test', 'item')
    res.setHeader('x-test-id', params.id) 
    res.end()
  }
)

// Dog
did.get('/dog/:speak(w[o0]{2,}f)',
  function (req, res, params) {
    res.setHeader('x-test', 'dog')
    res.setHeader('x-test-speak', params.speak)
  }
)

did.get('/dog/:speak(w[o0]{2,}f)',
  function (req, res, params) {
    res.setHeader('x-test-second', 'yes')
    res.end()
  }
)

var server = http.createServer(function (req, res) {
  res.setHeader('Connection', 'close')
  if (!did.route(req, res)) {
    res.setHeader('x-test', 'no')
    res.end()
  }
})

server.listen(4444, function () {

  test('it works', function (assert) {
    assert.plan(7)
    assert.on('end', function () {
      server.close()
    })

    var base = 'http://localhost:4444'

    var home = base + '/' 
    http.get(home, function (res) {
      assert.equal(
        res.headers['x-test'], 'home',
        'correct route: home'
      )
    })

    var dog = base + '/dog/w0o0Of#hash'
    http.get(dog, function (res) {
      assert.equal(
        res.headers['x-test'], 'dog',
        'correct route: dog'
      )
      assert.equal(
        res.headers['x-test-speak'], 'w0o0Of',
        'named capture groups work'
      )
      assert.equal(
        res.headers['x-test-second'], 'yes',
        'multiple handlers are allowed'
      )
    })

    var item = base + '/aBcdEf1234567890?has=query'
    http.get(item, function (res) {
      assert.equal(
        res.headers['x-test'], 'item',
        'correct route: item'
      )
      assert.equal(
        res.headers['x-test-id'],
        'aBcdEf1234567890',
        'regexp modifiers work'
      )
    })

    var no = base + '/blah'
    http.get(no, function (res) {
      assert.equal(
        res.headers['x-test'], 'no',
        'returns false if didn’t route'
      )
    })
  })
})
