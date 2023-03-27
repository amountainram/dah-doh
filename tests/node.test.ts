import {expect} from 'chai'
import * as dns from 'dns/promises'
import {describe, it} from 'mocha'

import {promises} from '../src'
import type {
  AnyNsRecord, AnyTxtRecord, SoaRecord
} from 'dns'

const {
  resolve4,
  resolve6,
  resolveCaa,
  resolveCname,
  resolveMx,
  resolveNaptr,
  resolveNs,
  resolvePtr,
  resolveSoa,
  resolveTxt,
  resolveAny,
  reverse,
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

  it('should resolve the start of authority', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.all<Promise<Partial<SoaRecord>>[]>([
      dns.resolveSoa(hostname),
      resolveSoa(hostname)
    ])

    // serial number depends on the zone hence is trimmed out
    // from this check since it could be different
    delete nativeRes.serial
    delete res.serial
    expect(res).to.deep.include(nativeRes)
  })

  it('should resolve TXT records', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.all([
      dns.resolveTxt(hostname),
      resolveTxt(hostname)
    ])

    expect(res).to.have.deep.members(nativeRes)
  })

  it('should resolve ANY records', async () => {
    const hostname = 'google.com'
    const [nativeRes, res] = await Promise.all([
      dns.resolveAny(hostname),
      resolveAny(hostname)
    ])

    const asCount = res.filter(({type}) => type === 'A').length
    const asNativeCount = nativeRes.filter(({type}) => type === 'A').length
    expect(asCount).to.be.equal(asNativeCount)

    const txt = res.filter(({type}) => type === 'TXT').map((item) => (item as AnyTxtRecord).entries).flat()
    const txtNative = nativeRes.filter(({type}) => type === 'TXT').map((item) => (item as AnyTxtRecord).entries).flat()
    // depends on server
    if(txtNative.length !== 0) {
      expect(txt).to.have.members(txtNative)
    } else {
      console.warn('no TXT returned')
    }

    const ns = res.filter(({type}) => type === 'NS').map((item) => (item as AnyNsRecord).value)
    const nsNative = nativeRes.filter(({type}) => type === 'NS').map((item) => (item as AnyNsRecord).value)
    expect(ns).to.have.members(nsNative)

    const mx = res.filter(({type}) => type === 'MX')
    const mxNative = nativeRes.filter(({type}) => type === 'MX')
    expect(mx).to.have.deep.members(mxNative)

    const caa = res.filter(({type}) => type === 'CAA')
    const caaNative = nativeRes.filter(({type}) => type as string === 'CAA')
    // depends on server
    if(caaNative.length !== 0) {
      expect(caa).to.have.deep.members(caaNative)
    } else {
      console.warn('no CAA returned')
    }
  })

  it('should reverse an ipv4', async () => {
    const ip = '8.8.8.8'
    const [nativeRes, res] = await Promise.all([
      dns.reverse(ip),
      reverse(ip)
    ])
    
    expect(res).to.have.members(nativeRes)
  })

  it('should reverse an ipv6', async () => {
    const ip = '2001:4860:4860::8888'
    const [nativeRes, res] = await Promise.all([
      dns.reverse(ip),
      reverse(ip)
    ])
    
    expect(res).to.have.members(nativeRes)
  })
})