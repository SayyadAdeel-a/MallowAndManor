import connectDB from './_lib/db.js';
import Product from './_lib/models/Product.js';
import Category from './_lib/models/Category.js';
import Post from './_lib/models/Post.js';

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const CANONICAL_HOST = 'honeybeelane.vercel.app';

// Escape text for XML character data / attribute values.
const xmlEscape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Resolve the canonical origin.
 *
 * The Host / X-Forwarded-Host header is client-supplied on a bare Express
 * server. Interpolating it unvalidated into robots.txt + sitemap.xml with a long
 * s-maxage is a classic cache/SEO-poisoning vector. Only hosts we recognise are
 * accepted; everything else falls back to the canonical origin.
 */
const origin = (req) => {
  const proto = /^https$/i.test(req.headers['x-forwarded-proto'] || '') ? 'https' : 'https';
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  const host = rawHost && (rawHost === CANONICAL_HOST || rawHost.endsWith('.vercel.app') || rawHost === 'honeybeelane.com' || rawHost.endsWith('.honeybeelane.com'))
    ? rawHost
    : CANONICAL_HOST;
  return `${proto}://${host}`;
};

export default async function handler(req, res) {
  const path = String(req.query?.path || req.url?.split('?')[0] || '');

  // ------------------------------------------------------------ robots.txt --
  if (path.endsWith('robots.txt')) {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /favorites

Sitemap: ${origin(req)}/sitemap.xml`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400');
    return res.status(200).send(robots);
  }

  // ----------------------------------------------------------- sitemap.xml --
  const base = origin(req);
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
      Category.find({}, { slug: 1 }).lean(),
      Product.find({}, { slug: 1, category: 1, createdAt: 1 }).lean(),
      // Filtered: previously every draft and scheduled-post slug was published
      // in the sitemap, handing out a wordlist of unpublished content.
      Post.find(
        { published: true, $or: [{ scheduledAt: null }, { scheduledAt: { $exists: false } }] },
        { slug: 1, updatedAt: 1 },
      ).lean(),
    ]);

    const countByCategory = {};
    for (const p of products) {
      countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
    }
    for (const c of categories) {
      if ((countByCategory[c.slug] || 0) >= 3) {
        urls.push({ loc: `${base}/shop/${encodeURIComponent(c.slug)}`, lastmod: now, priority: '0.8' });
      }
    }
    for (const p of products) {
      urls.push({
        loc: `${base}/product/${encodeURIComponent(p.slug || p._id)}`,
        lastmod: p.createdAt ? new Date(p.createdAt).toISOString() : now,
        priority: '0.7',
      });
    }
    for (const post of posts) {
      if (!post.slug) continue;
      urls.push({
        loc: `${base}/blog/${encodeURIComponent(post.slug)}`,
        lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : now,
        priority: '0.5',
      });
    }
  } catch (err) {
    console.error('[api/seo] DB error, serving static routes only:', err.message);
  }

  const xml = `${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${xmlEscape(u.lastmod)}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  return res.status(200).send(xml);
}
