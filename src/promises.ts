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
import {
  makeNoDataError,
  parsers,
  rawResolve,
  resolve as promisedResolve,
  ResourceType
} from './core/index.js'
import {ExtraResourceType} from './core/dns-json'

const {
  hasData,
  toAddresses,
  toCaaRecords,
  toMxRecords,
  toNaptrRecords,
  toRecordWithTtl,
  toStrings,
  toSoaRecord,
  toSrvRecords,
  toText,
  toAnyRecords
} = parsers

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
  return typeof rrtype === 'string' ? promisedResolve(hostname, rrtype as ResourceType) : promisedResolve(hostname)
}

const handleResolve4 = (hostname: string, options?: ResolveWithTtlOptions | ResolveOptions) => async (res: DnsJson) => {
  if (!hasData(res)) {
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

const handleResolve6 = (hostname: string, options?: ResolveWithTtlOptions | ResolveOptions) => async (res: DnsJson) => {
  if (!hasData(res)) {
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

async function resolveCaa(hostname: string): Promise<CaaRecord[]> {
  return rawResolve(hostname, ResourceType.CAA)
    .then(
      (res) => !hasData(res)
        ? Promise.reject(makeNoDataError(hostname, ResourceType.CAA))
        : toCaaRecords(res)
    )
}

async function resolveCname(hostname: string): Promise<string[]> {
  return rawResolve(hostname, ResourceType.CNAME)
    .then(
      (res) => !hasData(res)
        ? Promise.reject(makeNoDataError(hostname, ResourceType.CNAME))
        : toStrings(res)
    )
}

async function resolveMx(hostname: string): Promise<MxRecord[]> {
  return rawResolve(hostname, ResourceType.MX)
    .then(
      (res) => res.Answer?.[0] === undefined
        ? Promise.reject(makeNoDataError(hostname, ResourceType.MX))
        : toMxRecords(res)
    )
}

async function resolveNaptr(hostname: string): Promise<NaptrRecord[]> {
  return rawResolve(hostname, ResourceType.NAPTR)
    .then(
      (res) => hasData(res)
        ? toNaptrRecords(res)
        : Promise.reject(makeNoDataError(hostname, ResourceType.NAPTR))
    )
}

async function resolveNs(hostname: string): Promise<string[]> {
  return rawResolve(hostname, ResourceType.NS)
    .then(
      (res) => hasData(res)
        ? toAddresses(res)
        : Promise.reject(makeNoDataError(hostname, ResourceType.NS))
    )
}

async function resolvePtr(hostname: string): Promise<string[]> {
  return rawResolve(hostname, ResourceType.PTR)
    .then(
      (res) => hasData(res)
        ? toAddresses(res)
        : Promise.reject(makeNoDataError(hostname, ResourceType.PTR))
    )
}

async function resolveSoa(hostname: string): Promise<SoaRecord> {
  return rawResolve(hostname, ResourceType.SOA)
    .then(
      (res) => hasData(res)
        ? toSoaRecord(res)
        : Promise.reject(makeNoDataError(hostname, ResourceType.SOA))
    )
}

async function resolveSrv(hostname: string): Promise<SrvRecord[]> {
  return rawResolve(hostname, ResourceType.SRV)
    .then(
      (res) => hasData(res)
        ? toSrvRecords(res)
        : Promise.reject(makeNoDataError(hostname, ResourceType.SRV))
    )
}

async function resolveTxt(hostname: string): Promise<string[][]> {
  return rawResolve(hostname, ResourceType.TXT)
    .then(
      (res) => hasData(res)
        ? toText(res)
        : Promise.reject(makeNoDataError(hostname, ResourceType.TXT))
    )
}

async function resolveAny(hostname: string): Promise<AnyRecord[]> {
  return rawResolve(hostname, ExtraResourceType.ANY)
    .then(
      (res) => hasData(res)
        ? toAnyRecords(res)
        : Promise.reject(makeNoDataError(hostname, ExtraResourceType.ANY))
    )
}

export type {Records}
export {
  resolve,
  resolve4,
  resolve6,
  resolveCaa,
  resolveCname,
  resolveMx,
  resolveNaptr,
  resolveNs,
  resolvePtr,
  resolveSoa,
  resolveSrv,
  resolveTxt,
  resolveAny,
}
