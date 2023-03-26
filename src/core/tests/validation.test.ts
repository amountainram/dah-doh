import {expect} from 'chai'
import {describe, it} from 'mocha'

import type {DnsJson} from '../dns-json'
import type {TryIntoError} from '../validation'
import {isDnsJson} from '../validation.js'

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
