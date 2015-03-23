// index.js - next-port
// grab next available TCP port.
//
// Copyright (C) 2015 Karim Alibhai.

"use strict";

var net = require('net')
  , test = 1
  , _isAdmin = null
  , isAdmin = function (fn) {
      if (_isAdmin !== null) return _isAdmin;
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

  if (typeof fn !== 'function') {
    fn = function () {}
  }

  var lower = options.lower || 1024
    , higher = options.higher || 65535
    , port = lower - 1
    , server = net.createServer()
    , done = function () {
        server.close()
        fn(null, port)
      }
    , next = function () {
        if (port <= higher) {
          port += 1
          server.listen(port)
        } else {
          fn(new Error('no available ports.'))
        }
      }

  isAdmin(function (isadmin) {
    // check for root/admin
    if (isadmin) {
      lower = test
      port = lower - 1
    }

    // setup failure catching
    server.on('error', next)

    // setup success catching
    server.on('listening', done)

    // try listening, otherwise fail
    server.listen(port)
  })
}
