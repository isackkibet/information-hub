import dns from "node:dns";

let patchedHost: string | null = null;

/**
 * Some networks advertise IPv6 addresses for the database host but cannot route
 * them. Node's TCP connect then hangs on the IPv6 attempt instead of falling back
 * to IPv4, which surfaces as ETIMEDOUT.
 *
 * We force IPv4 lookups for the database hostname only. The hostname itself is
 * preserved so TLS SNI keeps working (Neon routes by SNI and refuses to
 * authenticate otherwise).
 */
export function preferIpv4ForDatabaseHost(hostname: string) {
  if (patchedHost === hostname) return;
  patchedHost = hostname;

  const originalLookup = dns.lookup;

  dns.lookup = function patchedLookup(
    this: unknown,
    host: string,
    options: unknown,
    callback: unknown
  ) {
    const opts = (typeof options === "object" && options !== null ? options : {}) as {
      all?: boolean;
      family?: number;
      [key: string]: unknown;
    };
    const done = (typeof options === "function" ? options : callback) as (
      err: NodeJS.ErrnoException | null,
      address: unknown,
      family?: number
    ) => void;

    if (host !== hostname) {
      return (originalLookup as (...args: unknown[]) => unknown).call(this, host, options, callback);
    }

    const lookupOptions = { ...opts, family: 4 };
    return (originalLookup as (...args: unknown[]) => unknown).call(this, host, lookupOptions, done);
  } as typeof dns.lookup;
}
