import { clientIp } from './http.js';

// ---------------------------------------------------------------------------
// Rate limiting, shared by both stacks.
//
// IMPROVEMENTS over the previous serverless-only Map:
//  - Correct client IP (see clientIp in http.js — the old code took index 0 of
//    X-Forwarded-For, which is attacker-controlled on Vercel).
//  - Generic: usable for any route, not just login.
//  - Success no longer wipes the counter, so a valid credential cannot be used
//    to clear your own brute-force budget.
//
// LIMITATION (unchanged): state is in-process. On Vercel each warm lambda
// instance has its own counter, so limits are per-instance, not global. For a
// hard global limit, front the API with Vercel WAF rate-limit rules or set up
// Upstash Redis and swap the `bump` function below.
// ---------------------------------------------------------------------------

const buckets = new Map();

// Bound memory: drop expired buckets periodically instead of growing forever.
const SWEEP_MS = 60 * 1000;
let lastSweep = 0;
const sweep = () => {
  const now = Date.now();
  if (now - lastSweep < SWEEP_MS) return;
  lastSweep = now;
  for (const [key, rec] of buckets) {
    if (now - rec.first > rec.windowMs) buckets.delete(key);
  }
};

const bump = (key, maxAttempts, windowMs) => {
  sweep();
  const now = Date.now();
  const rec = buckets.get(key);

  if (!rec || now - rec.first >= windowMs) {
    buckets.set(key, { count: 1, first: now, windowMs });
    return { blocked: false, remaining: maxAttempts - 1, ip: key };
  }

  rec.count += 1;
  if (rec.count > maxAttempts) {
    const remainingMs = rec.first + windowMs - now;
    return {
      blocked: true,
      remaining: 0,
      retryAfterSec: Math.ceil(remainingMs / 1000),
      remainingMin: Math.ceil(remainingMs / 60000),
      ip: key,
    };
  }
  return { blocked: false, remaining: maxAttempts - rec.count, ip: key };
};

/**
 * Check (and consume) one unit of quota for a named route.
 * @param req        request (used to derive the client IP)
 * @param name       route name, e.g. 'login'
 * @param maxAttempts attempts allowed per window
 * @param windowMs   window length
 * @param extraKey   optional second key component (e.g. the email)
 */
export const checkRateLimit = (req, name = 'global', maxAttempts = 30, windowMs = 15 * 60 * 1000, extraKey = '') => {
  const ip = clientIp(req);
  const key = `${name}:${ip}${extraKey ? `:${extraKey}` : ''}`;
  return bump(key, maxAttempts, windowMs);
};

/** Consume quota. Returns true when the caller is over budget. */
export const isRateLimited = (req, name, maxAttempts, windowMs, extraKey) => {
  const r = checkRateLimit(req, name, maxAttempts, windowMs, extraKey);
  return { blocked: r.blocked, retryAfterSec: r.retryAfterSec || 0, remainingMin: r.remainingMin || 0 };
};

/** Set standard rate-limit headers on a successful (non-blocked) response. */
export const setRateLimitHeaders = (res, remaining, max) => {
  res.setHeader?.('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  res.setHeader?.('X-RateLimit-Limit', String(max));
};
