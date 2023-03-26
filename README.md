# dah-doh

a doh (dns-over-http) client which discriminate against no globalThis.

## Rationale

This package main purpose is to serve as a browser polyfill for node
built-in package `dns` and `dns/promises` (which is the promisified version of `dns`).

Since the DNS protocol runs over UDP protocol and webpages cannot access the underlying OS sockets,
`dah-doh` allows to perform DNS queries and NS lookups over the DOH protocol using mainly

- dns.google [`8.8.8.8`, `8.8.4.4`]
- cloudflare-dns.com/dns.cloudflare.net/one.one.one.one [`1.1.1.1`]

while providing the same module interface of node `dns` module.

## How to use

### Node: bundle polyfill

// TODO

### Node: 14+

When using es modules

```javascript
import 'doh-dah/polyfill'
import * as dns from 'doh-dah'
```

or in commonjs

```javascript
require('doh-dah/polyfill')
const dns = require('doh-dah')
```

### Node: 18+

When using es modules

```javascript
import * as dns from 'doh-dah'
```

or in commonjs

```javascript
const dns = require('doh-dah')
```

### Browser: ES6+ import map

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script type="importmap">
    {
      "imports": {
        "dns": "https://cdn.jsdelivr.net/npm/dah-doh@latest/dist/index.es.js"
      }
    }
  </script>
  <!-- rest of head -->
</head>
<body>
  <script async type="module">
    import * as dns from 'dns'
    await dns.promises.resolvePtr('8.8.8.8.in-addr.arpa')
      .then(([dnsGoogle]) => {
        console.assert(dnsGoogle === 'dns.google')
      })
  </script>

  <!-- your application -->
</body>
</html>
```

### Browser: ES5 support

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Polyfills -->
  <!-- https://caniuse.com/mdn-javascript_builtins_globalthis -->
  <script src="https://cdn.jsdelivr.net/npm/@ungap/global-this/min.js"></script>
  <!-- https://caniuse.com/promises -->
  <script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>
  <!-- https://caniuse.com/fetch -->
  <script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js"></script>
  <!-- End of polyfills -->

  <script src="https://cdn.jsdelivr.net/npm/dah-doh@latest/dist/es5/index.umd.js"></script>

  <!-- rest of head -->
</head>
<body>
  <script>
    globalThis.dahDoh
      .resolvePtr('8.8.8.8.in-addr.arpa', (err, [dnsGoogle]) => {
        console.assert(err === null)
        console.assert(dnsGoogle === 'dns.google')
      })
  </script>

  <!-- your application -->
</body>
</html>
```
