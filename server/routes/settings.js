// Site settings defaults now live in shared/settings-defaults.js so this dev
// route and the Vercel function can never drift apart.
import { Router } from 'express';
import SiteSettings from '../models/SiteSettings.js';
import { DEFAULT_SETTINGS, DEFAULTS_VERSION } from '../../shared/settings-defaults.js';
import { requireAdmin } from '../middleware/auth.js';
import { pickSettingsSections, SETTINGS_SECTIONS } from '../../shared/validators.js';

const router = Router();

// GET /api/settings - public
router.get('/', async (req, res) => {
  try {
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
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings - admin only
//
// WAS `router.put('/', verifyAuth, handler)`. `verifyAuth` is a return-value
// helper, NOT middleware: Express ignored its return value and it never called
// next() or wrote to res, so every request hung until the socket timed out and
// the route was effectively unauthenticated. Now it uses the real `requireAdmin`
// middleware, and the body goes through the section allowlist instead of
// Object.assign (which also permitted __proto__ reassignment).
router.put('/', requireAdmin, async (req, res) => {
  try {
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

    settings.set({ ...clean, defaultsVersion: DEFAULTS_VERSION });
    await settings.save();
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
