var collapse = require('collapse-array')
var regexify = require('ruta3/pathToRegExp')

var regexp = function(route, captures) {
  var format = /^\/(.+)\/([migy]*)$/
  var regexp = (route.match(format) || [])
    .slice(1)

  return regexp.length ?
    RegExp.apply(this, regexp) :
    regexify(route, captures)
}

module.exports = function(methods, url) {
  var server = !!url

  var getPathname = function(req, res) {
    var hash = !server && res === true 
    var pathname = (typeof req == 'string' ?
      (!hash ? req.replace(/(\?|#).+$/, '') : req) :
      null
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

    return pathname
  }

  var Can = function() {
    if (!(this instanceof Can)) {
      return new Can
    }
  }

  methods.call(Can.prototype)

  Can.prototype.routes = {}

  Can.prototype.match = function(req, res) {
    var pathname = getPathname(req, res)
    var keys, pattern, matches, captures

    for (var route in this.routes) {
      keys = []
      pattern = regexp(route, keys)
      if (pattern.test(pathname)) {
        matches = (pathname.match(pattern) || []).slice(1)
        captures = {}

        for (var i = 0, l = matches.length; i < l; i++) {
          captures[keys[i]] = matches[i]
        }

        return {
          route: route,
          captures: captures
        }
      } 
    }

    return null
  }

  Can.prototype.route = function(req, res) {
    var method = (server ? req.method : 'GET').toLowerCase()
    var matched = this.match(req, res)

    if (!matched) {
      return false
    }

    var route = this.routes[matched.route][method]

    if (route) {
      var params = collapse(matched.captures)
      var args = server ? [req, res, params] : [params]
      route.apply(this, args)
      return true 
    }

    return false
  }

  return Can
}
