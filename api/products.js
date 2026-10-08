import mongoose from 'mongoose';
import connectDB from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import Product from './_lib/models/Product.js';
import Category from './_lib/models/Category.js';
import { pickProductFields, pickCategoryFields } from '../shared/validators.js';
import { slugifyName, uniqueSlug } from '../shared/slug.js';
import { str, shortStr, literalRegex, toObjectId } from '../shared/http.js';

// One-time lazy backfill: give every legacy product a slug.
// Bounded per invocation so a cold start can never burn the whole function budget.
const BACKFILL_BATCH = 25;
const backfillProductSlugs = async () => {
  const missing = await Product
    .find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] })
    .limit(BACKFILL_BATCH);
  for (const p of missing) {
    const slug = await uniqueSlug(Product, p.name, p._id);
    await Product.updateOne({ _id: p._id }, { slug });
  }
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // ---------------------------------------------------------------- GET --
    if (req.method === 'GET') {
      // Admin: ?admin=true — full catalogue including drafts
      if (req.query?.admin === 'true') {
        if (!requireAdmin(req, res)) return;
        await backfillProductSlugs();
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json({ products, total: products.length });
      }

      // Public: ?categories=true
      if (req.query?.categories === 'true') {
        const categories = await Category.find().sort({ createdAt: 1 });
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
        return res.json(categories);
      }

      // Public: ?id=<slug> — single product
      if (req.query?.id) {
        const product = await Product.findOne({ slug: shortStr(req.query.id, 120).toLowerCase() });
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=600');
        return res.json(product);
      }

      // Public: paginated / filtered list
      const page = Math.max(1, parseInt(str(req.query.page), 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(str(req.query.limit), 10) || 12));
      const skip = (page - 1) * limit;
      const category = shortStr(req.query.category, 100);
      const search = shortStr(req.query.search, 100);
      const sort = str(req.query.sort);

      const filter = {};
      if (category && category !== 'all') filter.category = category;

      if (search) {
        // Escape user input before building the regex. Unescaped, this was a
        // public ReDoS vector (`?search=(a+)+$`) and a data-exfiltration oracle.
        const rx = literalRegex(search, 100);
        if (rx) {
          filter.$or = [
            { name: { $regex: rx } },
            { description: { $regex: rx } },
          ];
        }
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price-low') sortOption = { price: 1 };
      else if (sort === 'price-high') sortOption = { price: -1 };

      // Throttle the public search path — it is unauthenticated and hits Mongo.
      if (search) {
        const rl = checkRateLimit(req, 'product-search', 30, 60 * 1000);
        if (rl.blocked) {
          res.setHeader('Retry-After', String(rl.retryAfterSec || 60));
          return res.status(429).json({ error: 'Too many searches. Please slow down.' });
        }
      }

      await backfillProductSlugs();

      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(skip).limit(limit),
        Product.countDocuments(filter),
      ]);

      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=30');
      return res.json({ products, total, page, totalPages: Math.ceil(total / limit), limit });
    }

    // --------------------------------------------------------------- POST --
    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;

      if (req.query?.categories === 'true') {
        const clean = pickCategoryFields(req.body);
        if (!clean.slug) return res.status(400).json({ error: 'Category slug is required' });
        if (!clean.name) return res.status(400).json({ error: 'Category name is required' });
        const category = await Category.create(clean);
        return res.status(201).json(category);
      }

      const clean = pickProductFields(req.body);
      if (!clean.name) return res.status(400).json({ error: 'Product name is required' });
      if (clean.price === undefined) return res.status(400).json({ error: 'Valid numeric price is required' });
      if (!clean.category) return res.status(400).json({ error: 'Category is required' });

      const base = req.body?.slug ? slugifyName(req.body.slug) : clean.name;
      clean.slug = await uniqueSlug(Product, base);
      return res.status(201).json(await Product.create(clean));
    }

    // ---------------------------------------------------------------- PUT --
    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;

      const id = toObjectId(req.body?.id);
      if (!id) return res.status(400).json({ error: 'Invalid or missing id' });

      if (req.query?.categories === 'true') {
        const clean = pickCategoryFields(req.body);
        const category = await Category.findByIdAndUpdate(id, clean, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ error: 'Not found' });
        return res.json(category);
      }

      const clean = pickProductFields(req.body);
      const existing = await Product.findById(id);
      if (!existing) return res.status(404).json({ error: 'Not found' });
      if (Object.keys(clean).length === 0 && !req.body?.slug) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const nameChanged = clean.name && clean.name !== existing.name;
      if (req.body?.slug || nameChanged) {
        clean.slug = await uniqueSlug(
          Product,
          req.body?.slug ? slugifyName(req.body.slug) : (clean.name || existing.name),
          id,
        );
      }

      const product = await Product.findByIdAndUpdate(id, clean, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ error: 'Not found' });
      return res.json(product);
    }

    // ------------------------------------------------------------- DELETE --
    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;

      const id = toObjectId(req.body?.id);
      if (!id) return res.status(400).json({ error: 'Invalid or missing id' });

      if (req.query?.categories === 'true') {
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        return res.json({ success: true });
      }

      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    // Log server-side; return a generic message so internal details
    // (collection names, index definitions) don't leak to the client.
    console.error('[api/products]', err);
    if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
