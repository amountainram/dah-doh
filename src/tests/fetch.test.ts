import {expect} from 'chai'
import type {MxRecord, SoaRecord} from 'dns'
import {describe, it} from 'mocha'
import nodeFetch from 'node-fetch'

import type {DnsJson} from '../core'
import {ResourceType} from '../core'
import {resolve} from '../core'
import type {TryIntoError} from '../validation'
import {isDnsJson} from '../validation'

describe('json to dns response validation', () => {
  const isDnsJsonTestCases: [unknown, Omit<TryIntoError, 'input'> | DnsJson][] = [
    [null, {error: true, message: 'input must be an object'}],
    [undefined, {error: true, message: 'input must be an object'}],
    [0, {error: true, message: 'input must be an object'}],
    [true, {error: true, message: 'input must be an object'}],
    ['', {error: true, message: 'input must be an object'}],
    [{}, {error: true, message: 'DNS response status is not valid or not specified'}],
    [{Status: '1'}, {error: true, message: 'DNS response status is not valid or not specified'}],
    [{Status: 6}, {error: true, message: 'DNS response status is not valid or not specified'}],
    [{Status: 1}, {error: true, message: 'DNS response truncation flag is not valid'}],
    [{Status: 1, TC: ''}, {error: true, message: 'DNS response truncation flag is not valid'}],
    [{Status: 1, TC: false}, {error: true, message: 'DNS response recursion desired flag is not valid'}],
    [
      {Status: 1, TC: false, RD: ''},
      {error: true, message: 'DNS response recursion desired flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false},
      {error: true, message: 'DNS response recursion available flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false, RA: ''},
      {error: true, message: 'DNS response recursion available flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false, RA: true},
      {error: true, message: 'DNS response authenticated data flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false, RA: true, AD: ''},
      {error: true, message: 'DNS response authenticated data flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false, RA: true, AD: true},
      {error: true, message: 'DNS response checking disabled flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false, RA: true, AD: true, CD: ''},
      {error: true, message: 'DNS response checking disabled flag is not valid'}
    ],
    [
      {Status: 1, TC: false, RD: false, RA: true, AD: true, CD: false},
      {error: true, message: 'DNS response Question must be an array'}
    ],
    [
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: null
      },
      {error: true, message: 'DNS response Question must be an array'}
    ],
    [
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: [{}]
      },
      {error: true, message: 'DNS response Question is not well formatted'}
    ],
    [
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: []
      },
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: [],
      }
    ],
    [
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: [],
        Answer: [{}]
      },
      {error: true, message: 'DNS response Answer is not well formatted'}
    ],
    [
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: [],
        Authority: [{}]
      },
      {error: true, message: 'DNS response Authority is not well formatted'}
    ],
    [
      {
        Status: 0,
        TC: false,
        RD: false,
        RA: true,
        AD: true,
        CD: false,
        Question: [{name: '', type: 0}],
        Comment: []
      },
      {
        error: true,
        message: 'DNS response Comment must be a string or undefined',
      }
    ]
  ]

  isDnsJsonTestCases.forEach(([input, expected]) => {
    const message = `should ${'error' in expected ? 'not ': ''}validate ${JSON.stringify(input)} `
      + `returning ${'error' in expected ? `the error message "${expected.message}"` : 'the object itself'}`
    it(message, () => {
      expect(isDnsJson(input)).to.deep.include(expected)
    })
  })
})

describe('fetch test', () => {
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