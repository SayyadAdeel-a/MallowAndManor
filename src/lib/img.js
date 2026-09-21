// Cloudinary delivery optimization: injects f_auto/q_auto/width transforms.
// Non-Cloudinary URLs (local files, etc.) pass through untouched.
export function cloudUrl(url, width = 800) {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  const transform = `f_auto,q_auto,w_${width}`;
  if (url.includes("/upload/") && /\/upload\/[^/]*f_auto/.test(url)) return url; // already transformed
  return url.replace("/upload/", `/upload/${transform}/`);
}
