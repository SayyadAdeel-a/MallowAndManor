import connectDB from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import SiteSettings from './_lib/models/SiteSettings.js';
import { DEFAULT_SETTINGS, DEFAULTS_VERSION } from '../shared/settings-defaults.js';
import { pickSettingsSections, SETTINGS_SECTIONS } from '../shared/validators.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // ----------------------------------------------------------------- GET --
    if (req.method === 'GET') {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create(DEFAULT_SETTINGS);
      } else {
        // Backfill sections added after the document was first created
        let dirty = false;
        if (!settings.productPage) {
          settings.productPage = DEFAULT_SETTINGS.productPage;
          dirty = true;
        }
        if (settings.productPage && !settings.productPage.sizes?.length) {
          settings.productPage.sizes = DEFAULT_SETTINGS.productPage.sizes;
          dirty = true;
        }
        // One-time: replace native-script (Urdu/Pashto) reviews with the Hinglish defaults
        if (
          Array.isArray(settings.homeReviews) &&
          settings.homeReviews.some((r) => /[\u0600-\u06FF]/.test(r?.text || ''))
        ) {
          settings.homeReviews = DEFAULT_SETTINGS.homeReviews;
          dirty = true;
        }
        if (dirty) await settings.save();
      }

      if ((settings.defaultsVersion || 0) < DEFAULTS_VERSION) {
        settings = await SiteSettings.findByIdAndUpdate(
          settings._id,
          { ...DEFAULT_SETTINGS },
          { new: true },
        );
      }
      return res.json(settings);
    }

    // ----------------------------------------------------------------- PUT --
    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;

      // Was `Object.assign(settings, req.body)`: accepted every top-level key,
      // including defaultsVersion (which would permanently disable the
      // migration above), and was vulnerable to __proto__ reassignment via
      // Object.assign's [[Set]] semantics.
      const clean = pickSettingsSections(req.body);
      if (Object.keys(clean).length === 0) {
        return res.status(400).json({
          error: 'No valid settings sections supplied',
          allowed: SETTINGS_SECTIONS,
        });
      }

      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({ ...DEFAULT_SETTINGS, ...clean });
        return res.json(settings);
      }

      // Spread (not Object.assign) so an own __proto__ key cannot touch the
      // prototype chain.
      settings.set({ ...clean, defaultsVersion: DEFAULTS_VERSION });
      await settings.save();
      return res.json(settings);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/settings]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
