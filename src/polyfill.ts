import fetch from 'node-fetch'

if (!globalThis.fetch) {
  // @ts-expect-error Type 'Request' in `node-fetch` is missing the following properties from type 'Request': size, buffer
  globalThis.fetch = fetch
}
