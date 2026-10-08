import { ALLOWED_ORIGINS, isOriginAllowed } from '../../shared/origins.js';

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    // Without Vary: Origin, a CDN-cached response can be served to the wrong
    // origin with the wrong ACAO value.
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export function handleCors(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export { ALLOWED_ORIGINS };
