import {expect} from 'chai'
import type {MxRecord, SoaRecord} from 'dns'
import {describe, it} from 'mocha'
import {ResourceType, resolve} from '../core/index.js'

describe('resolve tests', () => {
  const tests: [{name: string, type: ResourceType}, (data: unknown) => boolean][] = [
    [
      {name: 'google.com', type: ResourceType.A},
      (data) => Array.isArray(data) && typeof data?.[0] === 'string'
    ],
    [
      {name: 'google.com', type: ResourceType.MX},
      (data) => {
        const mxRecord = (data as MxRecord[])[0]
        return mxRecord.priority === 10 && mxRecord.exchange.replace(/\.?$/, '') === 'smtp.google.com'
      }
    ],
    [
      {name: 'google.com', type: ResourceType.SOA},
      (data) => {
        const soaRecord = data as SoaRecord
        return soaRecord.nsname.replace(/\.?$/, '') === 'ns1.google.com'
          && soaRecord.hostmaster.replace(/\.?$/, '') === 'dns-admin.google.com'
          && soaRecord.serial === 517920828
          && soaRecord.refresh === 900
          && soaRecord.retry === 900
          && soaRecord.expire === 1800
          && soaRecord.minttl === 60
      }
    ],
    [
      {name: 'google.com', type: ResourceType.TXT},
      (data) => Array.isArray(data) && Array.isArray(data[0])
    ]
  ]

  tests.forEach(([{name, type}, expected]) => {
    const message = `for question ${name} and record type ${type ?? 'A'}, should get data ${JSON.stringify(expected)}`
    it(message, async () => {
      const data = await resolve(name, type)
      expect(expected(data))
    })
  })
})