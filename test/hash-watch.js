var shite = !('bind' in Function && 'onhashchange' in window)

var hashwatch = function(handler) {
  if (!(this instanceof hashwatch)) {
    return new hashwatch(handler)
  }

  this.hash = window.location.hash
  this.handler = handler
  if (!shite) {
    this.handler = this.handler.bind(this)
  }
  this.start()
}

hashwatch.prototype.start = function() {
  var thy = this
  if (!shite) {
    window.addEventListener('hashchange', thy.handler, false)
    return
  }
  this.poll = setInterval(function go() {
    if (window.location.hash !== thy.hash) {
      thy.hash = window.location.hash
      thy.handler()
    }
  }, 100)
}

hashwatch.prototype.stop = function() {
  var thy = this
  if (!shite) {
    window.removeEventListener('hashchange', thy.handler, false)
    return
  }
  clearInterval(this.poll)
}

module.exports = hashwatch
