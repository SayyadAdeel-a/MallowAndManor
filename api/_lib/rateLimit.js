// Rate limiting for serverless (per-invocation only)
// In production, use Redis or a dedicated rate-limiting service
const loginAttempts = new Map();

export const checkRateLimit = (req, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || 'unknown';

  const key = `login:${ip}`;
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (record && now - record.firstAttempt < windowMs && record.attempts >= maxAttempts) {
    const remainingMs = record.firstAttempt + windowMs - now;
    const remainingMin = Math.ceil(remainingMs / 60000);
    return { blocked: true, remainingMin, ip };
  }

  if (!record || now - record.firstAttempt >= windowMs) {
    loginAttempts.set(key, { attempts: 1, firstAttempt: now });
  } else {
    record.attempts++;
  }

  return { blocked: false, ip };
};

export const resetRateLimit = (ip) => {
  loginAttempts.delete(`login:${ip}`);
};
