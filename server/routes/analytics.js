import { Router } from 'express';
import Analytics from '../models/Analytics.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/analytics — public (fire-and-forget)
router.post('/', async (req, res, next) => {
  try {
    await Analytics.create(req.body);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET /api/analytics — public stats, admin events, or recent events
router.get('/', async (req, res, next) => {
  try {
    const { days, admin } = req.query;
    const dayLimit = parseInt(days) || 0;
    let dateFilter = {};
    if (dayLimit > 0) {
      const since = new Date();
      since.setDate(since.getDate() - dayLimit);
      dateFilter = { createdAt: { $gte: since } };
    }

    // Admin: /api/analytics?admin=true - returns raw events
    if (admin === 'true') {
      const user = verifyAuth(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const events = await Analytics.find(dateFilter).sort({ createdAt: -1 }).limit(500);
      return res.json(events);
    }

    // Stats: /api/analytics?days=N - aggregated data using MongoDB aggregation pipeline
    const matchStage = {
      eventType: { $in: ['product_view', 'add_to_cart', 'page_view', 'checkout'] },
      ...dateFilter,
    };

    // Daily aggregation
    const dailyPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, eventType: "$eventType" },
          count: { $sum: 1 },
        },
      },
    ];
    const dailyResults = await Analytics.aggregate(dailyPipeline);

    const dailyMap = {};
    dailyResults.forEach(r => {
      const day = r._id.date;
      if (!dailyMap[day]) dailyMap[day] = { pageViews: 0, productViews: 0, addToCart: 0, checkouts: 0 };
      if (r._id.eventType === 'page_view') dailyMap[day].pageViews = r.count;
      else if (r._id.eventType === 'product_view') dailyMap[day].productViews = r.count;
      else if (r._id.eventType === 'add_to_cart') dailyMap[day].addToCart = r.count;
      else if (r._id.eventType === 'checkout') dailyMap[day].checkouts = r.count;
    });

    // Product stats aggregation
    const productPipeline = [
      { $match: { ...matchStage, "eventData.productId": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { productId: "$eventData.productId", eventType: "$eventType" },
          count: { $sum: 1 },
          productName: { $first: "$eventData.productName" },
        },
      },
    ];
    const productResults = await Analytics.aggregate(productPipeline);

    const productStats = {};
    productResults.forEach(r => {
      const pid = r._id.productId;
      if (!productStats[pid]) productStats[pid] = { views: 0, cartAdds: 0, productName: r.productName || '' };
      if (r._id.eventType === 'product_view') productStats[pid].views = r.count;
      if (r._id.eventType === 'add_to_cart') productStats[pid].cartAdds = r.count;
    });

    res.json({ productStats, daily: dailyMap });
  } catch (err) { next(err); }
});

export default router;
