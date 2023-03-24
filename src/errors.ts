import type {ResourceType} from './core'
import {DnsResponseCode} from './core'

interface ErrorCtx {
  resourceType: ResourceType
  code: DnsResponseCode | 'NODATA'
  hostname: string
}

interface DnsError {
  errno?: number | undefined
  code?: string | undefined
  syscall?: string | undefined
  hostname?: string | undefined
}

const toString = (input: DnsResponseCode | 'NODATA'): string => {
  if(typeof input === 'string') {
    return input
  }

  switch (input) {
  case DnsResponseCode.ServerFailure:
    return 'SERVFAIL'
  default:
    return ''
  }
}

const capitalize = (input: string) => {
  const lc = input.toLowerCase()
  return `${lc.substring(0, 1).toUpperCase()}${lc.substring(1)}`
}

const makeError = (ctx: ErrorCtx): DnsError & Error => {
  const syscall = `query${capitalize(ctx.resourceType)}`

  return Object.assign(new Error(''), {
    errno: undefined,
    code: `E${toString(ctx.code)}`,
    syscall,
    hostname: ctx.hostname
  })
}

const makeNoDataError = (hostname: string, resourceType: ResourceType): DnsError & Error =>
  makeError({hostname, code: 'NODATA', resourceType})

export {makeError, makeNoDataError}
