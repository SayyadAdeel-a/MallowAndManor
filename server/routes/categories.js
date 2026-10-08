import { Router } from 'express';
import Category from '../models/Category.js';
import { requireAdmin } from '../middleware/auth.js';
import { pickCategoryFields } from '../../shared/validators.js';
import { toObjectId } from '../../shared/http.js';

const router = Router();

// NOTE: this router was never mounted in server/index.js — categories are
// served by products.js via ?categories=true. Kept mounted-free on purpose.

router.get('/', async (req, res, next) => {
  try {
    res.json(await Category.find().sort({ createdAt: 1 }));
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const clean = pickCategoryFields(req.body);
    if (!clean.slug) return res.status(400).json({ error: 'Category slug is required' });
    if (!clean.name) return res.status(400).json({ error: 'Category name is required' });
    res.status(201).json(await Category.create(clean));
  } catch (err) { next(err); }
});

router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const id = toObjectId(req.body?.id);
    if (!id) return res.status(400).json({ error: 'Invalid or missing id' });
    const category = await Category.findByIdAndUpdate(id, pickCategoryFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) { next(err); }
});

router.delete('/', requireAdmin, async (req, res, next) => {
  try {
    const id = toObjectId(req.body?.id);
    if (!id) return res.status(400).json({ error: 'Invalid or missing id' });
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
