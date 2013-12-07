var run = require('tape').test
var can = require('../browser')()
var hashwatch = require('./hash-watch')
var result = {}

// Home
can.get(/#\/$/, function() {
  result = {}
  result.test = 'home'
})

// Item
can.get(/#\/(:<id>[a-f0-9]{16})\/?$/i, function(params) {
  result = {}
  result.test = 'item'
  result.id = params.id
})

// Dog
can.get(/#\/dog\/(:<speak>w[o0]{2,}f)\/?$/i, function(params) {
  result = {}
  result.test = 'dog'
  result.speak = params.speak
})

run('it works: home', function(test) {
  var expected = {}
  expected.test = 'home'

  hashwatch(function(hash) {
    this.stop()
    test.ok(can.route(location, true), 'can route')
    test.deepEqual(result, expected)
    test.end()
  })

  location.hash = '/'
})

run('it works: item', function(test) {
  var expected = {}
  expected.test = 'item'
  expected.id = 'aBcdEf1234567890'

  hashwatch(function() {
    this.stop()
    test.ok(can.route(location, true), 'can route')
    test.deepEqual(result, expected)
    test.end()
  })

  location.hash = '/aBcdEf1234567890'
})

run('it works: dog', function(test) {
  var expected = {}
  expected.test = 'dog'
  expected.speak = 'w0o0Of'

  hashwatch(function() {
    this.stop()
    test.ok(can.route(location, true), 'can route')
    test.deepEqual(result, expected)
    test.end()
  })

  location.hash = '/dog/w0o0Of'
})

run('it only uses the pathname by default', function(test) {
  hashwatch(function() {
    this.stop()
    test.ok(!can.route(location), 'indeed')
    test.end()
  })
  location.hash = '/aBcdEf1234567890'
})
