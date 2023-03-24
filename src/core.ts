import type {
  AnyRecord,
  CaaRecord,
  MxRecord,
  NaptrRecord,
  SoaRecord,
  SrvRecord
} from 'dns'
import {
  toCaaRecords,
  toMxRecords, toSoaRecord, toSrvRecords, toStrings, toText
} from './parsers'
import {isDnsJson} from './validation'

type Hostname = 'dns.google/resolve' | 'cloudflare-dns.com/dns-query'

enum ResourceType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  CAA = 'CAA',
  MX = 'MX',
  NS = 'NS',
  SOA = 'SOA',
  SRV = 'SRV',
  TXT = 'TXT'
}

enum Protocol {
  HTTP = 'http',
  HTTPS = 'https'
}

enum AcceptedTypes {
  JSON = 'application/json',
  DNSJSON = 'application/dns-json'
}

enum DnsResponseCode {
  // No error condition
  NoError = 0,
  // Format error: -  The name server was
  //                  unable to interpret the query.
  FormatError = 1,
  // Server failure:  The name server was
  //                  unable to process this query due to a
  //                  problem with the name server.
  ServerFailure = 2,
  // Name Error:      Meaningful only for
  //                  responses from an authoritative name
  //                  server, this code signifies that the
  //                  domain name referenced in the query does
  //                  not exist.
  NameError = 3,
  // Not Implemented: The name server does
  //                  not support the requested kind of query.
  NotImplemented = 4,
  // Refused:       - The name server refuses to
  //                  perform the specified operation for
  //                  policy reasons.  For example, a name
  //                  server may not wish to provide the
  //                  information to the particular requester,
  //                  or a name server may not wish to perform
  //                  a particular operation (e.g., zone
  //                  transfer) for particular data.
  Refused = 5,
}

interface QueryOptions {
  protocol: Protocol
  server: Hostname | string
  fetch: RequestInit & {method: string}
}

interface Question {
  name: string,
  type: number
}

interface Answer {
  name: string
  type: number,
  TTL: number,
  data: string
}

interface DnsJson {
  Status: DnsResponseCode,
  TC: boolean,
  RD: boolean,
  RA: boolean,
  AD: boolean,
  CD: boolean,
  Question: Question[]
  Answer?: Answer[]
  Authority?: Answer[]
  Comment?: string
}

type Records = string[] | CaaRecord[] | MxRecord[] | NaptrRecord[] | SoaRecord | SrvRecord[] | string[][] | AnyRecord[]

const acceptedTypes = Object.values(AcceptedTypes)

const defaultOptions = {
  server: 'dns.google/resolve',
  protocol: Protocol.HTTPS,
  fetch: {
    method: 'GET',
    headers: {
      'accept': AcceptedTypes.JSON
    }
  }
}

const fetchOptionsPerHostname: Record<Hostname, ResponseInit> = {
  'dns.google/resolve': {
    headers: {
      'accept': AcceptedTypes.JSON
    }
  },
  'cloudflare-dns.com/dns-query': {
    headers: {
      'accept': AcceptedTypes.DNSJSON
    }
  }
}

const resolveOptions = (options: Partial<QueryOptions>): QueryOptions => {
  const server = options.server ?? defaultOptions.server
  const fetchOptions = fetchOptionsPerHostname[server as Hostname]

  return {
    protocol: options.protocol ?? defaultOptions.protocol,
    server: options.server ?? defaultOptions.server,
    fetch: {
      ...fetchOptions,
      ...options,
      method: options.fetch?.method ?? defaultOptions.fetch.method,
      headers: options.fetch?.headers ?? defaultOptions.fetch.headers
    }
  }
}

const getContentType = (input: string) => input.split(';')[0]

const fetch = async (info: URL, init: RequestInit & {method: string}): Promise<DnsJson> =>
  globalThis.fetch(info, init)
    .then((res) => res.ok ? res : Promise.reject(new TypeError(`Cannot ${init.method} ${info.href}: ${res.status} ${res.statusText}`)))
    .then((response) => {
      const contentType = response.headers.get('content-type')

      if(contentType && acceptedTypes.includes(getContentType(contentType) as AcceptedTypes)) {
        return response.json()
      }

      return Promise.reject(new TypeError('Wrong content-type header'))
    })
    .then((json) => isDnsJson(json))
    .then((result) => 'error' in result ? Promise.reject(new TypeError(result.message)) : result)

async function rawResolve(hostname: string, resourceType: ResourceType, options?: Partial<QueryOptions>): Promise<DnsJson> {
  const {protocol, fetch: fetchOptions, server} = resolveOptions(options ?? defaultOptions)
  const {protocol: currentProtocol} = server.match(/^(<?protocol>[^:]+):\/\//)?.groups ?? {}
  const info = currentProtocol !== undefined ? server : `${protocol}://${server}`

  try {
    const url = new URL(info)
    url.searchParams.set('name', hostname)
    if(resourceType !== ResourceType.A) {
      url.searchParams.set('type', resourceType)
    }

    return fetch(url, fetchOptions)
  } catch {
    return Promise.reject(
      new TypeError(`Cannot create a URL from ${info}`)
    )
  }
}

async function resolve(name: string, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType, options?: Partial<QueryOptions>): Promise<Records>
async function resolve(name: string, resourceType: ResourceType.A, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.AAAA, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.CAA, options?: Partial<QueryOptions>): Promise<CaaRecord[]>
async function resolve(name: string, resourceType: ResourceType.CNAME, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.MX, options?: Partial<QueryOptions>): Promise<MxRecord[]>
async function resolve(name: string, resourceType: ResourceType.NS, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.SOA, options?: Partial<QueryOptions>): Promise<SoaRecord>
async function resolve(name: string, resourceType: ResourceType.SRV, options?: Partial<QueryOptions>): Promise<SrvRecord[]>
async function resolve(name: string, resourceType: ResourceType.TXT, options?: Partial<QueryOptions>): Promise<string[][]>
async function resolve(
  name: string, resourceType?: ResourceType | Partial<QueryOptions> | undefined, options?: Partial<QueryOptions> | undefined
): Promise<Records> {
  let incomingOptions = options
  let rt = ResourceType.A

  if(typeof resourceType === 'object') {
    incomingOptions = resourceType
  }
  if(resourceType && typeof resourceType !== 'object') {
    rt = resourceType
  }

  let pd: (dnsJson: DnsJson) => Records
  switch (rt) {
  case ResourceType.MX:
    pd = toMxRecords
    break
  case ResourceType.SOA:
    pd = toSoaRecord
    break
  case ResourceType.SRV:
    pd = toSrvRecords
    break
  case ResourceType.TXT:
    pd = toText
    break
  case ResourceType.CAA:
    pd = toCaaRecords
    break
  case ResourceType.A:
  case ResourceType.AAAA:
  case ResourceType.CNAME:
  case ResourceType.NS:
  default:
    pd = toStrings
    break
  }
  return rawResolve(name, rt, incomingOptions)
    .then(pd)
}

export type {Hostname, DnsJson, Records}
export {ResourceType, rawResolve, resolve, DnsResponseCode}
