import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Render untrusted blog HTML safely.
 *
 * SINGLE SANCTIONED PATH for turning CMS content into markup. Blog content is
 * stored and edited as raw HTML (AdminPosts uses a plain <textarea>), so this is
 * Markdown-capable but not required.
 *
 * marked does NOT sanitize. It must always be followed by DOMPurify.sanitize —
 * omitting that call is a stored-XSS hole on a public page.
 */
export const renderRichText = (html) => {
  if (!html) return '';
  const raw = typeof html === 'string' ? html : String(html);
  return DOMPurify.sanitize(marked.parse(raw, { async: false, gfm: true, breaks: true }), {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
};

/** Strip all markup — for meta descriptions, excerpts, previews. */
export const stripHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(typeof html === 'string' ? html : String(html), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
};