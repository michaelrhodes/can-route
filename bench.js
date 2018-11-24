'use strict'

var suite = require('benchmark').Suite()
var did = require('./')()

did.get('/', () => true)
did.get('/user/:id', () => true)
did.get('/abc/def/ghi/lmn/opq/rst/uvz', () => true)

suite
  .add('route static', function () {
    did.route({ method: 'GET', url: '/' }, null)
  })
  .add('route dynamic', function () {
    did.route({ method: 'GET', url: '/user/tomas' }, null)
  })
  .add('route long static', function () {
    did.route({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' }, null)
  })
  .add('match static', function () {
    did.match({ method: 'GET', url: '/' })
  })
  .add('match dynamic', function () {
    did.match({ method: 'GET', url: '/user/tomas' })
  })
  .add('match long static', function () {
    did.match({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' })
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {})
  .run()
