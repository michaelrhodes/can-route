var url = require('url')
var methods = require('methods') || ['get']
var regexy = require('ruta3/pathToRegExp')
var bind = require('./lib/bind-methods')(methods)
var server = !!url

module.exports = Did

function Did () {
  if (!(this instanceof Did)) return new Did
  this.routes = {}
}

bind.call(Did.prototype)

Did.prototype.route = function (req, res) {
  var method = server ? req.method.toLowerCase() : 'get'
  var route = this.match(req, res)
  if (!route) return false

  var pattern = route[0]
  var params = route[1]

  var handler = this.routes[pattern][method]
  if (!handler) return false

  return server ?
    handler.apply(this, [req, res, params]) :
    handler.call(this, params), true
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

    params = {}
    matches = match(path, regex)
    m = matches.length
    while (m--) params[keys[m]] = matches[m]
    return [pattern, params]
  }

  return false
}

function pathname (req, qh) {
  var hash = !server && qh === true

  // In the browser you match the value of
  // window.location.href or a string path
  var pathname = typeof req === 'string' && (
    hash ? req : req.replace(/(\?|#).+$/, '')
  )

  if (pathname) return pathname
  var href = req.url || req.href

  return server ? url.parse(href).pathname : hash ?
    href.replace(/^.+:\/\/[^\/]+/, '') :
    req.pathname
}

function match (str, regex) {
  return (str.match(regex) || []).slice(1)
}
