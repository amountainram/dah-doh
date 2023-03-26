import type {
  AnyARecord,
  AnyNsRecord,
  AnyRecord,
  CaaRecord,
  MxRecord,
  NaptrRecord,
  SoaRecord,
  SrvRecord
} from 'dns'
import type {Answer} from './dns-json'
import {ResourceType} from './dns-json.js'

interface Parsable {
  Answer?: Answer[]
}

const noFinalDot = (input: string) => input.replace(/\.?$/, '')

const getData = ({data}: {data: string}) => data

const getDataAndSplit = (entry: {data: string}) => getData(entry).split(' ')

const toStrings = ({Answer = []}: Parsable) => Answer.map(getData)

const toText = ({Answer = []}: Parsable) => Answer.map((entry) => [getData(entry)])

const toRecordWithTtl = ({Answer = []}: Parsable) => Answer.map(({TTL: ttl, data: address}) => ({ttl, address}))

const toAddresses = (res: Parsable) => toStrings(res).map(noFinalDot)

// custom parsers

const caaKeys = ['issue', 'issuewild', 'iodef', 'contactemail', 'contactphone']

const caaRecordReducer = (caa: Partial<CaaRecord>, item: string, idx: number, items: string[]) => {
  if(idx === 0) {
    caa.critical = Number.parseInt(item)
    return caa
  }

  if(idx % 2 === 1) {
    return caa
  }

  const key = items[idx - 1]
  const value = JSON.parse(item)
  if(caaKeys.includes(key)) {
    caa[key as keyof CaaRecord] = value
  }

  return caa
}

const toCaaRecords = ({Answer = []}: Parsable) => Answer.map((entry) =>
  getDataAndSplit(entry).reduce(caaRecordReducer, {}) as CaaRecord
)

const mxRecordReducer = (mx: Partial<MxRecord>, item: string, idx: number) => {
  switch (idx) {
  case 0:
    mx.priority = Number.parseInt(item)
    break
  case 1:
    mx.exchange = noFinalDot(item)
    break
  }
  return mx
}

const toMxRecords = ({Answer = []}: Parsable) => Answer.map((entry) =>
  getDataAndSplit(entry).reduce(mxRecordReducer, {}) as MxRecord
)

const naptrRecordReducer = (naptr: Partial<NaptrRecord>, item: string, idx: number) => {
  switch (idx) {
  case 0:
    naptr.order = Number.parseInt(item)
    break
  case 1:
    naptr.preference = Number.parseInt(item)
    break
  case 2:
    naptr.flags = item
    break
  case 3:
    naptr.service = item
    break
  case 4:
    naptr.regexp = item
    break
  case 5:
    naptr.replacement = noFinalDot(item)
    break
  }
  return naptr
}

const toNaptrRecords = ({Answer = []}: Parsable) => Answer.map((entry) => 
  getDataAndSplit(entry).reduce(naptrRecordReducer, {}) as NaptrRecord
)

const soaRecordReducer = (soa: Partial<SoaRecord>, item: string, idx: number) => {
  switch (idx) {
  case 0:
    soa.nsname = noFinalDot(item)
    break
  case 1:
    soa.hostmaster = noFinalDot(item)
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

const toSoaRecord = ({Answer = []}: Parsable) => Answer.map((entry) =>
  getDataAndSplit(entry).reduce(soaRecordReducer, {}) as SoaRecord
)[0]

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

const toSrvRecords = ({Answer = []}: Parsable) => Answer.map((entry) =>
  getDataAndSplit(entry).reduce(srvRecordReducer, {}) as SrvRecord
)

const getParser = ({type, ...entry}: Omit<Answer, 'data'>): ((data: string) => AnyRecord) | undefined => {
  switch (type) {
  case 1:
    return (data) => ({type: ResourceType.A, ttl: entry.TTL, address: noFinalDot(data)}) as AnyARecord
  case 2:
    return (data) => ({type: ResourceType.NS, value: noFinalDot(data)}) as AnyNsRecord
  // case 5:
  //   return {type: ResourceType.CNAME, parser: undefined}
  // case 6:
  //   return {type: ResourceType.SOA, parser: undefined}
  // case 12:
  //   return {type: ResourceType.PTR, parser: undefined}
  // case 15:
  //   return {type: ResourceType.MX, parser: undefined}
  // case 16:
  //   return ResourceType.TXT
  // case 28:
  //   return ResourceType.AAAA
  // case 33:
  //   return ResourceType.SRV
  // case 35:
  //   return ResourceType.NAPTR
  // case 257:
  //   return ResourceType.CAA
  default:
    return undefined
  }
}

const toAnyRecords = ({Answer = []}: Parsable) => Answer.reduce<AnyRecord[]>((answers, {data, ...entry}) => {
  const parser = getParser(entry)
  if(parser) {
    answers.push(parser(data))
  }
  
  return answers
}, [])

const hasData = (res: Parsable): res is Required<Parsable> => res.Answer?.[0] !== undefined

export type {Answer}
export {
  toStrings,
  toText,
  toRecordWithTtl,
  toAddresses,
  toCaaRecords,
  toMxRecords,
  toNaptrRecords,
  toSoaRecord,
  toSrvRecords,
  toAnyRecords,
  hasData,
}