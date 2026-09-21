import connectDB from './_lib/db.js';
import Product from './_lib/models/Product.js';
import Category from './_lib/models/Category.js';
import Post from './_lib/models/Post.js';

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'honeybeelane.vercel.app';
  const base = `${proto}://${host}`;
  const now = new Date().toISOString();

  const urls = [
    { loc: `${base}/`, lastmod: now, priority: '1.0' },
    { loc: `${base}/shop`, lastmod: now, priority: '0.9' },
    { loc: `${base}/blog`, lastmod: now, priority: '0.6' },
    { loc: `${base}/about`, lastmod: now, priority: '0.4' },
    { loc: `${base}/contact`, lastmod: now, priority: '0.4' },
  ];

  try {
    await connectDB();
    const [categories, products, posts] = await Promise.all([
      Category.find().lean(),
      Product.find({}, { createdAt: 1 }).lean(),
      Post.find({}, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    // Category pages publish only when they have 3+ products (thin-content gate)
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
    console.error('Sitemap DB error, serving static routes only:', err.message);
  }

  const xml = `${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  return res.status(200).send(xml);
}
