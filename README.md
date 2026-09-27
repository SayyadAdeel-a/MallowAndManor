# Honeybee Lane

E-commerce SPA for beauty products (bangles, nails, abayas & accessories) — handcrafted for the Pakistani market.

Brand: **Honeybee Lane** (package name `honeybeelane`, folder still `MallowAndManor`)
Tech stack: React 19 + Vite 7 + Tailwind CSS v4 frontend; Express.js local server + MongoDB/Mongoose for dev; Vercel Serverless Functions for production; Cloudinary for images; JWT auth

---

## Architecture

```
MallowAndManor/
├── src/              # React frontend (Vite dev server, port 5173)
│   ├── pages/        # Route-level components (14 pages)
│   ├── components/   # Shared UI components
│   └── lib/          # api.js (fetch wrapper), analytics.js
├── api/              # Vercel Serverless Functions (production)
│   └── _lib/         # Shared: db.js, auth.js, cloudinary.js, models/
├── server/           # Express.js server (local dev, port 3001)
│   ├── routes/       # Express route files
│   ├── models/       # Mongoose models (mirror api/_lib/models/)
│   └── seed.js       # Database seeding script
└── index.html        # SPA entry point (includes GA4 tag)
```

## Dual API Setup

`server/` runs locally via Express on port 3001. `api/` contains Vercel serverless functions for production. Vite proxies `/api` → `localhost:3001` in dev.

## Commands

### Frontend (from `MallowAndManor/`)

```bash
npm run dev        # Vite dev server (port 5173), proxies /api to :3001
npm run build      # Production build → dist/
npm run lint       # ESLint (flat config, .js/.jsx only)
npm run preview    # Preview production build
```

### Server (from `MallowAndManor/server/`)

```bash
npm run dev        # Express with --watch (port 3001)
npm run start      # Production Express
npm run seed       # Seed MongoDB database
```

## Deployment

- **Platform**: Vercel. Config in `vercel.json`.
- `api/**/*.js` deployed as serverless functions (30s max duration).
- SPA rewrites: all non-`/api/` routes → `/index.html`.
- Keep serverless functions warm: ping `/api/health` every ~4 min.

## Key Files

| File | Purpose |
|------|---------|
| `MallowAndManor/AGENTS.md` | repo instruction file |
| `middleware.js` | Edge middleware for product/blog slug validation + 404 |
| `vercel.json` | redirects, rewrites (sitemap, robots, SPA), headers (HSTS, CSP, immutable font/asset cache) |
| `index.html` | static SEO meta, self-hosted font preloads, hero image preload |
| `src/index.css` | Tailwind v4 `@theme`, 12 `@font-face` rules, motion tokens (`--ease-out` etc.), `.reveal`/`.reveal-visible`, badge-pop, hover-lift, `.scrollbar-hide`, `.urdu-text` |
| `src/lib/seo.js` | setMeta, breadcrumbSchema, itemListSchema, productSchema, articleSchema |
| `src/lib/img.js` | `cloudUrl()` Cloudinary transform helper |
| `src/lib/api.js` | fetch wrapper, JWT refresh, `uploadImage()`, `resolveUploadUrl()`, `fetchSettings()`, `fetchProductById()` |
| `src/components/AnimatedIcon.jsx` | 7 animation types, 30+ icon paths, `IconStyle` component |
| `src/components/Reveal.jsx` | IntersectionObserver scroll reveal (one-shot) |
| `src/pages/Home.jsx` | 9 sections with Reveal wrappers, settings-driven content, visibilitychange auto-refresh |
| `src/pages/AllProducts.jsx` | `/shop/:slug?` routing, legacy redirect, SEO meta, category intros, noindex gate |
| `src/pages/ProductDetail.jsx` | gallery (clickable thumbnails), highlights, sizes, reviews, shipping accordion, related grid, newsletter CTA |
| `src/pages/AdminDashboard.jsx` | 10-tab CMS controlling all site content |
| `src/pages/AdminLogin.jsx` | JWT login |
| `src/components/AdminHeader.jsx` | admin nav bar |
| `api/_lib/models/SiteSettings.js` | full schema with hero, trustItems, sale, promises, story, newsletter, footer, contact, productPage |
| `api/products.js` | slugifyName, uniqueSlug, backfillProductSlugs, pickProductFields whitelist |
| `api/settings.js` | DEFAULT_SETTINGS with corrected content, DEFAULTS_VERSION=3, additive backfill |
| `api/sitemap.js` | dynamic XML sitemap (categories gated at 3+ products) |
| `api/robots.js` | robots.txt with dynamic sitemap URL |
| `api/google-reviews.js` | Google Places API (New) proxy with 30-min cache |

## Environment Variables

**Frontend** (Vite, prefix `VITE_`):
- `VITE_API_URL` — API base URL (defaults to `/api` via Vite proxy)
- `VITE_WHATSAPP_NUMBER` — WhatsApp contact number

**Backend** (set in Vercel dashboard, not in `.env` for production):
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — JWT signing keys
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Recent Fixes

- **Mobile side-scroll fix**: added `overflow-x: clip` to `html/body`, `.scrollbar-hide` utility, patched `ProductsSection` and `AllProducts` tab strips
- **WhatsApp button**: converted from `window.open()` to `<a href="..." target="_blank">` (popup blocker fix)
- **Hero subtitle lag**: fixed content swap by aligning fallback text with DB default
- **Admin redesign**: new AdminHeader, admin CSS tokens, page header polish
- **60-day blog system**: 61 SEO-optimized posts with auto-publishing, scheduled content, internal backlinks, featured images

## SEO System

- `src/lib/seo.js` — setMeta(), JSON-LD schemas (product/article/breadcrumb/itemList)
- Dynamic `sitemap.xml` + `robots.txt` via serverless functions
- Per-page meta/title/canonical, category intros, thin-content noindex gate
- Edge middleware 404s malformed product/blog URLs

## Performance

- Code splitting (React.lazy + Suspense)
- Main bundle optimized
- Self-hosted fonts (300KB, 12 woff2 files)
- Cloudinary transforms via `cloudUrl()`
- `loading="lazy"` + `decoding="async"` on images
- Immutable 1-year cache on `/fonts` + `/assets`
- HSTS header

## Gotchas

- ESLint ignores `dist/`. Unused uppercase/underscore vars allowed (`no-unused-vars` pattern: `^[A-Z_]`)
- CORS origins: `localhost:5173`, `honeybeelane.vercel.app`, `honeybeelane.com`
- `index.html` has hardcoded GA4 tag (`G-QBSRJDG28Z`)
- `server/` and `api/` both have Mongoose models — keep in sync
- MongoDB SRV protocol fails on Windows Node.js → use `mongodb://` with `tls: true`

## License

Honeybee Lane 2026.