import {before} from 'mocha'

before(async () => {
  if (typeof globalThis.fetch === 'undefined') {
    await import('../src/polyfill')
  }
})
