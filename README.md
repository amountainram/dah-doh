# dah-doh

a doh (dns-over-http) client which discriminate against no globalThis

## ES5 support

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
