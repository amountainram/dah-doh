import type {
  AnyRecord,
  CaaRecord,
  MxRecord,
  NaptrRecord,
  RecordWithTtl,
  ResolveOptions,
  ResolveWithTtlOptions,
  SoaRecord,
  SrvRecord
} from 'dns'
import type {DnsJson, Records} from './core'
import {rawResolve, ResourceType} from './core'
import {resolve as promisedResolve} from './core'
import {makeNoDataError} from './errors'
import {
  toCaaRecords, toMxRecords, toRecordWithTtl, toStrings
} from './parsers'
import {isResourceType} from './validation'

interface Exception {
  errno: number | undefined
  code: string | undefined
  hostname: string | undefined
  syscall: string | undefined
}

class ErrnoException extends Error implements Exception {
  errno: number | undefined
  code: string | undefined
  hostname: string | undefined
  syscall: string | undefined

  constructor(message?: string, opts?: Exception) {
    super(message)

    this.errno = opts?.errno
    this.code = opts?.code
    this.hostname = opts?.hostname
    this.syscall = opts?.syscall
  }
}

type ErrorOrNull = ErrnoException | null

type ResolveCallback =
  | ((err: ErrorOrNull, addresses: string[]) => void)
  | ((err: ErrorOrNull, addresses: MxRecord[]) => void)
  | ((err: ErrorOrNull, addresses: NaptrRecord[]) => void)
  | ((err: ErrorOrNull, addresses: SoaRecord) => void)
  | ((err: ErrorOrNull, addresses: SrvRecord[]) => void)
  | ((err: ErrorOrNull, addresses: string[][]) => void)
  | ((err: ErrorOrNull, addresses: AnyRecord[]) => void)

async function resolve(hostname: string): Promise<string[]>
async function resolve(hostname: string, rrtype: 'A'): Promise<string[]>
async function resolve(hostname: string, rrtype: 'AAAA'): Promise<string[]>
async function resolve(hostname: string, rrtype: 'ANY'): Promise<AnyRecord[]>
async function resolve(hostname: string, rrtype: 'CNAME'): Promise<string[]>
async function resolve(hostname: string, rrtype: 'MX'): Promise<MxRecord[]>
async function resolve(hostname: string, rrtype: 'NAPTR'): Promise<NaptrRecord[]>
async function resolve(hostname: string, rrtype: 'NS'): Promise<string[]>
async function resolve(hostname: string, rrtype: 'PTR'): Promise<string[]>
async function resolve(hostname: string, rrtype: 'SOA'): Promise<SoaRecord>
async function resolve(hostname: string, rrtype: 'SRV'): Promise<SrvRecord[]>
async function resolve(hostname: string, rrtype: 'TXT'): Promise<string[][]>
async function resolve(hostname: string, rrtype: string): Promise<Records>
async function resolve(hostname: string, rrtype?: string | undefined): Promise<Records> {
  return isResourceType(rrtype) ? promisedResolve(hostname, rrtype) : promisedResolve(hostname)
}

function resolveSync(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolveSync(hostname: string, rrtype: 'A', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolveSync(hostname: string, rrtype: 'AAAA', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolveSync(hostname: string, rrtype: 'ANY', callback: (err: NodeJS.ErrnoException | null, addresses: AnyRecord[]) => void): void
function resolveSync(hostname: string, rrtype: 'CNAME', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolveSync(hostname: string, rrtype: 'MX', callback: (err: NodeJS.ErrnoException | null, addresses: MxRecord[]) => void): void
function resolveSync(hostname: string, rrtype: 'NAPTR', callback: (err: NodeJS.ErrnoException | null, addresses: NaptrRecord[]) => void): void
function resolveSync(hostname: string, rrtype: 'NS', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolveSync(hostname: string, rrtype: 'PTR', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolveSync(hostname: string, rrtype: 'SOA', callback: (err: NodeJS.ErrnoException | null, addresses: SoaRecord) => void): void
function resolveSync(hostname: string, rrtype: 'SRV', callback: (err: NodeJS.ErrnoException | null, addresses: SrvRecord[]) => void): void
function resolveSync(hostname: string, rrtype: 'TXT', callback: (err: NodeJS.ErrnoException | null, addresses: string[][]) => void): void
function resolveSync(
  hostname: string,
  rrtype: string,
  callback: (err: NodeJS.ErrnoException | null, addresses: Records) => void
): void
function resolveSync(
  hostname: string,
  rrtypeOrCallback: string | ((err: ErrorOrNull, addresses: string[]) => void),
  callback?: ResolveCallback
) {
  const cb = typeof rrtypeOrCallback === 'function' ? rrtypeOrCallback : callback
  const promise = typeof rrtypeOrCallback === 'function' ? resolve(hostname) : resolve(hostname, rrtypeOrCallback)
  promise.then((res) => (cb as (err: NodeJS.ErrnoException | null, address: Records) => void)?.(null, res))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((err) => cb?.(err, [] as any))
}

const handleResolve4 = (hostname: string, options?: ResolveWithTtlOptions | ResolveOptions) => async (res: DnsJson) => {
  if (res.Answer?.[0] === undefined) {
    return Promise.reject(makeNoDataError(hostname, ResourceType.A))
  }

  if (options?.ttl === true) {
    return toRecordWithTtl(res)
  } else  {
    return toStrings(res)
  }
}

async function resolve4(hostname: string): Promise<string[]>
async function resolve4(hostname: string, options: ResolveWithTtlOptions): Promise<RecordWithTtl[]>
async function resolve4(hostname: string, options: ResolveOptions): Promise<string[] | RecordWithTtl[]>
async function resolve4(hostname: string, options?: ResolveWithTtlOptions | ResolveOptions): Promise<string[] | RecordWithTtl[]> {
  return rawResolve(hostname, ResourceType.A)
    .then(handleResolve4(hostname, options))
}

function resolve4Sync(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve4Sync(hostname: string, options: ResolveWithTtlOptions, callback: (err: NodeJS.ErrnoException | null, addresses: RecordWithTtl[]) => void): void
function resolve4Sync(hostname: string, options: ResolveOptions, callback: (err: NodeJS.ErrnoException | null, addresses: string[] | RecordWithTtl[]) => void): void
function resolve4Sync(
  hostname: string,
  optionsOrCallback: ResolveWithTtlOptions | ResolveOptions | ((err: ErrorOrNull, addresses: string[]) => void),
  callback?: ((err: ErrorOrNull, addresses: RecordWithTtl[]) => void) | ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void)
): void {
  const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback
  const promise = typeof optionsOrCallback !== 'function' ? resolve4(hostname, optionsOrCallback) : resolve4(hostname)
  promise.then((data) => {(cb as ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void) | undefined)?.(null, data)})
    .catch((err) => cb?.(err, []))
}

const handleResolve6 = (hostname: string, options?: ResolveWithTtlOptions | ResolveOptions) => async (res: DnsJson) => {
  if (res.Answer?.[0] === undefined) {
    return Promise.reject(makeNoDataError(hostname, ResourceType.AAAA))
  }

  if (options?.ttl === true) {
    return toRecordWithTtl(res)
  } else  {
    return toStrings(res)
  }
}

async function resolve6(hostname: string): Promise<string[]>
async function resolve6(hostname: string, options: ResolveWithTtlOptions): Promise<RecordWithTtl[]>
async function resolve6(hostname: string, options: ResolveOptions): Promise<string[] | RecordWithTtl[]>
async function resolve6(hostname: string, options?: ResolveOptions | ResolveWithTtlOptions): Promise<string[] | RecordWithTtl[]> {
  return rawResolve(hostname, ResourceType.AAAA)
    .then(handleResolve6(hostname, options))
}

function resolve6Sync(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve6Sync(hostname: string, options: ResolveWithTtlOptions, callback: (err: NodeJS.ErrnoException | null, addresses: RecordWithTtl[]) => void): void
function resolve6Sync(hostname: string, options: ResolveOptions, callback: (err: NodeJS.ErrnoException | null, addresses: string[] | RecordWithTtl[]) => void): void
function resolve6Sync(
  hostname: string,
  optionsOrCallback: ResolveOptions | ResolveWithTtlOptions | ((err: ErrorOrNull, addresses: string[]) => void),
  callback?: ((err: ErrorOrNull, addresses: RecordWithTtl[]) => void) | ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void)
) {
  const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback
  rawResolve(hostname, ResourceType.AAAA)
    .then(handleResolve6(hostname, typeof optionsOrCallback !== 'function' ? optionsOrCallback : undefined))
    .then((data) => {(cb as ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void) | undefined)?.(null, data)})
    .catch((err) => cb?.(err, []))
}

async function resolveCaa(hostname: string): Promise<CaaRecord[]> {
  return rawResolve(hostname, ResourceType.CAA)
    .then(
      (res) => res.Answer?.[0] === undefined
        ? Promise.reject(makeNoDataError(hostname, ResourceType.CAA))
        : toCaaRecords(res)
    )
}

function resolveCaaSync(hostname: string, callback: (err: NodeJS.ErrnoException | null, records: CaaRecord[]) => void): void {
  resolveCaa(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

async function resolveCname(hostname: string): Promise<string[]> {
  return rawResolve(hostname, ResourceType.CNAME)
    .then(
      (res) => res.Answer?.[0] === undefined
        ? Promise.reject(makeNoDataError(hostname, ResourceType.CNAME))
        : toStrings(res)
    )
}

function resolveCnameSync(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
  resolveCname(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

async function resolveMx(hostname: string): Promise<MxRecord[]> {
  return rawResolve(hostname, ResourceType.MX)
    .then(
      (res) => res.Answer?.[0] === undefined
        ? Promise.reject(makeNoDataError(hostname, ResourceType.MX))
        : toMxRecords(res)
    )
}

function resolveMxSync(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: MxRecord[]) => void): void {
  resolveMx(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

const promises = {
  resolve,
  resolve4,
  resolve6,
  resolveCaa,
  resolveCname,
  resolveMx,
}

export {
  promises,
  resolveSync as resolve,
  resolve4Sync as resolve4,
  resolve6Sync as resolve6,
  resolveCaaSync as resolveCaa,
  resolveCnameSync as resolveCname,
  resolveMxSync as resolveMx
}
