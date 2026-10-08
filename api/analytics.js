import connectDB from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import Analytics from './_lib/models/Analytics.js';
import { pickAnalyticsEvent, ALLOWED_EVENT_TYPES } from '../shared/validators.js';
import { str } from '../shared/http.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // ---------------------------------------------------------------- POST --
    // Public and unauthenticated, so it is the most abusable write path.
    if (req.method === 'POST') {
      const rl = checkRateLimit(req, 'analytics-post', 60, 60 * 1000);
      if (rl.blocked) {
        res.setHeader('Retry-After', String(rl.retryAfterSec || 60));
        return res.status(429).json({ error: 'Too many events. Please slow down.' });
      }

      // Was `Analytics.create(req.body)` — accepted arbitrary nested objects
      // into a Mixed field, unbounded in size and shape.
      const event = pickAnalyticsEvent(req.body);
      if (!event) {
        return res.status(400).json({
          error: 'Invalid analytics event',
          allowed: ALLOWED_EVENT_TYPES,
        });
      }
      await Analytics.create(event);
      return res.json({ ok: true });
    }

    // ----------------------------------------------------------------- GET --
    if (req.method === 'GET') {
      const admin = str(req.query?.admin) === 'true';
      const dayLimit = Math.max(0, Math.min(3650, parseInt(str(req.query?.days), 10) || 0));

      let dateFilter = {};
      if (dayLimit > 0) {
        const since = new Date();
        since.setDate(since.getDate() - dayLimit);
        dateFilter = { createdAt: { $gte: since } };
      }

      // Raw event log — admin only.
      if (admin) {
        if (!requireAdmin(req, res)) return;
        const events = await Analytics.find(dateFilter).sort({ createdAt: -1 }).limit(500);
        return res.json(events);
      }

      // Aggregated stats.
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
        if (!productStats[pid]) productStats[pid] = { views: 0, cartAdds: 0, productName: r._id.productName || r.productName || '' };
        if (r._id.eventType === 'product_view') productStats[pid].views = r.count;
        if (r._id.eventType === 'add_to_cart') productStats[pid].cartAdds = r.count;
      });

      return res.json({ productStats, daily: dailyMap });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/analytics]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
