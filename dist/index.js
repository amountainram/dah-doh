var w = Object.defineProperty;
var y = (e, t, r) => t in e ? w(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var f = (e, t, r) => (y(e, typeof t != "symbol" ? t + "" : t, r), r);
const v = ({ data: e }) => e, m = (e) => v(e).split(" "), j = ({ Answer: e = [] }) => e.map(v), E = ({ Answer: e = [] }) => e.map((t) => [v(t)]), b = ["issue", "issuewild", "iodef", "contactemail", "contactphone"], $ = (e, t, r, n) => {
  if (r === 0)
    return e.critial = Number.parseInt(t), e;
  if (r % 2 === 1)
    return e;
  const s = n[r - 1], c = JSON.parse(t);
  return b.includes(s) && (e[s] = c), e;
}, N = ({ Answer: e = [] }) => e.map(
  (t) => m(t).reduce($, {})
), R = (e, t, r) => {
  switch (r) {
    case 0:
      e.priority = Number.parseInt(t);
      break;
    case 1:
      e.exchange = t;
      break;
  }
  return e;
}, I = ({ Answer: e = [] }) => e.map(
  (t) => m(t).reduce(R, {})
), P = (e, t, r) => {
  switch (r) {
    case 0:
      e.nsname = t;
      break;
    case 1:
      e.hostmaster = t;
      break;
    case 2:
      e.serial = Number.parseInt(t);
      break;
    case 3:
      e.refresh = Number.parseInt(t);
      break;
    case 4:
      e.retry = Number.parseInt(t);
      break;
    case 5:
      e.expire = Number.parseInt(t);
      break;
    case 6:
      e.minttl = Number.parseInt(t);
      break;
  }
  return e;
}, M = ({ Answer: e = [] }) => e.map(
  (t) => m(t).reduce(P, {})
)[0], T = (e, t, r) => {
  switch (r) {
    case 0:
      e.priority = Number.parseInt(t);
      break;
    case 1:
      e.weight = Number.parseInt(t);
      break;
    case 2:
      e.port = Number.parseInt(t);
      break;
    case 3:
      e.name = t;
      break;
  }
  return e;
}, D = ({ Answer: e = [] }) => e.map(
  (t) => m(t).reduce(T, {})
), X = (e) => e, k = (e) => typeof e == "string" && Object.values(i).includes(e);
var i = /* @__PURE__ */ ((e) => (e.A = "A", e.AAAA = "AAAA", e.CNAME = "CNAME", e.CAA = "CAA", e.MX = "MX", e.NS = "NS", e.SOA = "SOA", e.SRV = "SRV", e.TXT = "TXT", e))(i || {}), g = /* @__PURE__ */ ((e) => (e.JSON = "application/json", e.DNSJSON = "application/dns-json", e))(g || {});
const x = Object.values(g), h = {
  server: "dns.google/resolve",
  protocol: "https",
  fetch: {
    method: "GET",
    headers: {
      accept: "application/json"
      /* JSON */
    }
  }
}, C = {
  "dns.google/resolve": {
    headers: {
      accept: "application/json"
      /* JSON */
    }
  },
  "cloudflare-dns.com/dns-query": {
    headers: {
      accept: "application/dns-json"
      /* DNSJSON */
    }
  }
}, J = (e) => {
  var n, s;
  const t = e.server ?? h.server, r = C[t];
  return {
    protocol: e.protocol ?? h.protocol,
    server: e.server ?? h.server,
    fetch: {
      ...r,
      ...e,
      method: ((n = e.fetch) == null ? void 0 : n.method) ?? h.fetch.method,
      headers: ((s = e.fetch) == null ? void 0 : s.headers) ?? h.fetch.headers
    }
  };
}, L = (e) => e.split(";")[0], V = async (e, t) => globalThis.fetch(e, t).then((r) => r.ok ? r : Promise.reject(new TypeError(`Cannot ${t.method} ${e.href}: ${r.status} ${r.statusText}`))).then((r) => {
  const n = r.headers.get("content-type");
  return n && x.includes(L(n)) ? r.json() : Promise.reject(new TypeError("Wrong content-type header"));
}).then((r) => X(r)).then((r) => "error" in r ? Promise.reject(new TypeError(r.message)) : r);
async function A(e, t, r) {
  var u;
  const { protocol: n, fetch: s, server: c } = J(r ?? h), { protocol: o } = ((u = c.match(/^(<?protocol>[^:]+):\/\//)) == null ? void 0 : u.groups) ?? {}, a = o !== void 0 ? c : `${n}://${c}`;
  try {
    const d = new URL(a);
    return d.searchParams.set("name", e), t !== "A" && d.searchParams.set("type", t), V(d, s);
  } catch {
    return Promise.reject(
      new TypeError(`Cannot create a URL from ${a}`)
    );
  }
}
async function p(e, t, r) {
  let n = r, s = "A";
  typeof t == "object" && (n = t), t && typeof t != "object" && (s = t);
  let c;
  switch (s) {
    case "MX":
      c = I;
      break;
    case "SOA":
      c = M;
      break;
    case "SRV":
      c = D;
      break;
    case "TXT":
      c = E;
      break;
    case "CAA":
      c = N;
      break;
    case "A":
    case "AAAA":
    case "CNAME":
    case "NS":
    default:
      c = j;
      break;
  }
  return A(e, s, n).then(c);
}
class q extends Error {
  constructor(r, n) {
    super(r);
    f(this, "errno");
    f(this, "code");
    f(this, "hostname");
    f(this, "syscall");
    this.errno = n == null ? void 0 : n.errno, this.code = n == null ? void 0 : n.code, this.hostname = n == null ? void 0 : n.hostname, this.syscall = n == null ? void 0 : n.syscall;
  }
}
function U(e, t, r) {
  const n = typeof t == "function" ? t : r, s = typeof t == "function" || !k(t) ? void 0 : t;
  (s !== void 0 ? p(e, s) : p(e)).then((o) => n == null ? void 0 : n(null, o)).catch((o) => n == null ? void 0 : n(o));
}
const S = (e, t) => {
  const r = "ENODATA", n = `query${t}`;
  return Promise.reject(
    new q(
      `${n} ${r} ${e}`,
      {
        errno: void 0,
        code: r,
        syscall: n,
        hostname: e
      }
    )
  );
}, l = (e, t, r, n) => (s) => {
  var o;
  if (((o = s.Answer) == null ? void 0 : o[0]) === void 0)
    return S(e, t);
  const { Answer: c } = s;
  if (typeof r != "function" && r.ttl === !0) {
    const a = c.map(({ TTL: u, data: d }) => ({ ttl: u, address: d }));
    n == null || n(null, a);
  } else {
    const a = c.map((u) => u.data);
    r == null || r(null, a);
  }
  return Promise.resolve();
};
function G(e, t, r) {
  const n = A(e, i.A), s = typeof t == "function" ? t : r;
  n.then(
    l(e, i.A, t, r)
  ).catch((c) => s == null ? void 0 : s(c, []));
}
function H(e, t, r) {
  const n = i.AAAA, s = A(e, n), c = l(e, n, t, r), o = typeof t == "function" ? t : r;
  s.then(c).catch((a) => o == null ? void 0 : o(a, []));
}
function K(e, t) {
  const r = i.CNAME, n = A(e, r), s = l(e, r, t), c = (o) => t(o, []);
  n.then(s).catch(c);
}
function W(e, t) {
  const r = i.CAA, n = A(e, r), s = (o) => {
    var a;
    ((a = o.Answer) == null ? void 0 : a[0]) === void 0 && S(e, r), t(null, N(o));
  }, c = (o) => t(o, []);
  n.then(s).catch(c);
}
const z = {
  resolve: p
};
export {
  z as promises,
  U as resolve,
  G as resolve4,
  H as resolve6,
  W as resolveCaa,
  K as resolveCname
};
