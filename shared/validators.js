import { str, safeUrl, safeNumber, shortStr, hasPoisonKey } from './http.js';

// ---------------------------------------------------------------------------
// Allowlist-based field pickers. Every write path goes through these so a
// caller can never set _id, createdAt, updatedAt, or arbitrary extra keys
// (mass assignment / prototype pollution).
// ---------------------------------------------------------------------------

/** Products: only these fields may ever be written. */
export const pickProductFields = (body) => {
  const clean = {};
  if (!body || typeof body !== 'object') return clean;

  if (typeof body.name === 'string' && body.name.trim()) {
    clean.name = body.name.trim().slice(0, 200);
  }
  if (typeof body.category === 'string' && body.category.trim()) {
    clean.category = body.category.trim().slice(0, 100);
  }
  if (typeof body.description === 'string') {
    clean.description = body.description.trim().slice(0, 5000);
  }
  if (body.mainImage !== undefined) {
    clean.mainImage = typeof body.mainImage === 'string' ? body.mainImage.slice(0, 2000) : '';
  }
  if (body.thumbnails !== undefined) {
    clean.thumbnails = Array.isArray(body.thumbnails)
      ? body.thumbnails.filter((t) => typeof t === 'string').slice(0, 5)
      : [];
  }
  if (body.highlights !== undefined) {
    clean.highlights = Array.isArray(body.highlights)
      ? body.highlights
          .filter((h) => h && typeof h.text === 'string' && h.text.trim())
          .slice(0, 8)
          .map((h) => ({
            emoji: typeof h.emoji === 'string' ? h.emoji.slice(0, 8) || '✨' : '✨',
            text: h.text.trim().slice(0, 140),
          }))
      : [];
  }
  if (body.price !== undefined) {
    const n = safeNumber(body.price, { min: 0, max: 10_000_000 });
    if (n !== undefined) clean.price = n;
  }
  return clean;
};

/** Categories: slug + name + icon only. */
export const pickCategoryFields = (body) => {
  const clean = {};
  if (!body || typeof body !== 'object') return clean;
  const slug = shortStr(body.slug, 100);
  const name = shortStr(body.name, 100);
  if (slug) clean.slug = slug;
  if (name) clean.name = name;
  if (typeof body.icon === 'string') clean.icon = body.icon.slice(0, 8);
  return clean;
};

/** Posts: the same allowlist used for both create and update. */
export const pickPostFields = (body) => {
  const clean = {};
  if (!body || typeof body !== 'object') return clean;
  if (typeof body.title === 'string' && body.title.trim()) {
    clean.title = body.title.trim().slice(0, 300);
  }
  if (typeof body.slug === 'string' && body.slug.trim()) {
    clean.slug = body.slug.trim().slice(0, 300);
  }
  if (typeof body.content === 'string') clean.content = body.content.slice(0, 200_000);
  if (typeof body.excerpt === 'string') clean.excerpt = body.excerpt.trim().slice(0, 1000);
  if (typeof body.author === 'string') clean.author = body.author.trim().slice(0, 200);
  if (body.published !== undefined) clean.published = !!body.published;
  if (body.scheduledAt !== undefined) {
    if (!body.scheduledAt) {
      clean.scheduledAt = null;
    } else {
      const d = new Date(body.scheduledAt);
      clean.scheduledAt = Number.isNaN(d.getTime()) ? null : d;
    }
  }
  // A published post cannot also be scheduled.
  if (clean.published === true) clean.scheduledAt = null;
  if (typeof body.featuredImage === 'string') clean.featuredImage = body.featuredImage.slice(0, 2000);
  if (typeof body.seoTitle === 'string') clean.seoTitle = body.seoTitle.trim().slice(0, 300);
  if (typeof body.seoDescription === 'string') {
    clean.seoDescription = body.seoDescription.trim().slice(0, 500);
  }
  if (Array.isArray(body.tags)) {
    clean.tags = body.tags.filter((t) => typeof t === 'string').slice(0, 20).map((t) => t.trim().slice(0, 50));
  }
  return clean;
};

// Site settings: only known top-level sections are writable. `defaultsVersion`
// is deliberately NOT writable — otherwise a caller could pin the document to a
// high version and permanently disable the migration/backfill logic.
export const SETTINGS_SECTIONS = [
  'hero',
  'trustItems',
  'sale',
  'promises',
  'story',
  'newsletter',
  'footer',
  'contact',
  'about',
  'productPage',
  'productReviews',
  'homeReviews',
  'categoryIntros',
];

export const pickSettingsSections = (body) => {
  const clean = {};
  if (!body || typeof body !== 'object') return clean;
  if (hasPoisonKey(body)) return clean;
  for (const section of SETTINGS_SECTIONS) {
    if (body[section] !== undefined) clean[section] = body[section];
  }
  return clean;
};

// Analytics events: the POST body is user-controlled and unauthenticated, so
// only known event types with a small payload are accepted.
export const ALLOWED_EVENT_TYPES = [
  'page_view',
  'product_view',
  'add_to_cart',
  'remove_from_cart',
  'checkout',
];

const MAX_EVENT_DATA_BYTES = 2000;

export const pickAnalyticsEvent = (body) => {
  if (!body || typeof body !== 'object') return null;
  const eventType = str(body.eventType);
  if (!ALLOWED_EVENT_TYPES.includes(eventType)) return null;

  let eventData = body.eventData;
  if (eventData !== undefined && (typeof eventData !== 'object' || eventData === null || Array.isArray(eventData))) {
    eventData = undefined;
  }
  if (eventData) {
    try {
      if (JSON.stringify(eventData).length > MAX_EVENT_DATA_BYTES) eventData = undefined;
    } catch {
      eventData = undefined;
    }
  }

  const clean = { eventType, eventData };
  if (typeof body.userAgent === 'string') clean.userAgent = body.userAgent.slice(0, 500);
  if (typeof body.referrer === 'string') clean.referrer = safeUrl(body.referrer, '');
  return clean;
};
