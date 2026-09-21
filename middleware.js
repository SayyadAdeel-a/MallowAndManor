// Edge middleware: serve real 404s for malformed product/blog URLs.
// Valid-format but deleted content still renders the SPA (which shows its own not-found state).
export const config = {
  matcher: ["/product/:path*", "/blog/:path*"],
};

const notFoundPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page not found — Honeybee Lane</title>
  <meta name="robots" content="noindex" />
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAF7F2; font-family: Georgia, serif; color: #340910; }
    .c { text-align: center; padding: 2rem; }
    h1 { font-size: 3rem; margin: 0 0 0.5rem; }
    p { font-family: system-ui, sans-serif; color: #6b5560; max-width: 26rem; margin: 0 auto 1.5rem; line-height: 1.6; }
    a { font-family: system-ui, sans-serif; font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; color: #340910; border: 1px solid #C59B58; padding: 0.8rem 1.8rem; border-radius: 999px; transition: all 0.2s; }
    a:hover { background: #C59B58; color: #340910; }
  </style>
</head>
<body>
  <div class="c">
    <h1>404</h1>
    <p>The page you're looking for doesn't exist or may have been moved.</p>
    <a href="/">Back to Honeybee Lane</a>
  </div>
</body>
</html>`;

export default function middleware(request) {
  const { pathname } = new URL(request.url);
  const segments = pathname.split("/").filter(Boolean);
  const kind = segments[0]; // "product" or "blog"
  const idOrSlug = segments[1];

  // Bare /blog is a real page (the listing) — let the SPA handle it
  if (kind === "blog" && segments.length === 1) {
    return;
  }

  // /product or /blog/x/y — malformed
  if (!idOrSlug || segments.length > 2) {
    return new Response(notFoundPage, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Product URLs accept SEO slugs only (no raw Mongo ids)
  if (kind === "product" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(idOrSlug)) {
    return new Response(notFoundPage, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Blog slugs are lowercase kebab-case
  if (kind === "blog" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(idOrSlug)) {
    return new Response(notFoundPage, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Valid format — hand off to the SPA
  return;
}
