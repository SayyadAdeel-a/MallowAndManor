import connectDB from './_lib/db.js';
import { verifyToken } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import Post from './_lib/models/Post.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // Admin: GET /api/posts?admin=true - all posts (must be before public check)
    if (req.method === 'GET' && req.query?.admin === 'true') {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const posts = await Post.find().sort({ createdAt: -1 });
      return res.json(posts);
    }

    // Public: GET /api/posts - published posts list
    if (req.method === 'GET' && !req.query?.slug) {
      const posts = await Post.find({ published: true })
        .select('-content')
        .sort({ createdAt: -1 });
      return res.json(posts);
    }

    // Public: GET /api/posts/:slug - single post
    if (req.method === 'GET' && req.query?.slug) {
      const post = await Post.findOne({ slug: req.query.slug, published: true });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.json(post);
    }

    // Admin: POST /api/posts - create post
    if (req.method === 'POST') {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
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
      return res.status(201).json(post);
    }

    // Admin: PUT /api/posts/:id - update post
    if (req.method === 'PUT') {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...data } = req.body;
      const post = await Post.findByIdAndUpdate(id, data, { new: true });
      if (!post) return res.status(404).json({ error: 'Not found' });
      return res.json(post);
    }

    // Admin: DELETE /api/posts/:id - delete post
    if (req.method === 'DELETE') {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      await Post.findByIdAndDelete(req.body.id);
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}