// Slug helpers shared by both API stacks.

export const slugifyName = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

/**
 * Return a slug that is not already taken.
 * The Product.slug index is intentionally non-unique for backfill safety, so
 * uniqueness is enforced here with an explicit existence check.
 */
export const uniqueSlug = async (Model, base, excludeId = null) => {
  const root = slugifyName(base) || 'item';
  let candidate = root;
  let n = 1;
  // Bounded to avoid an infinite loop if the collection is pathological.
  while (n < 200) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query).select('_id').lean();
    if (!exists) return candidate;
    candidate = `${root}-${++n}`;
  }
  return `${root}-${Date.now().toString(36)}`;
};
