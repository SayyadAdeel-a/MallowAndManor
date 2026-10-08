import { Router } from 'express';
import Analytics from '../models/Analytics.js';
import { authorizeAdmin } from '../middleware/auth.js';
import { checkRateLimit } from '../../shared/rate-limit.js';
import { pickAnalyticsEvent, ALLOWED_EVENT_TYPES } from '../../shared/validators.js';
import { str } from '../../shared/http.js';

const router = Router();

// POST /api/analytics - public (fire-and-forget)
router.post('/', async (req, res, next) => {
  try {
    const rl = checkRateLimit(req, 'analytics-post', 60, 60 * 1000);
    if (rl.blocked) {
      res.setHeader('Retry-After', String(rl.retryAfterSec || 60));
      return res.status(429).json({ error: 'Too many events. Please slow down.' });
    }

    // Was `Analytics.create(req.body)` - accepted arbitrary nested objects into
    // a Mixed field, unbounded in size and shape.
    const event = pickAnalyticsEvent(req.body);
    if (!event) {
      return res.status(400).json({ error: 'Invalid analytics event', allowed: ALLOWED_EVENT_TYPES });
    }
    await Analytics.create(event);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET /api/analytics - public stats, or raw events for admins
router.get('/', async (req, res, next) => {
  try {
    const { days, admin } = req.query;
    const dayLimit = Math.max(0, Math.min(3650, parseInt(str(days), 10) || 0));
    let dateFilter = {};
    if (dayLimit > 0) {
      const since = new Date();
      since.setDate(since.getDate() - dayLimit);
      dateFilter = { createdAt: { $gte: since } };
    }

    if (str(admin) === 'true') {
      const user = authorizeAdmin(req, res);
      if (!user) return;
      const events = await Analytics.find(dateFilter).sort({ createdAt: -1 }).limit(500);
      return res.json(events);
    }

    const matchStage = {
      eventType: { $in: ['product_view', 'add_to_cart', 'page_view', 'checkout'] },
      ...dateFilter,
    };

    const dailyResults = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, eventType: '$eventType' },
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyMap = {};
    dailyResults.forEach((r) => {
      const day = r._id.date;
      if (!dailyMap[day]) dailyMap[day] = { pageViews: 0, productViews: 0, addToCart: 0, checkouts: 0 };
      if (r._id.eventType === 'page_view') dailyMap[day].pageViews = r.count;
      else if (r._id.eventType === 'product_view') dailyMap[day].productViews = r.count;
      else if (r._id.eventType === 'add_to_cart') dailyMap[day].addToCart = r.count;
      else if (r._id.eventType === 'checkout') dailyMap[day].checkouts = r.count;
    });

    const productResults = await Analytics.aggregate([
      { $match: { ...matchStage, 'eventData.productId': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { productId: '$eventData.productId', eventType: '$eventType' },
          count: { $sum: 1 },
          productName: { $first: '$eventData.productName' },
        },
      },
    ]);

    const productStats = {};
    productResults.forEach((r) => {
      const pid = r._id.productId;
      if (!productStats[pid]) {
        productStats[pid] = { views: 0, cartAdds: 0, productName: r.productName || '' };
      }
      if (r._id.eventType === 'product_view') productStats[pid].views = r.count;
      if (r._id.eventType === 'add_to_cart') productStats[pid].cartAdds = r.count;
    });

    res.json({ productStats, daily: dailyMap });
  } catch (err) { next(err); }
});

export default router;
