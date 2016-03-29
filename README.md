# next-port

grab next available port.

## usage

```javascript
var nextPort = require('next-port')

// simple usage; check all ports
// (only check <=1024 if root/admin)
nextPort(function (err, port) { /* ... */ })

// specify some options
nextPort({ /* options */ }, function (err, port) { /* ... */ })
```

## options

 - `lower`: the lower bound to start scan from. (default: 1 if root/admin, 1024 if not)
 - `higher`: the higher bound to stop scan at. (default: 65535)
 - `protocol`: TCP or UDP.
