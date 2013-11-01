var url = require('url')
var named = require('named-regexp').named
var collapse = require('collapse-array')
var methods = require('./lib/methods')

var live = function(route) {
  var format = /^\/(.+)\/([mig]*)$/
  var regexp = (route.match(format) || [])
    .slice(1)

  return named(RegExp.apply(this, regexp))
}

var Can = function() {
  if (!(this instanceof Can)) {
    return new Can
  }
  this.routes = {}
}

methods.call(Can.prototype)

Can.prototype.route = function(req, res) {
  var method = req.method.toLowerCase()
  var routes = this.routes
  var routeable = false
 
  for (var route in routes) {
    routeable = live(route).exec(
      url.parse(req.url).pathname
    )
    if (routeable && routes[route][method]) {
      var params = collapse(routeable.captures)
      routes[route][method](req, res, params)
      return true 
    }
  }
  return false
}

module.exports = Can
