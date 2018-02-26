/*
Adapted from, and largely the work of:
https://github.com/delvedor/find-my-way

MIT License

Copyright (c) 2017 Tomas Della Vedova

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
  Node type
    static: 0,
    param: 1,
    matchAll: 2,
    regex: 3

  Char codes:
    '/': 47
    ':': 58
    '*': 42
    '?': 63
    '#': 35
*/

var methods = require('methods')
var errored = false

module.exports = Did

function Did () {
  if (!(this instanceof Did)) return new Did
  this.tree = new Node
}

(function bindHttpMethod (i, m) {
  if (!(m = methods[i++])) return
  var method = m.toUpperCase()
  this[m] = function (path, handler) {
    this.on(method, path, handler)
  }
  if (m === 'delete') this.del = this[m]
  bindHttpMethod.call(this, i)
}).call(Did.prototype, 0)

Did.prototype.route = function (req, res) {
  var match = this.match(req)
  if (!match || match === true) return false
  return match.handler(req, res, match.params), true
}

Did.prototype.match = function (req) {
  var method = req.method
  var path = sanitizeUrl(req.url)
  var currentNode = this.tree
  var node = false
  var kind = 0
  var decoded = false
  var pindex = 0
  var params = []
  var pathLen = 0
  var prefix = ''
  var prefixLen = 0
  var len = 0
  var i = 0

  while (true) {
    pathLen = path.length
    prefix = currentNode.prefix
    prefixLen = prefix.length
    len = 0

    // found the route
    if (pathLen === 0 || path === prefix) {
      var handle = currentNode.getHandler(method)
      if (!handle) return true

      var paramNames = handle.params || []
      var paramsObj = {}

      for (i = 0; i < paramNames.length; i++) {
        paramsObj[paramNames[i]] = params[i]
      }

      return {
        handler: handle.handler,
        params: paramsObj
      }
    }

    // search for the longest common prefix
    i = pathLen < prefixLen ? pathLen : prefixLen
    while (len < i && path[len] === prefix[len]) len++

    if (len === prefixLen) {
      path = path.slice(len)
      pathLen = path.length
    }

    node = currentNode.find(path[0])
    if (!node) return false
    kind = node.kind

    // static route
    if (kind === 0) {
      currentNode = node
      continue
    }

    // parametric route
    if (kind === 1) {
      currentNode = node
      i = 0
      while (i < pathLen && path.charCodeAt(i) !== 47) i++
      decoded = fastDecode(path.slice(0, i))
      if (errored) return false
      params[pindex++] = decoded
      path = path.slice(i)
      continue
    }

    // wildcard route
    if (kind === 2) {
      decoded = fastDecode(path)
      if (errored) return false
      params[pindex] = decoded
      currentNode = node
      path = ''
      continue
    }

    // parametric(regex) route
    if (kind === 3) {
      currentNode = node
      i = 0
      while (i < pathLen && path.charCodeAt(i) !== 47) i++
      decoded = fastDecode(path.slice(0, i))
      if (errored) return false
      if (!node.regex.test(decoded)) return false
      params[pindex++] = decoded
      path = path.slice(i)
      continue
    }

    // route not found
    if (len !== prefixLen) return false
  }
}

Did.prototype.on = function (method, path, handler) {
  var params = []
  var j = 0

  for (var i = 0, len = path.length; i < len; i++) {
    // search for parametric or wildcard routes
    // parametric route
    if (path.charCodeAt(i) === 58) {
      j = i + 1
      this._insert(method, path.slice(0, i), 0, null, null, null)

      // isolate the parameter name
      while (i < len && path.charCodeAt(i) !== 47) i++
      var parameter = path.slice(j, i)
      var isRegex = parameter.indexOf('(') > -1
      var regex = isRegex ? parameter.slice(parameter.indexOf('('), i) : null
      if (isRegex) regex = new RegExp(regex, 'i')
      params.push(parameter.slice(0, isRegex ? parameter.indexOf('(') : i))

      path = path.slice(0, j) + path.slice(i)
      i = j
      len = path.length

      // if the path is ended
      if (i === len) {
        return this._insert(method, path.slice(0, i), regex ? 3 : 1, params, handler, regex)
      }
      this._insert(method, path.slice(0, i), regex ? 3 : 1, params, null, null, regex)

    // wildcard route
    } else if (path.charCodeAt(i) === 42) {
      this._insert(method, path.slice(0, i), 0, null, null)
      params.push('*')
      return this._insert(method, path.slice(0, len), 2, params, handler)
    }
  }
  // static route
  this._insert(method, path, 0, params, handler)
}

Did.prototype._insert = function (method, path, kind, params, handler, regex) {
  var prefix = ''
  var pathLen = 0
  var prefixLen = 0
  var len = 0
  var max = 0
  var node = null
  var currentNode = this.tree

  while (true) {
    prefix = currentNode.prefix
    prefixLen = prefix.length
    pathLen = path.length
    len = 0

    // search for the longest common prefix
    max = pathLen < prefixLen ? pathLen : prefixLen
    while (len < max && path[len] === prefix[len]) len++

    if (len < prefixLen) {
      // split the node in the radix tree and add it to the parent
      node = new Node(prefix.slice(len), currentNode.children, currentNode.kind, currentNode.map, currentNode.regex)

      // reset the parent
      currentNode.children = [node]
      currentNode.numberOfChildren = 1
      currentNode.prefix = prefix.slice(0, len)
      currentNode.label = currentNode.prefix[0]
      currentNode.map = null
      currentNode.kind = 0
      currentNode.regex = null

      if (len === pathLen) {
        // add the handler to the parent node
        currentNode.setHandler(method, handler, params)
        currentNode.kind = kind
      } else {
        // create a child node and add an handler to it
        node = new Node(path.slice(len), [], kind, null, regex)
        node.setHandler(method, handler, params)
        // add the child to the parent
        currentNode.add(node)
      }
    } else if (len < pathLen) {
      path = path.slice(len)
      node = currentNode.findByLabel(path[0])
      if (node) {
        // we must go deeper in the tree
        currentNode = node
        continue
      }
      // create a new child node
      node = new Node(path, [], kind, null, regex)
      node.setHandler(method, handler, params)
      // add the child to the parent
      currentNode.add(node)
    } else if (handler) {
      // the node already exist
      currentNode.setHandler(method, handler, params)
    }
    return
  }
}

function sanitizeUrl (url) {
  for (var i = 0, len = url.length; i < len; i++) {
    var charCode = url.charCodeAt(i)
    if (charCode === 63 || charCode === 35) {
      return url.slice(0, i)
    }
  }
  return url
}

function fastDecode (path) {
  errored = false
  try {
    return decodeURIComponent(path)
  } catch (err) {
    errored = true
  }
}

function Node (prefix, children, kind, map, regex) {
  this.prefix = prefix || '/'
  this.label = this.prefix[0]
  this.children = children || []
  this.numberOfChildren = this.children.length
  this.kind = kind || 0
  this.map = map || null
  this.regex = regex || null
}

Node.prototype.add = function (node) {
  this.children.push(node)
  this.numberOfChildren++
}

Node.prototype.findByLabel = function (label) {
  for (var i = 0; i < this.numberOfChildren; i++) {
    var child = this.children[i]
    if (child.label === label) {
      return child
    }
  }
  return null
}

Node.prototype.find = function (label) {
  for (var i = 0; i < this.numberOfChildren; i++) {
    var child = this.children[i]
    if (child.map || child.children.length) {
      if (child.label === label && child.kind === 0) {
        return child
      }
      if (child.kind > 0) {
        return child
      }
    }
  }
  return null
}

Node.prototype.setHandler = function (method, handler, params) {
  this.map = this.map || {}
  this.map[method] = {
    handler: handler,
    params: params
  }
}

Node.prototype.getHandler = function (method) {
  return this.map ? this.map[method] : null
}
