'use strict'

var suite = require('benchmark').Suite()
var did = require('./')()

did.get('/', () => true)
did.get('/user/:id', () => true)
did.get('/abc/def/ghi/lmn/opq/rst/uvz', () => true)

suite
  .add('lookup static route', function () {
    did.route({ method: 'GET', url: '/' }, null)
  })
  .add('lookup dynamic route', function () {
    did.route({ method: 'GET', url: '/user/tomas' }, null)
  })
  .add('lookup long static route', function () {
    did.route({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' }, null)
  })
  .add('find static route', function () {
    did.match({ method: 'GET', url: '/' })
  })
  .add('find dynamic route', function () {
    did.match({ method: 'GET', url: '/user/tomas' })
  })
  .add('find long static route', function () {
    did.match({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' })
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {})
  .run()
