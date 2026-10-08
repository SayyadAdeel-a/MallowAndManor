import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { requireAdmin, authorizeAdmin } from '../middleware/auth.js';
import { checkRateLimit } from '../../shared/rate-limit.js';
import { pickProductFields, pickCategoryFields } from '../../shared/validators.js';
import { slugifyName, uniqueSlug } from '../../shared/slug.js';
import { str, shortStr, literalRegex, toObjectId } from '../../shared/http.js';

const router = Router();

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

// GET /api/products — public (supports ?id=, ?categories=true, ?admin=true,
// ?page=, ?limit=, ?category=, ?search=, ?sort=)
router.get('/', async (req, res, next) => {
  try {
    const { categories, admin } = req.query;

    // Admin catalogue
    if (str(admin) === 'true') {
      const user = authorizeAdmin(req, res);
      if (!user) return;
      await backfillProductSlugs();
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ products, total: products.length });
    }

    // Categories
    if (str(categories) === 'true') {
      const cats = await Category.find().sort({ createdAt: 1 });
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
      return res.json(cats);
    }

    // Single product by slug only
    const id = shortStr(req.query.id, 120);
    if (id) {
      const product = await Product.findOne({ slug: id.toLowerCase() });
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=600');
      return res.json(product);
    }

    // Paginated list
    const page = Math.max(1, parseInt(str(req.query.page), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(str(req.query.limit), 10) || 12));
    const skip = (page - 1) * limit;
    const category = shortStr(req.query.category, 100);
    const search = shortStr(req.query.search, 100);
    const sort = str(req.query.sort);

    const filter = {};
    if (category && category !== 'all') filter.category = category;

    if (search) {
      // Escaped — see api/products.js for the ReDoS explanation.
      const rx = literalRegex(search, 100);
      if (rx) filter.$or = [{ name: { $regex: rx } }, { description: { $regex: rx } }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };

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
  } catch (err) { next(err); }
  }
);

// POST /api/products — admin (create product, or a category when ?categories=true)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    if (str(req.query.categories) === 'true') {
      const clean = pickCategoryFields(req.body);
      if (!clean.slug) return res.status(400).json({ error: 'Category slug is required' });
      if (!clean.name) return res.status(400).json({ error: 'Category name is required' });
      return res.status(201).json(await Category.create(clean));
    }

    // pickProductFields lives in shared/validators.js at module scope — it was
    // previously declared INSIDE this handler's block, so the PUT handler below
    // referenced an undefined identifier and threw ReferenceError on every
    // product edit.
    const clean = pickProductFields(req.body);
    if (!clean.name) return res.status(400).json({ error: 'Product name is required' });
    if (clean.price === undefined) return res.status(400).json({ error: 'Valid numeric price is required' });
    if (!clean.category) return res.status(400).json({ error: 'Category is required' });

    const base = req.body?.slug ? slugifyName(req.body.slug) : clean.name;
    clean.slug = await uniqueSlug(Product, base);
    return res.status(201).json(await Product.create(clean));
  } catch (err) { next(err); }
});

// PUT /api/products — admin
router.put('/', requireAdmin, async (req, res, next) => {
  try {
    // id comes from the body only. Previously `{ ...req.body, ...req.query }`
    // let a query-string id silently override the body's.
    const objectId = toObjectId(req.body?.id);
    if (!objectId) return res.status(400).json({ error: 'Invalid or missing id' });

    if (str(req.query.categories) === 'true') {
      const clean = pickCategoryFields(req.body);
      const category = await Category.findByIdAndUpdate(objectId, clean, { new: true, runValidators: true });
      if (!category) return res.status(404).json({ error: 'Not found' });
      return res.json(category);
    }

    const clean = pickProductFields(req.body);
    const existing = await Product.findById(objectId);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (Object.keys(clean).length === 0 && !req.body?.slug) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const nameChanged = clean.name && clean.name !== existing.name;
    if (req.body?.slug || nameChanged) {
      clean.slug = await uniqueSlug(
        Product,
        req.body?.slug ? slugifyName(req.body.slug) : (clean.name || existing.name),
        objectId,
      );
    }

    const product = await Product.findByIdAndUpdate(objectId, clean, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    return res.json(product);
  } catch (err) { next(err); }
});

// DELETE /api/products — admin
router.delete('/', requireAdmin, async (req, res, next) => {
  try {
    const objectId = toObjectId(req.body?.id);
    if (!objectId) return res.status(400).json({ error: 'Invalid or missing id' });

    if (str(req.query.categories) === 'true') {
      const deleted = await Category.findByIdAndDelete(objectId);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      return res.json({ success: true });
    }

    const deleted = await Product.findByIdAndDelete(objectId);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
