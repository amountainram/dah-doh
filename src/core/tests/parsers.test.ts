import {expect} from 'chai'
import {describe, it} from 'mocha'
import {reverse4, reverse6} from '../parsers'

describe('ip reverse', () => {
  const ipv4Reversing: [string, string][] = [
    ['8.8.4.4', '4.4.8.8.in-addr.arpa'],
    ['127.0.0.1', '1.0.0.127.in-addr.arpa'],
  ]

  ipv4Reversing.forEach(([input, output]) => {
    const message = `should reverse '${input}' into '${output}'`
    it(message, () => {
      expect(reverse4(input)).to.equal(output)
    })
  })

  const ipv6Reversing: [string, string][] = [
    ['::1', '1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.ip6.arpa'],
    ['2002:7f00:1::', '0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.0.0.0.0.0.f.7.2.0.0.2.ip6.arpa'],
    ['2001:db8::1', '1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa']
  ]

  ipv6Reversing.forEach(([input, output]) => {
    const message = `should reverse '${input}' into '${output}'`
    it(message, () => {
      expect(reverse6(input)).to.equal(output)
    })
  })
})