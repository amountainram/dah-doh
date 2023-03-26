import type {
  AnyRecord,
  CaaRecord,
  MxRecord,
  NaptrRecord,
  SoaRecord,
  SrvRecord
} from 'dns'
import type {DnsJson, ExtraResourceType} from './dns-json'
import * as parsers from './parsers.js'
import {ResourceType} from './dns-json.js'

type Hostname = 'dns.google/resolve' | 'cloudflare-dns.com/dns-query'

enum Protocol {
  HTTP = 'http',
  HTTPS = 'https'
}

enum AcceptedTypes {
  JSON = 'application/json',
  DNSJSON = 'application/dns-json'
}

interface QueryOptions {
  protocol: Protocol
  server: Hostname | string
  fetch: RequestInit & {method: string}
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
        return response.json() as Promise<DnsJson>
      }

      return Promise.reject(new TypeError('Wrong content-type header'))
    })

async function rawResolve(hostname: string, resourceType: ResourceType | ExtraResourceType, options?: Partial<QueryOptions>): Promise<DnsJson> {
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
    pd = parsers.toMxRecords
    break
  case ResourceType.SOA:
    pd = parsers.toSoaRecord
    break
  case ResourceType.SRV:
    pd = parsers.toSrvRecords
    break
  case ResourceType.TXT:
    pd = parsers.toText
    break
  case ResourceType.CAA:
    pd = parsers.toCaaRecords
    break
  case ResourceType.A:
  case ResourceType.AAAA:
  case ResourceType.CNAME:
  case ResourceType.NS:
  default:
    pd = parsers.toStrings
    break
  }
  return rawResolve(name, rt, incomingOptions)
    .then(pd)
}

export type {Hostname, DnsJson, Records}
export * from './errors.js'
export {
  rawResolve,
  ResourceType,
  resolve,
  parsers
}
