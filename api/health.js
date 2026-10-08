import { handleCors } from '../_lib/cors.js';

// Health check. Referenced by README/AGENTS.md for the ~4 min keep-warm ping
// (Hobby plan idles out at ~5 min). This file was MISSING, so the documented
// ping 404'd in production.
export default function handler(req, res) {
  if (handleCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
}
