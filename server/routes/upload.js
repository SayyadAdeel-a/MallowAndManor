import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { checkRateLimit } from '../../shared/rate-limit.js';
import { createUploadSignature, isCloudinaryConfigured } from '../../shared/cloudinary-sign.js';

const router = Router();

// GET /api/upload/sign - issue a Cloudinary signed-upload payload.
//
// This route was MISSING locally: the frontend calls GET /api/upload/sign, but
// the dev server only registered POST /, so every admin image upload failed
// with "Failed to get upload signature" outside production.
//
// The previous POST / handler (multer + sharp, returning a base64 data: URI) is
// deliberately gone. It was unused, it needed multer 1.x (EOL, published DoS
// advisories), it had no fileFilter, and a base64 image in a Mongo document
// eventually blows the 16MB BSON limit. Dev now uses the exact same direct-to-
// Cloudinary flow as production.
router.get('/sign', requireAdmin, (req, res) => {
  const rl = checkRateLimit(req, 'upload-sign', 30, 60 * 1000);
  if (rl.blocked) {
    res.setHeader('Retry-After', String(rl.retryAfterSec || 60));
    return res.status(429).json({ error: 'Too many upload requests' });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(501).json({
      error: 'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    });
  }

  return res.json(createUploadSignature());
});

export default router;
