# next-port

grab next available TCP port.

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

 - `lower`: the lower bound to start scan from. (default: 1024 if root/admin, 1 if not)
 - `higher`: the higher bound to stop scan at. (default: 65535)
