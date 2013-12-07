var named = require('named-regexp').named
var collapse = require('collapse-array')

var live = function(route) {
  var format = /^\/(.+)\/([mig]*)$/
  var regexp = (route.match(format) || [])
    .slice(1)

  return named(RegExp.apply(this, regexp))
}

module.exports = function(methods, url) {
  var server = !!url

  var Can = function() {
    if (!(this instanceof Can)) {
      return new Can
    }
  }

  methods.call(Can.prototype)

  Can.prototype.routes = {}

  Can.prototype.route = function(req, res) {
    var hash = !server && res === true
    var pathname = (typeof req == 'string' ?
      (!hash ? req.replace(/(\?|#).+$/, '') : req) :
      null
    )
    var method = (server ?
      req.method.toLowerCase() : 'get'
    )

    if (!pathname) {
      var href = req.url || req.href
      if (server) {
        pathname = url.parse(href).pathname
      }
      else {
        pathname = (hash ?
          href.replace(/^.+:\/\/[^\/]+(.+)/, '$1') :
          req.pathname
        )
      }
    }

    var routes = this.routes
    var routeable = false
    for (var route in routes) { 
      routeable = live(route).exec(pathname)
      if (routeable && routes[route][method]) {
        var params = collapse(routeable.captures)
        var args = (server ?
          [req, res, params] : [params]
        )
        routes[route][method].apply(this, args)
        return true 
      }
    }

    return false
  }

  return Can
}
