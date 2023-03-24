import {expect} from 'chai'
import * as dns from 'dns/promises'
import {describe, it} from 'mocha'
import nodeFetch from 'node-fetch'

import {promises} from '../lib'

const {
  resolve4,
  resolve6,
  resolveCaa,
  resolveCname,
  resolveMx
} = promises

describe.only('node impl vs this lib impl', () => {
  const {fetch: originalFetch} = globalThis
  before(async () => {
    if (typeof originalFetch === 'undefined') {
      Object.defineProperty(globalThis, 'fetch', {configurable: true, writable: true, value: nodeFetch})
    }
  })
  after(() => {
    if(typeof originalFetch === 'undefined') {
      Object.defineProperty(globalThis, 'fetch', {configurable: true, writable: true, value: originalFetch})
    }
  })

  it('test ipv4 response', async () => {
    const hostname = 'dns.google'
    const [nativeRes, res] = await Promise.all([
      dns.resolve4(hostname),
      resolve4(hostname)
    ])
    expect(res).to.have.members(nativeRes)
  })

  it('test ipv6 response', async () => {
    const hostname = 'dns.google'
    const [nativeRes, res] = await Promise.all([
      dns.resolve6(hostname),
      resolve6(hostname)
    ])
    expect(res).to.have.members(nativeRes)
  })

  it('should resolve a caa', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.all([
      dns.resolveCaa(hostname),
      resolveCaa(hostname)
    ])
    expect(res).to.have.deep.members(nativeRes)
  })

  it('should fail while resolving a cname', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.allSettled([
      dns.resolveCname(hostname),
      resolveCname(hostname)
    ])

    expect(
      {...(res as PromiseRejectedResult).reason}
    ).to.eql({...(nativeRes as PromiseRejectedResult).reason})
  })

  it('should resolve a smtp server', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.all([
      dns.resolveMx(hostname),
      resolveMx(hostname)
    ])

    expect(res).to.have.deep.members(nativeRes)
  })
})