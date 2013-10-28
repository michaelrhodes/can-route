var methods = require('methods')

var append = function(route, method, handler) {
  var routes = this.routes
  route = route.toString()
  routes[route] = routes[route] || {}

  if (routes[route][method]) {
    throw new Error([
      method.toUpperCase(),
      route,
      'already exists'
    ].join(' '))
 }

  routes[route][method] = handler
}

module.exports = (function() {
  return function() {
    methods.forEach(function(method) { 
      this[method.toUpperCase()] = 
      this[method] = function(route, handler) {
        append.call(this, route, method, handler)
      }
    }.bind(this))
  }
})()
