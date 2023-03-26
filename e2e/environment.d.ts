export type { }

import type {
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
} from '../src'

declare global {
  interface Window {
    dahDoh: {
      promises: typeof promises,
      resolve: typeof resolve,
      resolve4: typeof resolve4,
      resolve6: typeof resolve6,
      resolveCaa: typeof resolveCaa,
      resolveCname: typeof resolveCname,
      resolveMx: typeof resolveMx,
      resolveNaptr: typeof resolveNaptr,
      resolveNs: typeof resolveNs,
      resolvePtr: typeof resolvePtr,
    }
  }
}