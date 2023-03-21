// import type {
//   AnyRecord, MxRecord, NaptrRecord, SoaRecord, SrvRecord
// } from 'dns'

// import type {Hostname} from './fetch'
// import {ResourceType} from './fetch'
// import {resolve as fetchResolve} from './fetch'

// /**
//  * Uses the DNS protocol to resolve a host name (e.g. `'nodejs.org'`) into an array
//  * of the resource records. The `callback` function has arguments`(err, records)`. When successful, `records` will be an array of resource
//  * records. The type and structure of individual results varies based on `rrtype`:
//  *
//  * <omitted>
//  *
//  * On error, `err` is an `Error` object, where `err.code` is one of the `DNS error codes`.
//  * @since v0.1.27
//  * @param hostname Host name to resolve.
//  * @param [rrtype='A'] Resource record type.
//  */
// export function resolve(hostname: string, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void;
// export function resolve(hostname: string, rrtype: ResourceType.A, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void;
// export function resolve(hostname: string, rrtype: ResourceType.AAAA, callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void;
// export function resolve(hostname: string, rrtype: 'ANY', callback: (err: NodeJS.ErrnoException | null, addresses: AnyRecord[]) => void): void;
// export function resolve(hostname: string, rrtype: 'CNAME', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void;
// export function resolve(hostname: string, rrtype: 'MX', callback: (err: NodeJS.ErrnoException | null, addresses: MxRecord[]) => void): void;
// export function resolve(hostname: string, rrtype: 'NAPTR', callback: (err: NodeJS.ErrnoException | null, addresses: NaptrRecord[]) => void): void;
// export function resolve(hostname: string, rrtype: 'NS', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void;
// export function resolve(hostname: string, rrtype: 'PTR', callback: (err: NodeJS.ErrnoException | null, addresses: string[]) => void): void;
// export function resolve(hostname: string, rrtype: 'SOA', callback: (err: NodeJS.ErrnoException | null, addresses: SoaRecord) => void): void;
// export function resolve(hostname: string, rrtype: ResourceType.SRV, callback: (err: NodeJS.ErrnoException | null, addresses: SrvRecord[]) => void): void;
// export function resolve(hostname: string, rrtype: 'TXT', callback: (err: NodeJS.ErrnoException | null, addresses: string[][]) => void): void;
// export function resolve(
//   hostname: string,
//   rrtype: string,
//   callback: (
//     err: NodeJS.ErrnoException | null, addresses: string[] | MxRecord[] | NaptrRecord[] | SoaRecord | SrvRecord[] | string[][] | AnyRecord[]
//   ) => void
// ): void {
//   const dnsServerHostname: Hostname = 'dns.google/resolve'
//   const resourceType = rrtype as ResourceType

//   fetchResolve(dnsServerHostname, hostname, {resourceType})
//     .then((result) => {
//       switch (resourceType) {
//       case ResourceType.A:
//       case ResourceType.AAAA:
//         return result.Answer?.map((address) => address.data)
//       default:
//         return result.Answer
//       }
//     })
//     .catch((err) => callback(err, []))
// }
