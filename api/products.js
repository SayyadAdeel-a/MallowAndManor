import connectDB from './_lib/db.js';
import { verifyToken } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import Product from './_lib/models/Product.js';
import Category from './_lib/models/Category.js';

// In-memory cache for product count (resets on cold start, which is fine for Vercel)
let productCountCache = { count: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // Admin: GET /api/products?admin=true - all products
    if (req.method === 'GET' && req.query?.admin === 'true') {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ products, total: products.length });
    }

    // Public: GET /api/products?page=1&limit=12&category=bangles&search=gold&sort=latest
    if (req.method === 'GET' && !req.query?.id && !req.query?.categories) {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
      const skip = (page - 1) * limit;
      const { category, search, sort } = req.query;

      // Build filter
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      let sortOption = { createdAt: -1 };
      if (sort === 'price-low') sortOption = { price: 1 };
      else if (sort === 'price-high') sortOption = { price: -1 };

      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(skip).limit(limit),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Cache briefly at the edge, browsers must revalidate
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=30');

      return res.json({ products, total, page, totalPages, limit });
    }

    // Public: GET /api/products?categories=true - all categories
    if (req.method === 'GET' && req.query?.categories === 'true') {
      const categories = await Category.find().sort({ createdAt: 1 });
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
      return res.json(categories);
    }

    // Public: GET /api/products?id=xxx - single product
    if (req.method === 'GET' && req.query?.id) {
      const product = await Product.findById(req.query.id);
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
      return res.json(product);
    }

    // Admin operations
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Extract only allowed product fields from body (blocks _id, timestamps, garbage)
    const pickProductFields = (body) => {
      const clean = {};
      if (typeof body.name === 'string' && body.name.trim()) clean.name = body.name.trim();
      if (typeof body.category === 'string' && body.category.trim()) clean.category = body.category.trim();
      if (typeof body.description === 'string') clean.description = body.description.trim();
      if (body.mainImage !== undefined) clean.mainImage = typeof body.mainImage === 'string' ? body.mainImage : '';
      if (body.thumbnails !== undefined) clean.thumbnails = Array.isArray(body.thumbnails) ? body.thumbnails.filter((t) => typeof t === 'string').slice(0, 5) : [];
      if (body.highlights !== undefined) {
        clean.highlights = Array.isArray(body.highlights)
          ? body.highlights
              .filter((h) => h && typeof h.text === 'string' && h.text.trim())
              .slice(0, 8)
              .map((h) => ({ emoji: typeof h.emoji === 'string' ? h.emoji.slice(0, 8) || '✨' : '✨', text: h.text.trim().slice(0, 140) }))
          : [];
      }
      // Coerce price from string or number; explicit null/NaN becomes undefined -> validation catches it
      if (body.price !== undefined) {
        const n = typeof body.price === 'number' ? body.price : parseFloat(body.price);
        if (!Number.isNaN(n)) clean.price = n;
      }
      return clean;
    };

    if (req.method === 'POST' && !req.query?.categories) {
      const clean = pickProductFields(req.body);
      if (!clean.name) return res.status(400).json({ error: 'Product name is required' });
      if (clean.price === undefined) return res.status(400).json({ error: 'Valid numeric price is required' });
      if (!clean.category) return res.status(400).json({ error: 'Category is required' });
      const product = await Product.create(clean);
      productCountCache.count = null;
      return res.status(201).json(product);
    }

    if (req.method === 'POST' && req.query?.categories === 'true') {
      const category = await Category.create(req.body);
      return res.status(201).json(category);
    }

    if (req.method === 'PUT' && !req.query?.categories) {
      const clean = pickProductFields(req.body);
      if (Object.keys(clean).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      const product = await Product.findByIdAndUpdate(req.body.id, clean, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ error: 'Not found' });
      return res.json(product);
    }

    if (req.method === 'PUT' && req.query?.categories === 'true') {
      const { id, ...data } = req.body;
      const category = await Category.findByIdAndUpdate(id, data, { new: true });
      if (!category) return res.status(404).json({ error: 'Not found' });
      return res.json(category);
    }

    if (req.method === 'DELETE' && !req.query?.categories) {
      await Product.findByIdAndDelete(req.body.id);
      productCountCache.count = null; // Invalidate cache
      return res.json({ success: true });
    }

    if (req.method === 'DELETE' && req.query?.categories === 'true') {
      await Category.findByIdAndDelete(req.body.id);
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
