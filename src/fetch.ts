import type {
  MxRecord, SoaRecord, SrvRecord
} from 'dns'

type Hostname = 'dns.google/resolve' | 'cloudflare-dns.com/dns-query'

enum ResourceType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  MX = 'MX',
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
  // resourceType?: ResourceType
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

interface TryIntoError {
  error: true,
  message: string
  input: unknown
}

const resouceTypes = Object.values(ResourceType)

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

const isResourceType = (input: unknown): input is ResourceType =>
  typeof input === 'string' && resouceTypes.includes(input as ResourceType)

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
      (value): value is Question =>
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

const getData = ({data}: {data: string}) => data

const getDataAndSplit = (entry: {data: string}) => getData(entry).split(' ')

const mxRecordReducer = (mx: Partial<MxRecord>, item: string, idx: number) => {
  switch (idx) {
  case 0:
    mx.priority = Number.parseInt(item)
    break
  case 1:
    mx.exchange = item
    break
  }
  return mx
}

const soaRecordReducer = (soa: Partial<SoaRecord>, item: string, idx: number) => {
  switch (idx) {
  case 0:
    soa.nsname = item
    break
  case 1:
    soa.hostmaster = item
    break
  case 2:
    soa.serial = Number.parseInt(item)
    break
  case 3:
    soa.refresh = Number.parseInt(item)
    break
  case 4:
    soa.retry = Number.parseInt(item)
    break
  case 5:
    soa.expire = Number.parseInt(item)
    break
  case 6:
    soa.minttl = Number.parseInt(item)
    break
  }
  return soa
}

const srvRecordReducer = (srv: Partial<SrvRecord>, item: string, idx: number) => {
  switch (idx) {
  case 0:
    srv.priority = Number.parseInt(item)
    break
  case 1:
    srv.weight = Number.parseInt(item)
    break
  case 2:
    srv.port = Number.parseInt(item)
    break
  case 3:
    srv.name = item
    break
  }
  return srv
}

const txtRecordReducer = (txt: string[], item: string) => {
  txt.push(JSON.parse(item))
  return txt
}

const parseData = (resourceType: ResourceType) =>
  (dnsJson: DnsJson) => {
    const {Answer = []} = dnsJson
    switch (resourceType) {
    case ResourceType.MX:
      return Answer.map((entry) => getDataAndSplit(entry)
        .reduce(mxRecordReducer, {}) as MxRecord
      )
    case ResourceType.SOA:
      return Answer.map((entry) => getDataAndSplit(entry)
        .reduce(soaRecordReducer, {}) as SoaRecord
      )
    case ResourceType.SRV:
      return Answer.map((entry) => getDataAndSplit(entry)
        .reduce(srvRecordReducer, {}) as SrvRecord
      )
    case ResourceType.TXT:
      return Answer.map((entry) => [getData(entry)])
    case ResourceType.A:
    case ResourceType.AAAA:
    case ResourceType.CNAME:
    default:
      return Answer.map(getData)
    }
  }

async function resolve(name: string, resourceType: ResourceType.A, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.AAAA, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.CNAME, options?: Partial<QueryOptions>): Promise<string[]>
async function resolve(name: string, resourceType: ResourceType.MX, options?: Partial<QueryOptions>): Promise<MxRecord[]>
async function resolve(name: string, resourceType: ResourceType.SOA, options?: Partial<QueryOptions>): Promise<SoaRecord[]>
async function resolve(name: string, resourceType: ResourceType.SRV, options?: Partial<QueryOptions>): Promise<SrvRecord[]>
async function resolve(name: string, resourceType: ResourceType.TXT, options?: Partial<QueryOptions>): Promise<string[][]>
async function resolve(
  name: string, resourceType?: ResourceType | undefined, options?: Partial<QueryOptions> | undefined
): Promise<string[] | MxRecord[] | SoaRecord[] | SrvRecord[] | string[][]> {
  const {protocol, fetch: fetchOptions, server} = resolveOptions(options ?? defaultOptions)
  const {protocol: currentProtocol} = server.match(/^(<?protocol>[^:]+):\/\//)?.groups ?? {}
  const info = currentProtocol !== undefined ? server : `${protocol}://${server}`

  try {
    const url = new URL(info)

    url.searchParams.set('name', name)
    resourceType && url.searchParams.set('type', resourceType)

    return fetch(url, fetchOptions)
      .then(parseData(resourceType ?? ResourceType.A))
  } catch {
    return Promise.reject(
      new TypeError(`Cannot create a URL from ${info}`)
    )
  }
}

export type {Hostname, DnsJson, TryIntoError}
export {ResourceType, isDnsJson, validateItems, resolve, isResourceType}
