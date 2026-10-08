import { handleCors } from '../_lib/cors.js';
import { requireAdmin } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { createUploadSignature, isCloudinaryConfigured } from '../../shared/cloudinary-sign.js';

export default function handler(req, res) {
  // This function previously omitted handleCors entirely, so a cross-origin
  // OPTIONS preflight got a 401 instead of 204 + CORS headers.
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Was verifyToken: ANY signed-in session could mint upload credentials.
  if (!requireAdmin(req, res)) return;

  const rl = checkRateLimit(req, 'upload-sign', 30, 60 * 1000);
  if (rl.blocked) {
    res.setHeader('Retry-After', String(rl.retryAfterSec || 60));
    return res.status(429).json({ error: 'Too many upload requests' });
  }

  if (!isCloudinaryConfigured()) {
    console.error('[api/upload/sign] Cloudinary env vars are not configured');
    return res.status(501).json({ error: 'Image uploads are not configured' });
  }

  return res.json(createUploadSignature());
}
