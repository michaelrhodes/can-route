var regexy = require('ruta3/pathToRegExp')
var origin = /^[^:]+:\/\/[^\/]+/
var cruft = /\/*([?#].*)?$/

module.exports = Did

function Did () {
  if (!(this instanceof Did)) return new Did
  this.routes = []
}

Did.prototype.get = function (pattern, handler) {
  this.routes.push({
    pattern: pattern,
    handler: handler
  })
}

Did.prototype.route = function (req, res) {
  var route = this.match(req, res)
  if (!route) return false

  var pattern = route[0]
  var params = route[1] || {}

  return pattern.handler.call(this, params), true
}

Did.prototype.match = function (req, qh) {
  var routes = this.routes
  var path = pathname(req, qh)
  var keys, regex, params, matches, m

  var route
  var i = 0, l = routes.length
  for (; i < l; i++) {
    keys = []
    route = routes[i]
    regex = regexy(route.pattern, keys)
    if (!regex.test(path)) continue

    params = {}
    matches = match(path, regex)
    m = matches.length
    while (m--) {
      if (keys[m]) {
        params[keys[m]] = matches[m]
      }
    }
    return [route, params]
  }

  return false
}

function indexOf (routes, pattern) {
  var i = 0, l = routes.length
  for (; i < l; i++)
    if (routes[i].pattern === pattern)
      return i
  return -1
}

function pathname (req, hash) {
  if (typeof req === 'string') {
    req = req.replace(origin, '')
    return hash ? req : req.replace(cruft, '') || '/'
  }

  return hash ?
    req.href.replace(origin, '') :
    req.pathname
}

function match (str, regex) {
  return (str.match(regex) || []).slice(1)
}
