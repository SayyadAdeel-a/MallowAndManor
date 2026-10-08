// Single source of truth for CORS origins.
// Imported by BOTH api/_lib/cors.js (Vercel) and server/index.js (dev).
//
// Keep the production custom domain here. It was previously missing from the
// serverless allowlist, which blocked every /api call from the live domain.

export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://honeybeelane.vercel.app',
  'https://honeybeelane.com',
  'https://www.honeybeelane.com',
];

export const isOriginAllowed = (origin) => ALLOWED_ORIGINS.includes(origin);
