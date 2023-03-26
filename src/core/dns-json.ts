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

enum ResourceType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  CAA = 'CAA',
  MX = 'MX',
  NAPTR = 'NAPTR',
  NS = 'NS',
  PTR = 'PTR',
  SOA = 'SOA',
  SRV = 'SRV',
  TXT = 'TXT'
}

export type {Answer, DnsJson}
export {DnsResponseCode, ResourceType}
