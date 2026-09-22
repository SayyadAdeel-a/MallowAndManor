import { Router } from 'express';
import Post from '../models/Post.js';
import { authenticate, verifyAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/posts — public (supports ?slug= for single post, ?admin=true for admin)
router.get('/', async (req, res, next) => {
  try {
    const { slug, admin } = req.query;

    // Single post by slug
    if (slug) {
      const post = await Post.findOne({ slug, published: true });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.json(post);
    }

    // Admin: all posts
    if (admin === 'true') {
      const user = verifyAuth(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const posts = await Post.find().sort({ createdAt: -1 });
      return res.json(posts);
    }

    // Default: published posts list
    const posts = await Post.find({ published: true }).select('-content').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { next(err); }
});

// POST /api/posts — admin (create post)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, slug } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Post title is required' });
    }
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return res.status(400).json({ error: 'Post slug is required' });
    }
    const post = await Post.create({
      title: title.trim(),
      slug: slug.trim(),
      content: typeof req.body.content === 'string' ? req.body.content : '',
      excerpt: typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : '',
      author: typeof req.body.author === 'string' ? req.body.author.trim() : '',
      published: !!req.body.published,
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      featuredImage: typeof req.body.featuredImage === 'string' ? req.body.featuredImage : '',
      seoTitle: typeof req.body.seoTitle === 'string' ? req.body.seoTitle.trim() : '',
      seoDescription: typeof req.body.seoDescription === 'string' ? req.body.seoDescription.trim() : '',
    });
    res.status(201).json(post);
  } catch (err) { next(err); }
});

// PUT /api/posts — admin (update post)
router.put('/', authenticate, async (req, res, next) => {
  try {
    const { id, ...data } = req.body;
    const post = await Post.findByIdAndUpdate(id, data, { new: true });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

// DELETE /api/posts — admin (delete post)
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const { id } = req.body;
    await Post.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
