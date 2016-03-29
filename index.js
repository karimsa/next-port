// index.js - next-port
// grab next available port
//
// Copyright (C) 2015-2016 Karim Alibhai.

'use strict';

var net = require('net')
  , dgram = require('dgram')
  , test = 1
  , _isAdmin = null
  , isAdmin = function (protocol, fn) {
      if (_isAdmin !== null) return fn(_isAdmin)
      var server = protocol === 'tcp' ? net.createServer() : dgram.createSocket('udp4')
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

            if (protocol === 'tcp') server.listen(test)
            else server.bind(test)
          }
        }

      server.on('error', next)
      server.on('listening', done)

      if (protocol === 'tcp') server.listen(test)
      else {
          server = dgram.createSocket('udp4')
          server.on('error', next)
          server.bind(test)
          server.on('listening', done)
      }
    }

module.exports = function (options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = {}
  }

  options = options || {}
  options.protocol = options.protocol.toLowerCase() === 'udp' ? 'udp' : 'tcp'

  if (typeof fn !== 'function') {
    fn = null
  }

  var promise = new Promise(function (resolve, reject) {
    var lower = options.lower || 1024
      , higher = options.higher || 65535
      , port = lower - 1
      , server = options.protocol === 'tcp' ? net.createServer() : dgram.createSocket('udp4')
      , done = function () {
          server.close()
          resolve(port)
        }
      , next = function () {
          if (port <= higher) {
            port += 1

            if (options.protocol === 'tcp') server.listen(port)
            else {
                server = dgram.createSocket('udp4')
                server.on('error', next)
                server.on('listening', done)
                server.bind(port)
            }
          } else {
            reject(new Error('no available ports.'))
          }
        }

      isAdmin(options.protocol, function (isadmin) {
        // check for root/admin
        if (isadmin && !options.hasOwnProperty('lower')) {
          lower = test
          port = lower - 1
        }
    
        // skip 
        if (port === 0) port += 1
    
        // setup failure catchi ng
        server.on('error', next )
    
        // setup success catchin
        server.on('listening', done )
    
        // try listening, otherwise fail
        if (options.protocol === 'tcp') server.listen(port)
        else server.bind(port)
      })
  });

  // allow asynchronous callbacks instead of promises
  if (fn !== null) promise.then(fn.bind(this, null), fn.bind(this));

  // support promises
  return promise
}
