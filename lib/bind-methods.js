module.exports = bind

function bind (methods) {
  var thy = this
  ;(function next (n) {
    if (!methods[--n]) return
    thy[methods[n]] = function (pattern, handler) {
      append.call(this, methods[n], pattern, handler)
    }
    next(n)
  })(methods.length)
}

function append (method, pattern, handler) {
  var route = this.routes[pattern] || {}

  if (route[method]) {
    throw new Error([
      method.toUpperCase(),
      pattern, 'already exists'
    ].join(' '))
  }

  route[method] = handler
  this.routes[pattern] = route
}
