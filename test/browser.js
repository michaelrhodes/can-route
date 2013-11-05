var run = require('tape').test
var can = require('../browser')()
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

  window.onhashchange = function() {
    test.ok(can.route(location, true), 'can route')
    test.deepEqual(result, expected)
    window.onhashchange = null
    test.end()
  }

  expected.test = 'home'
  location.hash = '/'
})

run('it works: item', function(test) {
  var expected = {}

  window.onhashchange = function() {
    test.ok(can.route(location, true), 'can route')
    test.deepEqual(result, expected)
    window.onhashchange = null
    test.end()
  }

  expected.test = 'item'
  expected.id = 'aBcdEf1234567890'
  location.hash = '/aBcdEf1234567890'
})

run('it works: dog', function(test) {
  var expected = {}

  window.onhashchange = function() {
    test.ok(can.route(location, true), 'can route')
    test.deepEqual(result, expected)
    window.onhashchange = null
    test.end()
  }

  expected.test = 'dog'
  expected.speak = 'w0o0Of'
  location.hash = '/dog/w0o0Of'
})

run('it only uses the pathname by default', function(test) {
  window.onhashchange = function() {
    test.ok(!can.route(location), 'indeed')
    test.end()
  }
  location.hash = '/aBcdEf1234567890'
})
