import type {DnsJson} from './core.js'
import {DnsResponseCode, ResourceType} from './core.js'
import type {Answer} from './parsers.js'

interface TryIntoError {
  error: true,
  message: string
  input: unknown
}

const isObject = (input: unknown): input is object => input !== null && typeof input === 'object'

const validateItems = <T>(array: unknown[], fn: (input: unknown) => input is T): array is T[] => {
  const iter = array.values()
  let error = false
  let {done = true, value} = iter.next()
  while(!(done || error)) {
    if(!fn(value)) {
      error = true
    }

    const nextValue = iter.next()
    done = nextValue.done ?? true
    value  = nextValue.value
  }

  return !error
}

const isArrayOfAnswers = <T extends object>(input: T, field: unknown, fieldName: 'Answer' | 'Authority'): TryIntoError | undefined => {
  if(!Array.isArray(field)) {
    return {
      error: true,
      message: `DNS response ${fieldName} must be an array or undefined`,
      input
    }
  }

  if(
    !validateItems(
      field,
      (value): value is Answer => 
        value !== null
          && typeof value === 'object'
          && 'name' in value
          && typeof value.name === 'string'
          && 'type' in value
          && typeof value.type === 'number'
          && 'TTL' in value
          && typeof value.TTL === 'number'
          && 'data' in value
          && typeof value.data === 'string'
    )) {
    return {
      error: true,
      message: `DNS response ${fieldName} is not well formatted`,
      input
    }
  }
}

const isDnsJson = (input: unknown): DnsJson | TryIntoError => {
  const error = {error: true as const, input, message: ''}
  if(input === null || typeof input !== 'object') {
    error.message = 'input must be an object'
    return error
  }

  if(!('Status' in input) || typeof input.Status !== 'number' || input.Status < 0 || input.Status > DnsResponseCode.Refused) {
    error.message = 'DNS response status is not valid or not specified'
    return error
  }

  if(!('TC' in input) || typeof input.TC !== 'boolean') {
    return {
      error: true,
      message: 'DNS response truncation flag is not valid',
      input
    }
  }

  if(!('RD' in input) || typeof input.RD !== 'boolean') {
    return {
      error: true,
      message: 'DNS response recursion desired flag is not valid',
      input
    }
  }

  if(!('RA' in input) || typeof input.RA !== 'boolean') {
    return {
      error: true,
      message: 'DNS response recursion available flag is not valid',
      input
    }
  }

  if(!('AD' in input) || typeof input.AD !== 'boolean') {
    return {
      error: true,
      message: 'DNS response authenticated data flag is not valid',
      input
    }
  }

  if(!('CD' in input) || typeof input.CD !== 'boolean') {
    return {
      error: true,
      message: 'DNS response checking disabled flag is not valid',
      input
    }
  }

  if(
    !('Question' in input && Array.isArray(input.Question))
  ) {
    return {
      error: true,
      message: 'DNS response Question must be an array',
      input
    }
  } 
  
  if (
    !validateItems(
      input.Question,
      (value): value is DnsJson['Question'] =>
        isObject(value)
          && 'name' in value
          && typeof value.name === 'string'
          && 'type' in value
          && typeof value.type === 'number'
    )
  ) {
    return {
      error: true,
      message: 'DNS response Question is not well formatted',
      input
    }
  }

  if('Answer' in input) {
    const validationResult = isArrayOfAnswers(input, input.Answer, 'Answer')
    if(validationResult) {
      return validationResult
    }
  }

  if('Authority' in input) {
    const validationResult = isArrayOfAnswers(input, input.Authority, 'Authority')
    if(validationResult) {
      return validationResult
    }
  }

  if('Comment' in input && typeof input.Comment !== 'string') {
    return {
      error: true,
      message: 'DNS response Comment must be a string or undefined',
      input,
    }
  }

  return input as DnsJson

}

const fromNumberToResourceType = (num: number): ResourceType | undefined => {
  switch (num) {
  case 1:
    return ResourceType.A
  case 2:
    return ResourceType.NS
  case 5:
    return ResourceType.CNAME
  case 6:
    return ResourceType.SOA
  case 12:
    return ResourceType.PTR
  case 15:
    return ResourceType.MX
  case 16:
    return ResourceType.TXT
  case 28:
    return ResourceType.AAAA
  case 33:
    return ResourceType.SRV
  case 35:
    return ResourceType.NAPTR
  case 257:
    return ResourceType.CAA
  default:
    return undefined
  }
}

const fromResourceTypeToNumber = (rt: ResourceType): number | undefined => {
  switch (rt) {
  case ResourceType.A:
    return 1
  case ResourceType.AAAA:
    return 28
  case ResourceType.CAA:
    return 257
  case ResourceType.CNAME:
    return 5
  case ResourceType.MX:
    return 15
  case ResourceType.NAPTR:
    return 35
  case ResourceType.NS:
    return 2
  case ResourceType.PTR:
    return 12
  case ResourceType.SOA:
    return 6
  case ResourceType.SRV:
    return 33
  case ResourceType.TXT:
    return 16
  default:
    return undefined
  }
}

const isResourceType = (input: unknown): input is ResourceType =>
  typeof input === 'string' && Object.values(ResourceType).includes(input as ResourceType)

export type {TryIntoError}
export {isDnsJson, isResourceType, fromNumberToResourceType, fromResourceTypeToNumber}
