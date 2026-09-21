// SEO files: /sitemap.xml and /robots.txt — mirrors api/sitemap.js and api/robots.js
import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Post from '../models/Post.js';

const router = Router();

router.get('/sitemap.xml', async (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const now = new Date().toISOString();

  const urls = [
    { loc: `${base}/`, lastmod: now, priority: '1.0' },
    { loc: `${base}/shop`, lastmod: now, priority: '0.9' },
    { loc: `${base}/blog`, lastmod: now, priority: '0.6' },
    { loc: `${base}/about`, lastmod: now, priority: '0.4' },
    { loc: `${base}/contact`, lastmod: now, priority: '0.4' },
  ];

  try {
    const [categories, products, posts] = await Promise.all([
      Category.find().lean(),
      Product.find().lean(),
      Post.find({}, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    const countByCategory = {};
    for (const p of products) {
      countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
    }
    for (const c of categories) {
      if ((countByCategory[c.slug] || 0) >= 3) {
        urls.push({ loc: `${base}/shop/${c.slug}`, lastmod: now, priority: '0.8' });
      }
    }
    for (const p of products) {
      urls.push({ loc: `${base}/product/${p.slug || p._id}`, lastmod: p.createdAt ? new Date(p.createdAt).toISOString() : now, priority: '0.7' });
    }
    for (const post of posts) {
      urls.push({ loc: `${base}/blog/${post.slug}`, lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : now, priority: '0.5' });
    }
  } catch (err) {
    console.error('Sitemap DB error:', err.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

router.get('/robots.txt', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /favorites

Sitemap: ${base}/sitemap.xml`);
});

export default router;
