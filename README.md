# Honeybee Lane

E-commerce SPA for beauty products (bangles, nails, abayas & accessories) — handcrafted for the Pakistani market.

Brand: **Honeybee Lane** (package name `honeybeelane`, folder still `MallowAndManor`)
Stack: React 19 + Vite 7 + Tailwind CSS v4 · Express.js (local) + Vercel Serverless Functions (production) · MongoDB/Mongoose · Cloudinary · JWT auth

---

## Architecture

```
MallowAndManor/
├── src/                 # React frontend (Vite dev server, port 5173)
│   ├── pages/           # Route-level components
│   ├── components/      # Shared UI (icons.js holds SVG path data)
│   └── lib/             # api.js (fetch wrapper), analytics.js, seo.js, utils.js
├── shared/              # SINGLE SOURCE OF TRUTH for backend logic
│   ├── models/          # Mongoose schemas — imported by BOTH stacks
│   ├── auth.js          # Token sign/verify + role enforcement
│   ├── express-auth.js  # Express middleware wrappers
│   ├── validators.js    # Field allowlists (mass-assignment defence)
│   ├── http.js          # Query coercion, regex escaping, IP extraction
│   ├── rate-limit.js    # Route rate limiting
│   ├── settings-defaults.js
│   └── origins.js, slug.js, cloudinary-sign.js, db.js
├── api/                 # Vercel Serverless Functions (PRODUCTION)
│   └── _lib/            # Thin re-export shims over shared/
├── server/              # Express.js (local dev, port 3001)
│   ├── routes/          # Express route files
│   ├── models/          # Thin re-export shims over shared/
│   └── seed.js          # Database seeding
├── tests/               # Verification suite for shared/
└── index.html           # SPA entry (includes GA4 tag)
```

### Why `shared/` exists

The project used to maintain **two full copies** of every model, validator, and
default-settings block — one in `api/`, one in `server/`. They drifted, and the
drift shipped as bugs: different CORS allowlists (the live domain was missing
from production), different email defaults, different validation rules, and
divergent response shapes.

All shared logic now lives in `shared/`. `api/_lib/*.js` and `server/models/*.js`
are one-line re-export shims, so there is exactly one implementation and the two
stacks cannot diverge.

---

## Commands

### Frontend + API (from `MallowAndManor/`)

```bash
npm run dev        # Vite dev server (port 5173), proxies /api to :3001
npm run server     # Express API (port 3001) with --watch
npm run build      # Production build → dist/
npm run lint       # ESLint (0 errors, 11 advisory warnings)
npm run test       # shared/ verification suite (30 checks)
npm run check      # lint + test + build  ← run this before pushing
npm run preview    # Preview production build
npm run server:seed  # Seed categories + admin users (requires ADMIN_PASSWORD)
```

### Gotcha: one mongoose copy only

`server/package.json` deliberately does **not** list `mongoose`, `cloudinary`,
`multer`, or `sharp`. A second copy in `server/node_modules` registers the models
on a different mongoose instance than the one holding the connection, so every
query dies with:

```
Operation `sitesettings.findOne()` buffering timed out after 10000ms
```

`shared/db.js` is the only place that calls `mongoose.connect()`.

---

## Environment Variables

See `.env.example` for the full annotated list. In short:

**Frontend** (Vite, prefix `VITE_` — these reach the browser bundle, never put secrets here):
- `VITE_API_URL`, `VITE_WHATSAPP_NUMBER`

**Backend** (Vercel dashboard **and** `server/.env` for local dev):
- `MONGODB_URI` — use `mongodb://` with TLS, not `mongodb+srv://` (Windows fails)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — ≥32 random bytes, mark as *sensitive* in Vercel
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` — optional; reviews return 501 without them
- `CRON_SECRET` — **required in production** for `/api/publish-scheduled`
- `ADMIN_PASSWORD`, `ADMIN_PASSWORD_2` — required by the seed script (no default)

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Authorization model

Two roles exist: `admin` and `staff`. **`User.role` defaults to `staff`** —
least privilege. Every admin endpoint asserts the role explicitly:

| Where | Guard | Shape |
|---|---|---|
| `server/routes/*` (mounted) | `requireAdmin` | middleware `(req, res, next)` |
| `server/routes/*` (in handler) | `authorizeAdmin` | handler `(req, res) → user\|null` |
| `api/*` | `requireAdmin` | handler `(req, res) → user\|null` |

> **These two shapes are not interchangeable.** Passing a handler as middleware
> hangs the request; passing middleware as a handler throws
> `next is not a function`. Both happened in this codebase. `eslint.config.js`
> now rejects the ambiguous arity, so the mistake cannot come back.

Refresh tokens are revoked on logout via `User.tokenVersion`; a refresh token
issued before logout stops working immediately.

---

## Deployment

- **Platform**: Vercel. Config in `vercel.json`.
- `api/**/*.js` deployed as serverless functions (30s max).
- SPA rewrites: all non-`/api/` routes → `/index.html`.
- **Keep functions warm**: ping `/api/health` every ~4 min (Hobby idles at ~5).
- **CI**: `.github/workflows/ci.yml` runs syntax-check → import-check → lint →
  test → build on every push to `main`.

---

## Key Files

| File | Purpose |
|------|---------|
| `shared/models/*.js` | Mongoose schemas (single source of truth) |
| `shared/validators.js` | `pickProductFields` / `pickPostFields` / `pickSettingsSections` allowlists |
| `shared/auth.js` | `verifyToken`, `authorizeAdmin`, `signTokens`, refresh-token revocation |
| `shared/express-auth.js` | `requireAdmin` / `authenticate` middleware |
| `shared/http.js` | `str()` query coercion, `escapeRegex`, `toObjectId`, `clientIp` |
| `shared/settings-defaults.js` | `DEFAULT_SETTINGS` + `DEFAULTS_VERSION` |
| `src/lib/api.js` | fetch wrapper, JWT refresh, Cloudinary upload, error normalisation |
| `src/components/RequireAdmin.jsx` | Client-side route guard for `/admin/*` |
| `src/lib/seo.js` | setMeta + JSON-LD (product/article/breadcrumb/itemList) |
| `tests/shared.test.mjs` | 30 assertions covering the security-critical logic |
| `api/seo.js` | Dynamic sitemap.xml + robots.txt (published posts only) |

---

## Security Posture

| Area | Status |
|---|---|
| Admin authorization | Role asserted on every mutation; default role is `staff` |
| NoSQL injection | Query values coerced via `str()`; ids validated via `toObjectId()` |
| Regex / ReDoS | User input escaped before building a Mongo `$regex` |
| Mass assignment | Allowlist pickers on products, posts, categories, settings, analytics |
| Prototype pollution | `pickSettingsSections` rejects `__proto__`/`constructor`/`prototype` |
| XSS | DOMPurify in the same `useMemo` that produces the only `dangerouslySetInnerHTML` |
| Rate limiting | Login (8/15min), analytics POST (60/min), search (30/min), upload sign (30/min) |
| Token storage | Access 15m, refresh 7d, revoked on logout via `tokenVersion` |
| Errors | Generic messages to clients; details logged server-side only |
| Secrets | `.env` ignored at every depth; no secrets in the bundle |

**Known limits (deliberate, documented):**
- Rate-limit counters are in-process. On Vercel that is per warm instance. For a
  hard global limit, add Vercel WAF rules or Upstash Redis.
- Tokens live in `localStorage`, so any XSS is account takeover. Mitigated by
  DOMPurify + a strict-ish CSP; the real fix is an `HttpOnly` refresh cookie.
- CSP still needs `'unsafe-inline'` for the GA4 snippet. Moving that snippet to a
  static `/gtag-init.js` would let a nonce replace it.

---

## Gotchas

- ESLint now has a Node-globals block for `api/`, `server/`, `shared/`. Without it
  every `process.env` read was a `no-undef` error, which is how a missing brace in
  `api/_lib/cors.js` shipped undetected.
- Run `npm run check` before pushing. It is the same pipeline CI runs.
- MongoDB SRV protocol fails on Windows Node.js → use `mongodb://` with TLS.
- `server/routes/categories.js` is intentionally not mounted; categories are
  served by `products.js?categories=true`.
- `index.html` has a hardcoded GA4 tag (`G-QBSRJDG28Z`) — that is a public
  measurement ID, not a secret.

## License

Honeybee Lane 2026.