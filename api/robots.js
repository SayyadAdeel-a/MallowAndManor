export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'honeybeelane.vercel.app';

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /favorites

Sitemap: ${proto}://${host}/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400');
  return res.status(200).send(robots);
}
