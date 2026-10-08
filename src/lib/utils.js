// Small shared helpers used across pages/components.

/** Convert a title into a URL-safe slug. */
export const slugify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

/** Format a price in PKR. */
export const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Rs. 0';
  return `Rs. ${n.toLocaleString('en-PK')}`;
};
