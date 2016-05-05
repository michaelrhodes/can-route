var url = require('url')
var methods = require('methods') || ['get']
var collapse = require('collapse-array')
var regexify = require('ruta3/pathToRegExp')
var bind = require('./lib/bind-methods')(methods)
var server = !!url

module.exports = Can

function Can () {
  if (!(this instanceof Can)) return new Can
  this.routes = {}
}

bind.call(Can.prototype)

Can.prototype.route = function (req, res) {
  var method = (server ? req.method : 'GET').toLowerCase()
  var matched = this.match(req, res)
  if (!matched) return false

  var route = this.routes[matched.route][method]
  if (!route) return false

  var params = collapse(matched.captures)
  var args = server ? [req, res, params] : [params]
  route.apply(this, args)
  return true
}

Can.prototype.match = function (req, res) {
  var routes = this.routes
  var pathname = getPathname(req, res)
  var keys, pattern, matches, captures, m

  for (var route in routes) {
    if (!routes.hasOwnProperty(route)) continue

    keys = []
    pattern = regexp(route, keys)
    if (!pattern.test(pathname)) continue

    matches = match(pathname, pattern)
    m = matches.length
    captures = {}
    while (m--) {
      captures[keys[m]] = matches[m]
    }

    return {
      route: route,
      captures: captures
    }
  }

  return false
}

function getPathname (req, res) {
  var hash = !server && res === true
  var pathname = (typeof req == 'string' ? (
      !hash ? req.replace(/(\?|#).+$/, '') : req
    ) : null
  )

  if (pathname) return pathname

  var href = req.url || req.href
  if (server) return url.parse(href).pathname

  return hash ?
    href.replace(/^.+:\/\/[^\/]+(.+)/, '$1') :
    req.pathname
}

function regexp (route, captures) {
  var format = /^\/(.+)\/([migy]*)$/
  var regexp = match(route, format)

  return regexp.length ?
    RegExp.apply(this, regexp) :
    regexify(route, captures)
}

function match (string, regexp) {
  return (string.match(regexp) || []).slice(1)
}
