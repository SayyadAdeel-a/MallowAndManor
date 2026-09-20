import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authenticate, verifyAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products — public (supports ?id=, ?categories=true, ?page=, ?limit=, ?category=, ?search=, ?sort=)
router.get('/', async (req, res, next) => {
  try {
    const { id, categories, admin, page, limit, category, search, sort } = req.query;

    // Categories
    if (categories === 'true') {
      const cats = await Category.find().sort({ createdAt: 1 });
      return res.json(cats);
    }

    // Single product by id
    if (id) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Not found' });
      return res.json(product);
    }

    // Admin: all products
    if (admin === 'true') {
      const user = verifyAuth(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ products, total: products.length });
    }

    // Paginated products
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

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
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ products, total, page: pageNum, totalPages, limit: limitNum });
  } catch (err) { next(err); }
});

// POST /api/products — admin (supports ?categories=true for categories)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { categories } = req.query;

    if (categories === 'true') {
      const { slug, name } = req.body;
      if (!slug || typeof slug !== 'string' || !slug.trim()) {
        return res.status(400).json({ error: 'Category slug is required' });
      }
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const category = await Category.create({ slug: slug.trim(), name: name.trim(), icon: req.body.icon || '' });
      return res.status(201).json(category);
    }

    const { name, price, category } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }
    const product = await Product.create({
      name: name.trim(),
      price,
      category: category.trim(),
      mainImage: req.body.mainImage || '',
      thumbnails: Array.isArray(req.body.thumbnails) ? req.body.thumbnails.slice(0, 5) : [],
      description: typeof req.body.description === 'string' ? req.body.description.trim() : '',
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// PUT /api/products — admin
router.put('/', authenticate, async (req, res, next) => {
  try {
    const { id, categories } = { ...req.body, ...req.query };

    if (categories === 'true') {
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
      if (!category) return res.status(404).json({ error: 'Not found' });
      return res.json(category);
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// DELETE /api/products — admin
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const { categories } = req.query;
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    if (categories === 'true') {
      await Category.findByIdAndDelete(id);
      return res.json({ success: true });
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
