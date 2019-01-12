var test = require('tape')
var http = require('simple-get')
var did = require('../')()

// Home
did.get('/home',
  function (req, res, params) {
    res.setHeader('x-test', 'home')
    res.setHeader('x-test-params', typeof params)
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

// Item
did.get('/:id([a-f0-9]{16})',
  function (req, res, params) {
    res.setHeader('x-test', 'item')
    res.setHeader('x-test-id', params.id)
    res.end()
  }
)

// Sub-item
did.get('/:id([a-f0-9]{16})/:sub',
  function (req, res, params) {
    res.setHeader('x-test', 'sub-item')
    res.setHeader('x-test-id', params.id)
    res.setHeader('x-test-sub', params.sub)
    res.end()
  }
)

did.del('/deletable', function (req, res) {
  res.setHeader('x-test', 'deleted')
  res.end()
})

var server = require('http').createServer(function (req, res) {
  res.setHeader('Connection', 'close')
  res.setHeader('x-match', did.match(req) ? 'yes' : 'no')
  if (!did.route(req, res)) {
    res.setHeader('x-test', 'no')
    res.end()
  }
})

server.listen(4444, function () {
  test('it works', function (assert) {
    assert.plan(14)
    var base = 'http://localhost:4444'

    var home = base + '/home/'
    http.get(home, function (err, res) {
      assert.equal(
        res.headers['x-test'], 'home',
        'correct route: home'
      )
      assert.equal(
        res.headers['x-test-params'], 'object',
        'typeof params: object'
      )
    })

    var dog = base + '/dog/w0o0Of/#hash'
    http.get(dog, function (err, res) {
      assert.equal(
        res.headers['x-test'], 'dog',
        'correct route: dog'
      )
      assert.equal(
        res.headers['x-test-speak'], 'w0o0Of',
        'correct param: speak'
      )
    })

    var item = base + '/aBcdEf1234567890/?has=query'
    http.get(item, function (err, res) {
      assert.equal(
        res.headers['x-test'], 'item',
        'correct route: item'
      )
      assert.equal(
        res.headers['x-test-id'],
        'aBcdEf1234567890',
        'correct param: id'
      )
    })

    var sub = base + '/aBcdEf1234567890/beep?has=query'
    http.get(sub, function (err, res) {
      assert.equal(
        res.headers['x-test'], 'sub-item',
        'correct route: sub-item'
      )
      assert.equal(
        res.headers['x-test-id'],
        'aBcdEf1234567890',
        'correct param: id'
      )
      assert.equal(
        res.headers['x-test-sub'], 'beep',
        'correct param: sub'
      )
    })

    try {
      // Duplicate route declaration
      did.get('/dog/:speak(w[o0]{2,}f)',
        function (req, res, params) {
          res.setHeader('x-test', 'dog')
          res.setHeader('x-test-speak', params.speak)
          res.end()
        }
      )
    }
    catch (error) {
      assert.ok(!!error, 'doesn’t create duplicates')
    }

    var no = base + '/blah'
    http.get(no, function (err, res) {
      assert.equal(
        res.headers['x-test'], 'no',
        'returns false if didn’t route'
      )
    })

    http.get(base, function (err, res) {
      assert.equal(
        res.headers['x-match'], 'no',
        'does not match non-existent / route'
      )

      did.post('/', function (req, res) {
        res.end()
      })

      http.get(base, function (err, res) {
        assert.equal(res.headers['x-match'], 'yes', 'matches route')
        assert.equal(res.headers['x-test'], 'no', 'does not route')
      })
    })

    http.delete(base + '/deletable', function (err, res) {
      assert.equal(
        res.headers['x-test'], 'deleted',
        'creates del alias for delete method'
      )
    })
  })

  test.onFinish(function () {
    server.close()
  })
})
