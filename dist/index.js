const j = (e) => e.replace(/\.?$/, ""), N = ({ data: e }) => e, f = (e) => N(e).split(" "), m = ({ Answer: e = [] }) => e.map(N), C = ({ Answer: e = [] }) => e.map((r) => [N(r)]), w = ({ Answer: e = [] }) => e.map(({ TTL: r, data: t }) => ({ ttl: r, address: t })), O = ["issue", "issuewild", "iodef", "contactemail", "contactphone"], x = (e, r, t, n) => {
  if (t === 0)
    return e.critical = Number.parseInt(r), e;
  if (t % 2 === 1)
    return e;
  const s = n[t - 1], o = JSON.parse(r);
  return O.includes(s) && (e[s] = o), e;
}, E = ({ Answer: e = [] }) => e.map(
  (r) => f(r).reduce(x, {})
), X = (e, r, t) => {
  switch (t) {
    case 0:
      e.priority = Number.parseInt(r);
      break;
    case 1:
      e.exchange = j(r);
      break;
  }
  return e;
}, R = ({ Answer: e = [] }) => e.map(
  (r) => f(r).reduce(X, {})
), F = (e, r, t) => {
  switch (t) {
    case 0:
      e.order = Number.parseInt(r);
      break;
    case 1:
      e.preference = Number.parseInt(r);
      break;
    case 2:
      e.flags = r;
      break;
    case 3:
      e.service = r;
      break;
    case 4:
      e.regexp = r;
      break;
    case 5:
      e.replacement = j(r);
      break;
  }
  return e;
}, L = ({ Answer: e = [] }) => e.map(
  (r) => f(r).reduce(F, {})
), Q = (e, r, t) => {
  switch (t) {
    case 0:
      e.nsname = r;
      break;
    case 1:
      e.hostmaster = r;
      break;
    case 2:
      e.serial = Number.parseInt(r);
      break;
    case 3:
      e.refresh = Number.parseInt(r);
      break;
    case 4:
      e.retry = Number.parseInt(r);
      break;
    case 5:
      e.expire = Number.parseInt(r);
      break;
    case 6:
      e.minttl = Number.parseInt(r);
      break;
  }
  return e;
}, V = ({ Answer: e = [] }) => e.map(
  (r) => f(r).reduce(Q, {})
)[0], J = (e, r, t) => {
  switch (t) {
    case 0:
      e.priority = Number.parseInt(r);
      break;
    case 1:
      e.weight = Number.parseInt(r);
      break;
    case 2:
      e.port = Number.parseInt(r);
      break;
    case 3:
      e.name = r;
      break;
  }
  return e;
}, U = ({ Answer: e = [] }) => e.map(
  (r) => f(r).reduce(J, {})
), l = (e) => {
  var r;
  return ((r = e.Answer) == null ? void 0 : r[0]) !== void 0;
}, q = (e) => e !== null && typeof e == "object", P = (e, r) => {
  const t = e.values();
  let n = !1, { done: s = !0, value: o } = t.next();
  for (; !(s || n); ) {
    r(o) || (n = !0);
    const d = t.next();
    s = d.done ?? !0, o = d.value;
  }
  return !n;
}, b = (e, r, t) => {
  if (!Array.isArray(r))
    return {
      error: !0,
      message: `DNS response ${t} must be an array or undefined`,
      input: e
    };
  if (!P(
    r,
    (n) => n !== null && typeof n == "object" && "name" in n && typeof n.name == "string" && "type" in n && typeof n.type == "number" && "TTL" in n && typeof n.TTL == "number" && "data" in n && typeof n.data == "string"
  ))
    return {
      error: !0,
      message: `DNS response ${t} is not well formatted`,
      input: e
    };
}, W = (e) => {
  const r = { error: !0, input: e, message: "" };
  if (e === null || typeof e != "object")
    return r.message = "input must be an object", r;
  if (!("Status" in e) || typeof e.Status != "number" || e.Status < 0 || e.Status > v.Refused)
    return r.message = "DNS response status is not valid or not specified", r;
  if (!("TC" in e) || typeof e.TC != "boolean")
    return {
      error: !0,
      message: "DNS response truncation flag is not valid",
      input: e
    };
  if (!("RD" in e) || typeof e.RD != "boolean")
    return {
      error: !0,
      message: "DNS response recursion desired flag is not valid",
      input: e
    };
  if (!("RA" in e) || typeof e.RA != "boolean")
    return {
      error: !0,
      message: "DNS response recursion available flag is not valid",
      input: e
    };
  if (!("AD" in e) || typeof e.AD != "boolean")
    return {
      error: !0,
      message: "DNS response authenticated data flag is not valid",
      input: e
    };
  if (!("CD" in e) || typeof e.CD != "boolean")
    return {
      error: !0,
      message: "DNS response checking disabled flag is not valid",
      input: e
    };
  if (!("Question" in e && Array.isArray(e.Question)))
    return {
      error: !0,
      message: "DNS response Question must be an array",
      input: e
    };
  if (!P(
    e.Question,
    (t) => q(t) && "name" in t && typeof t.name == "string" && "type" in t && typeof t.type == "number"
  ))
    return {
      error: !0,
      message: "DNS response Question is not well formatted",
      input: e
    };
  if ("Answer" in e) {
    const t = b(e, e.Answer, "Answer");
    if (t)
      return t;
  }
  if ("Authority" in e) {
    const t = b(e, e.Authority, "Authority");
    if (t)
      return t;
  }
  return "Comment" in e && typeof e.Comment != "string" ? {
    error: !0,
    message: "DNS response Comment must be a string or undefined",
    input: e
  } : e;
}, z = (e) => typeof e == "string" && Object.values(a).includes(e);
var a = /* @__PURE__ */ ((e) => (e.A = "A", e.AAAA = "AAAA", e.CNAME = "CNAME", e.CAA = "CAA", e.MX = "MX", e.NAPTR = "NAPTR", e.NS = "NS", e.SOA = "SOA", e.SRV = "SRV", e.TXT = "TXT", e))(a || {}), T = /* @__PURE__ */ ((e) => (e.JSON = "application/json", e.DNSJSON = "application/dns-json", e))(T || {}), v = /* @__PURE__ */ ((e) => (e[e.NoError = 0] = "NoError", e[e.FormatError = 1] = "FormatError", e[e.ServerFailure = 2] = "ServerFailure", e[e.NameError = 3] = "NameError", e[e.NotImplemented = 4] = "NotImplemented", e[e.Refused = 5] = "Refused", e))(v || {});
const G = Object.values(T), i = {
  server: "dns.google/resolve",
  protocol: "https",
  fetch: {
    method: "GET",
    headers: {
      accept: "application/json"
      /* JSON */
    }
  }
}, H = {
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
}, K = (e) => {
  var n, s;
  const r = e.server ?? i.server, t = H[r];
  return {
    protocol: e.protocol ?? i.protocol,
    server: e.server ?? i.server,
    fetch: {
      ...t,
      ...e,
      method: ((n = e.fetch) == null ? void 0 : n.method) ?? i.fetch.method,
      headers: ((s = e.fetch) == null ? void 0 : s.headers) ?? i.fetch.headers
    }
  };
}, B = (e) => e.split(";")[0], Y = async (e, r) => globalThis.fetch(e, r).then((t) => t.ok ? t : Promise.reject(new TypeError(`Cannot ${r.method} ${e.href}: ${t.status} ${t.statusText}`))).then((t) => {
  const n = t.headers.get("content-type");
  return n && G.includes(B(n)) ? t.json() : Promise.reject(new TypeError("Wrong content-type header"));
}).then((t) => W(t)).then((t) => "error" in t ? Promise.reject(new TypeError(t.message)) : t);
async function c(e, r, t) {
  var S;
  const { protocol: n, fetch: s, server: o } = K(t ?? i), { protocol: d } = ((S = o.match(/^(<?protocol>[^:]+):\/\//)) == null ? void 0 : S.groups) ?? {}, g = d !== void 0 ? o : `${n}://${o}`;
  try {
    const A = new URL(g);
    return A.searchParams.set("name", e), r !== "A" && A.searchParams.set("type", r), Y(A, s);
  } catch {
    return Promise.reject(
      new TypeError(`Cannot create a URL from ${g}`)
    );
  }
}
async function p(e, r, t) {
  let n = t, s = "A";
  typeof r == "object" && (n = r), r && typeof r != "object" && (s = r);
  let o;
  switch (s) {
    case "MX":
      o = R;
      break;
    case "SOA":
      o = V;
      break;
    case "SRV":
      o = U;
      break;
    case "TXT":
      o = C;
      break;
    case "CAA":
      o = E;
      break;
    case "A":
    case "AAAA":
    case "CNAME":
    case "NS":
    default:
      o = m;
      break;
  }
  return c(e, s, n).then(o);
}
const Z = (e) => {
  if (typeof e == "string")
    return e;
  switch (e) {
    case v.ServerFailure:
      return "SERVFAIL";
    default:
      return "";
  }
}, _ = (e) => {
  const r = e.toLowerCase();
  return `${r.substring(0, 1).toUpperCase()}${r.substring(1)}`;
}, ee = (e) => {
  const r = `query${_(e.resourceType)}`;
  return Object.assign(new Error(""), {
    errno: void 0,
    code: `E${Z(e.code)}`,
    syscall: r,
    hostname: e.hostname
  });
}, u = (e, r) => ee({ hostname: e, code: "NODATA", resourceType: r });
async function h(e, r) {
  return z(r) ? p(e, r) : p(e);
}
function ne(e, r, t) {
  const n = typeof r == "function" ? r : t;
  (typeof r == "function" ? h(e) : h(e, r)).then((o) => n == null ? void 0 : n(null, o)).catch((o) => n == null ? void 0 : n(o, []));
}
const re = (e, r) => async (t) => l(t) ? (r == null ? void 0 : r.ttl) === !0 ? w(t) : m(t) : Promise.reject(u(e, a.A));
async function y(e, r) {
  return c(e, a.A).then(re(e, r));
}
function oe(e, r, t) {
  const n = typeof r == "function" ? r : t;
  (typeof r != "function" ? y(e, r) : y(e)).then((o) => {
    n == null || n(null, o);
  }).catch((o) => n == null ? void 0 : n(o, []));
}
const k = (e, r) => async (t) => l(t) ? (r == null ? void 0 : r.ttl) === !0 ? w(t) : m(t) : Promise.reject(u(e, a.AAAA));
async function te(e, r) {
  return c(e, a.AAAA).then(k(e, r));
}
function se(e, r, t) {
  const n = typeof r == "function" ? r : t;
  c(e, a.AAAA).then(k(e, typeof r != "function" ? r : void 0)).then((s) => {
    n == null || n(null, s);
  }).catch((s) => n == null ? void 0 : n(s, []));
}
async function I(e) {
  return c(e, a.CAA).then(
    (r) => l(r) ? E(r) : Promise.reject(u(e, a.CAA))
  );
}
function ae(e, r) {
  I(e).then((t) => r(null, t)).catch((t) => r(t, []));
}
async function $(e) {
  return c(e, a.CNAME).then(
    (r) => l(r) ? m(r) : Promise.reject(u(e, a.CNAME))
  );
}
function ce(e, r) {
  $(e).then((t) => r(null, t)).catch((t) => r(t, []));
}
async function D(e) {
  return c(e, a.MX).then(
    (r) => {
      var t;
      return ((t = r.Answer) == null ? void 0 : t[0]) === void 0 ? Promise.reject(u(e, a.MX)) : R(r);
    }
  );
}
function ie(e, r) {
  D(e).then((t) => r(null, t)).catch((t) => r(t, []));
}
async function M(e) {
  return c(e, a.NAPTR).then(
    (r) => l(r) ? L(r) : Promise.reject(u(e, a.NAPTR))
  );
}
function ue(e, r) {
  M(e).then((t) => r(null, t)).catch((t) => r(t, []));
}
const fe = {
  resolve: h,
  resolve4: y,
  resolve6: te,
  resolveCaa: I,
  resolveCname: $,
  resolveMx: D,
  resolveNaptr: M
};
export {
  fe as promises,
  ne as resolve,
  oe as resolve4,
  se as resolve6,
  ae as resolveCaa,
  ce as resolveCname,
  ie as resolveMx,
  ue as resolveNaptr
};
