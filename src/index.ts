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
import type {Records} from './core.js'
import * as promises from './promises.js'

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

function resolve(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve(hostname: string, rrtype: 'A', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve(hostname: string, rrtype: 'AAAA', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve(hostname: string, rrtype: 'ANY', callback: (err: NodeJS.ErrnoException | null, addresses: AnyRecord[]) => void): void
function resolve(hostname: string, rrtype: 'CNAME', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve(hostname: string, rrtype: 'MX', callback: (err: NodeJS.ErrnoException | null, addresses: MxRecord[]) => void): void
function resolve(hostname: string, rrtype: 'NAPTR', callback: (err: NodeJS.ErrnoException | null, addresses: NaptrRecord[]) => void): void
function resolve(hostname: string, rrtype: 'NS', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve(hostname: string, rrtype: 'PTR', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve(hostname: string, rrtype: 'SOA', callback: (err: NodeJS.ErrnoException | null, addresses: SoaRecord) => void): void
function resolve(hostname: string, rrtype: 'SRV', callback: (err: NodeJS.ErrnoException | null, addresses: SrvRecord[]) => void): void
function resolve(hostname: string, rrtype: 'TXT', callback: (err: NodeJS.ErrnoException | null, addresses: string[][]) => void): void
function resolve(
  hostname: string,
  rrtype: string,
  callback: (err: NodeJS.ErrnoException | null, addresses: Records) => void
): void
function resolve(
  hostname: string,
  rrtypeOrCallback: string | ((err: ErrorOrNull, addresses: string[]) => void),
  callback?: ResolveCallback
) {
  const cb = typeof rrtypeOrCallback === 'function' ? rrtypeOrCallback : callback
  const promise = typeof rrtypeOrCallback === 'function' ? promises.resolve(hostname) : promises.resolve(hostname, rrtypeOrCallback)
  promise.then((res) => (cb as (err: NodeJS.ErrnoException | null, address: Records) => void)?.(null, res))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((err) => cb?.(err, [] as any))
}

function resolve4(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve4(hostname: string, options: ResolveWithTtlOptions, callback: (err: NodeJS.ErrnoException | null, addresses: RecordWithTtl[]) => void): void
function resolve4(hostname: string, options: ResolveOptions, callback: (err: NodeJS.ErrnoException | null, addresses: string[] | RecordWithTtl[]) => void): void
function resolve4(
  hostname: string,
  optionsOrCallback: ResolveWithTtlOptions | ResolveOptions | ((err: ErrorOrNull, addresses: string[]) => void),
  callback?: ((err: ErrorOrNull, addresses: RecordWithTtl[]) => void) | ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void)
): void {
  const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback
  const promise = typeof optionsOrCallback !== 'function' ? promises.resolve4(hostname, optionsOrCallback) : promises.resolve4(hostname)
  promise.then((data) => {(cb as ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void) | undefined)?.(null, data)})
    .catch((err) => cb?.(err, []))
}

function resolve6(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void
function resolve6(hostname: string, options: ResolveWithTtlOptions, callback: (err: NodeJS.ErrnoException | null, addresses: RecordWithTtl[]) => void): void
function resolve6(hostname: string, options: ResolveOptions, callback: (err: NodeJS.ErrnoException | null, addresses: string[] | RecordWithTtl[]) => void): void
function resolve6(
  hostname: string,
  optionsOrCallback: ResolveOptions | ResolveWithTtlOptions | ((err: ErrorOrNull, addresses: string[]) => void),
  callback?: ((err: ErrorOrNull, addresses: RecordWithTtl[]) => void) | ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void)
) {
  const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback
  const promise = typeof optionsOrCallback !== 'function' ? promises.resolve6(hostname, optionsOrCallback) : promises.resolve6(hostname)
  promise.then((data) => {(cb as ((err: ErrorOrNull, addresses: string[] | RecordWithTtl[]) => void) | undefined)?.(null, data)})
    .catch((err) => cb?.(err, []))
}

function resolveCaa(hostname: string, callback: (err: NodeJS.ErrnoException | null, records: CaaRecord[]) => void): void {
  promises.resolveCaa(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}
function resolveCname(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
  promises.resolveCname(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

function resolveMx(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: MxRecord[]) => void): void {
  promises.resolveMx(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

function resolveNaptr(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: NaptrRecord[]) => void): void {
  promises.resolveNaptr(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

function resolveNs(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
  promises.resolveNs(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

function resolvePtr(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void {
  promises.resolvePtr(hostname)
    .then((data) => callback(null, data))
    .catch((err) => callback(err, []))
}

export {
  promises,
  resolve,
  resolve4,
  resolve6,
  resolveCaa,
  resolveCname,
  resolveMx,
  resolveNaptr,
  resolveNs,
  resolvePtr,
}
