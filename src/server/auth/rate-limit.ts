import "server-only";
type Bucket = { count: number; until: number };
const store = globalThis as unknown as { orckLoginLimits?: Map<string, Bucket> };
const buckets = store.orckLoginLimits ??= new Map<string, Bucket>();
function take(key: string, limit: number, windowMs: number, now: number) {
  let b = buckets.get(key);
  if (!b || b.until <= now) { b = { count: 0, until: now + windowMs }; buckets.set(key, b); }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}
export function allowLogin(email: string): boolean {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.until <= now) buckets.delete(key);
  if (buckets.size > 1000) return false;
  if (!take("global", 60, 5 * 60 * 1000, now)) return false;
  return take(`email:${email}`, 5, 15 * 60 * 1000, now);
}
