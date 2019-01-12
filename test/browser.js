var test = require('tape')
var hashwatch = require('hashwatch')
var did = require('../browser')()
var result = {}

// Home
did.get('*#/', function (params) {
  result = {}
  result.test = 'home'
  result.params = typeof params
})

// Item
did.get('*#/:id([a-f0-9]{16})', function (params) {
  result = {}
  result.test = 'item'
  result.id = params.id
})

// Dog
did.get('*#/dog/:speak(w[o0]{2,}f)', function (params) {
  result = {}
  result.test = 'dog'
  result.speak = params.speak
})

test('it works: home', function (assert) {
  var expected = {}
  expected.test = 'home'
  expected.params = 'object'

  var watch = hashwatch(function () {
    watch.pause()
    assert.ok(did.route(location, true), 'did route')
    assert.deepEqual(result, expected)
    assert.end()
  })

  location.hash = '/'
})

test('it works: item', function (assert) {
  var expected = {}
  expected.test = 'item'
  expected.id = 'aBcdEf1234567890'

  var watch = hashwatch(function () {
    watch.pause()
    assert.ok(did.route(location, true), 'did route')
    assert.deepEqual(result, expected)
    assert.end()
  })

  location.hash = '/aBcdEf1234567890/'
})

test('it works: dog', function (assert) {
  var expected = {}
  expected.test = 'dog'
  expected.speak = 'w0o0Of'

  var watch = hashwatch(function () {
    watch.pause()
    assert.ok(did.route(location, true), 'did route')
    assert.deepEqual(result, expected)
    assert.end()
  })

  location.hash = '/dog/w0o0Of'
})

test('it only uses the pathname by default', function (assert) {
  var watch = hashwatch(function () {
    watch.pause()
    assert.ok(!did.route(location), 'indeed')
    assert.end()
  })
  location.hash = '/aBcdEf1234567890'
})
