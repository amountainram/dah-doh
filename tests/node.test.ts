import {expect} from 'chai'
import * as dns from 'dns/promises'
import {describe, it} from 'mocha'

import {promises} from '../src'

const {
  resolve4,
  resolve6,
  resolveCaa,
  resolveCname,
  resolveMx,
  resolveNaptr,
  resolveNs,
  resolvePtr
} = promises

describe('node impl vs this lib impl', () => {
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

  it('should resolve a naptr address', async () => {
    const hostname = '4.4.2.2.3.3.5.6.8.1.4.4.e164.arpa'
    const [nativeRes, res] = await Promise.all([
      dns.resolveNaptr(hostname),
      resolveNaptr(hostname)
    ])

    expect(res).to.have.deep.members(nativeRes)
  })

  it('should resolve an ns address', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.all([
      dns.resolveNs(hostname),
      resolveNs(hostname)
    ])

    expect(res).to.have.members(nativeRes)
  })

  it('should reverse a ptr to a name', async () => {
    const hostname = '8.8.8.8.in-addr.arpa'
    const [nativeRes, res] = await Promise.all([
      dns.resolvePtr(hostname),
      resolvePtr(hostname)
    ])

    expect(res).to.have.members(nativeRes)
  })
})