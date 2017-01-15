var url = require('url')
var methods = require('methods')
var regexy = require('ruta3/pathToRegExp')
var bind = require('./lib/bind-methods')
var server = !!methods.length

module.exports = Did

function Did () {
  if (!(this instanceof Did)) return new Did
  this.routes = {}
}

bind.call(Did.prototype, server ? methods : ['get'])

Did.prototype.route = function (req, res) {
  var method = server ? req.method.toLowerCase() : 'get'
  var route = this.match(req, res)
  if (!route) return false

  var pattern = route[0]
  var params = route[1]

  var handler = this.routes[pattern][method]
  if (!handler) return false

  return server ?
    params ?
      handler.apply(this, [req, res, params]) :
      handler.apply(this, [req, res]) :
    params ?
      handler.call(this, params) :
      handler.call(this),
   true
}

Did.prototype.match = function (req, qh) {
  var routes = this.routes
  var path = pathname(req, qh)
  var keys, regex, params, matches, m

  for (var pattern in routes) {
    if (!routes.hasOwnProperty(pattern)) continue

    keys = []
    regex = regexy(pattern, keys)
    if (!regex.test(path)) continue

    matches = match(path, regex)
    m = matches.length
    while (m--) {
      if (keys[m]) {
        params = params || {}
        params[keys[m]] = matches[m]
      }
    }
    return [pattern, params]
  }

  return false
}

function pathname (req, qh) {
  var hash = !server && qh === true
  var origin = /^[^:]+:\/\/[^\/]+/

  // In the browser you match the value of
  // window.location.href or a string path
  if (typeof req === 'string') {
    req = req.replace(origin, '')
    return  hash ? req : req.replace(/^(\/[^?#]*).*$/, '$1')
  }

  var href = req.url || req.href
  return server ? url.parse(href).pathname :
    hash ? href.replace(origin, '') :
    req.pathname
}

function match (str, regex) {
  return (str.match(regex) || []).slice(1)
}
