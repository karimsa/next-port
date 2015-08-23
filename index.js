// index.js - next-port
// grab next available TCP port.
//
// Copyright (C) 2015 Karim Alibhai.

"use strict";

var net = require('net')
  , test = 1
  , _isAdmin = null
  , isAdmin = function (fn) {
      if (_isAdmin !== null) return fn(_isAdmin)
      var server = net.createServer()
        , done = function () {
            _isAdmin = true
            fn(true)
          }
        , next = function (err) {
          if (err.code === 'EACCES') {
            _isAdmin = false
            fn(false)
          } else {
            test += 1
            server.listen(test, done)
          }
        }

      server.listen(test, done).on('error', next)
    }

module.exports = function (options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = {}
  }

  options = options || {}

  if (typeof fn !== 'function') {
    fn = null
  }

  var promise = new Promise(function (resolve, reject) {
    var lower = options.lower || 1024
      , higher = options.higher || 65535
      , port = lower - 1
      , server = net.createServer()
      , done = function () {
          server.close()
          resolve(port)
        }
      , next = function () {
          if (port <= higher) {
            port += 1
            server.listen(port)
          } else {
            reject(new Error('no available ports.'))
          }
        }

      isAdmin(function (isadmin) {
      // check for root/admin
      if (isadmin && !options.hasOwnProperty('lower')) {
        lower = test
        port = lower - 1
      }

      // skip
      if (port === 0) port += 1

      // setup failure catching
      server.on('error', next)

      // setup success catching
      server.on('listening', done)

      // try listening, otherwise fail
      server.listen(port)
    })
  });

  // allow asynchronous callbacks instead of promises
  if (fn !== null) promise.then(fn.bind(this, null), fn.bind(this));

  // support promises
  return promise
}
