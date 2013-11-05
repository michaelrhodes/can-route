var url = require('url')
var all = require('methods')
var methods = require('./lib/methods')(all)
var shared = require('./shared')

module.exports = shared(methods, url)
