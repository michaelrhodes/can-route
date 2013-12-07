var append = function(context, route, method, handler) {
  var routes = context.routes
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

module.exports = function(methods) {
  return function() {
    var thy = this
    var total = methods.length
    ;(function next(n) {
      var method = methods[n]
      thy[method.toUpperCase()] = 
      thy[method] = function(route, handler) {
        append(thy, route, method, handler)
      }
      if (++n < total) {
        next(n)
      } 
    })(0)
  }
}
