import { v2 as cloudinary } from 'cloudinary';

// Cloudinary signed-upload parameters, shared by the Vercel function
// (api/upload/sign.js) and the dev server (server/routes/upload.js) so local
// and production behave identically.
//
// Cloudinary reads config from the environment on first import, but reading it
// lazily (at call time) keeps this correct no matter when dotenv has run.

export const UPLOAD_FOLDER = 'honeybeelane';

/** Apply credentials from the environment. Safe to call repeatedly. */
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary.config();
};

export const isCloudinaryConfigured = () => {
  const { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret } = configureCloudinary();
  return Boolean(cloudName && apiKey && apiSecret);
};

/**
 * Build a signed-upload payload for a direct browser -> Cloudinary upload.
 * `timestamp` and `folder` are server-generated constants, never taken from the
 * request, so there is no signature-parameter-injection path.
 */
export const createUploadSignature = () => {
  const { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret } = configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: UPLOAD_FOLDER },
    apiSecret,
  );

  return {
    cloudName: String(cloudName),
    apiKey: String(apiKey),
    signature,
    timestamp,
    folder: UPLOAD_FOLDER,
  };
};