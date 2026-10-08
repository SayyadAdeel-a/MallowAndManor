import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Request-shape helpers shared by the serverless (api/) and Express (server/)
// stacks. These exist because Express parses query strings with `qs`, which
// turns `?category[$ne]=` into an object. Feeding that straight into a Mongo
// filter is a NoSQL operator-injection hole.
// ---------------------------------------------------------------------------

/** Return a query value only if it is a plain string, else a safe default. */
export const str = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback;

/** Same as str(), trimmed, with a hard length cap. */
export const shortStr = (value, max = 200, fallback = '') => {
  const s = str(value, fallback).trim();
  return s.length > max ? s.slice(0, max) : s;
};

/**
 * Escape a user-supplied string for safe use inside a Mongo $regex.
 * Without this, `?search=(a+)+$` triggers catastrophic backtracking in the
 * MongoDB regex engine (ReDoS) on a public, unauthenticated endpoint.
 */
export const escapeRegex = (value) =>
  str(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Build a case-insensitive literal-match regex, capped to prevent huge patterns. */
export const literalRegex = (value, maxLength = 100) => {
  const trimmed = shortStr(value, maxLength);
  if (!trimmed) return null;
  return new RegExp(escapeRegex(trimmed), 'i');
};

/**
 * Validate an id and return a real ObjectId, or null.
 * Prevents CastError 500s and blocks operator injection via id fields.
 */
export const toObjectId = (value) => {
  const s = str(value);
  if (!s || !mongoose.isValidObjectId(s)) return null;
  return new mongoose.Types.ObjectId(s);
};

/** Client IP, resilient to a spoofed X-Forwarded-For.
 *
 * Vercel APPENDS the real client IP to X-Forwarded-For, so a client-supplied
 * value sits at index 0 and is attacker-controlled. Taking index 0 (the old
 * behaviour) let anyone bypass rate limiting with a fake header. We prefer the
 * platform-verified header and otherwise take the LAST entry.
 */
export const clientIp = (req) => {
  const h = req?.headers || {};
  const first = (...keys) => {
    for (const k of keys) {
      const v = h[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
  };
  const verified = first('x-vercel-forwarded-for', 'cf-connecting-ip', 'x-real-ip');
  if (verified) return verified.split(',')[0].trim();
  const xff = first('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return str(req?.socket?.remoteAddress, 'unknown') || 'unknown';
};

/** Reject `__proto__` / `constructor` / `prototype` keys from user JSON. */
export const hasPoisonKey = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return ['__proto__', 'constructor', 'prototype'].some(
    (k) => Object.prototype.hasOwnProperty.call(obj, k),
  );
};

/** Validate an outbound URL field: allow http(s), site-relative, or root-relative. */
export const safeUrl = (value, fallback = '') => {
  const s = str(value).trim();
  if (!s) return fallback;
  if (s.startsWith('/') && !s.startsWith('//')) return s.slice(0, 2000);
  if (/^https?:\/\//i.test(s)) return s.slice(0, 2000);
  return fallback;
};

/** Coerce to a finite, in-range number. Rejects NaN, Infinity, negatives. */
export const safeNumber = (value, { min = 0, max = 10_000_000, fallback } = {}) => {
  const n = typeof value === 'number' ? value : Number(str(value).trim());
  if (!Number.isFinite(n)) return fallback;
  if (n < min || n > max) return fallback;
  return n;
};
