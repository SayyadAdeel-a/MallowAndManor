import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../_lib/auth.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'honeybeelane';
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  res.json({ cloudName, apiKey, signature, timestamp, folder });
}
