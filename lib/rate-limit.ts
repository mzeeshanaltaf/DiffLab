import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimiterKind = "contact" | "diffs";

// Lazily build one sliding-window limiter per kind so the Redis client is
// created once per server instance. Returns null when Upstash env vars are
// absent so callers can degrade gracefully (e.g. local dev without Redis
// configured).
const limiters = new Map<LimiterKind, Ratelimit>();

function getLimiter(kind: LimiterKind): Ratelimit | null {
  const cached = limiters.get(kind);
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const rl =
    kind === "contact"
      ? new Ratelimit({
          redis,
          // 5 submissions per 10 minutes per identifier (IP). Tune to taste.
          limiter: Ratelimit.slidingWindow(5, "10 m"),
          prefix: "contact",
          analytics: false,
        })
      : new Ratelimit({
          redis,
          // Saving a diff is cheap to spam and writes to a shared Postgres
          // instance, so it gets a tighter window than the contact form.
          limiter: Ratelimit.slidingWindow(10, "10 m"),
          prefix: "diffs",
          analytics: false,
        });

  limiters.set(kind, rl);
  return rl;
}

export async function checkRateLimit(identifier: string, kind: LimiterKind = "contact"): Promise<{ success: boolean }> {
  const rl = getLimiter(kind);
  // No limiter configured -> allow the request rather than blocking it.
  // The route should never hard-fail just because Redis is unset in some env.
  if (!rl) return { success: true };

  const { success } = await rl.limit(identifier);
  return { success };
}
