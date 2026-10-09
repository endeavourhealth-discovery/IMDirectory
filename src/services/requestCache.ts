import { useUserStore } from "@endeavour/vue-library";

interface CacheEntry {
  promise: Promise<unknown>;
  expires: number;
}

const entries = new Map<string, CacheEntry>();

/** Lookups that only change on a server release can be kept for the rest of the session. */
export const STATIC_LOOKUP_TTL = 30 * 60 * 1000;

/**
 * Shares one request between callers asking for the same thing at the same time and, when ttl is above zero, keeps the result for that many milliseconds.
 *
 * Callers receive the same raw response, so each must parse it for themselves rather than mutate it.
 * Failed and empty responses are never kept: the api interceptor resolves handled errors to undefined.
 */
export function cachedRequest<T>(key: string, fetcher: () => Promise<T>, ttl: number = 0): Promise<T> {
  const scopedKey = `${useUserStore().includeUserGraph}|${key}`;
  const existing = entries.get(scopedKey);
  if (existing && existing.expires > Date.now()) return existing.promise as Promise<T>;

  const entry: CacheEntry = { promise: undefined as unknown as Promise<unknown>, expires: Infinity };
  entry.promise = fetcher().then(
    result => {
      if (result === undefined || result === null || ttl <= 0) evict(scopedKey, entry);
      else entry.expires = Date.now() + ttl;
      return result;
    },
    error => {
      evict(scopedKey, entry);
      throw error;
    }
  );
  entries.set(scopedKey, entry);
  return entry.promise as Promise<T>;
}

function evict(key: string, entry: CacheEntry) {
  if (entries.get(key) === entry) entries.delete(key);
}

export function clearRequestCache() {
  entries.clear();
}
