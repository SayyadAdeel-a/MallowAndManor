const SITE_NAME = "Honeybee Lane";

const upsert = (selector, attrName, attrs, create) => {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(create);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (attrName) el.setAttribute(attrName, attrs.content ?? "");
  return el;
};

/**
 * Sets title, description, canonical and OG/Twitter tags for the current page.
 * jsonLd: an object or array of objects — replaces injected dynamic schema on each call.
 */
export function setMeta({ title, description, path = "/", image, type = "website", jsonLd = [], noindex = false }) {
  if (title) {
    document.title = title.includes("|") ? title : `${title} | ${SITE_NAME}`;
    upsert('meta[property="og:title"]', null, { property: "og:title", content: document.title }, "meta");
    upsert('meta[name="twitter:title"]', null, { name: "twitter:title", content: document.title }, "meta");
  }

  if (description) {
    upsert('meta[name="description"]', "content", { name: "description", content: description }, "meta");
    upsert('meta[property="og:description"]', null, { property: "og:description", content: description }, "meta");
    upsert('meta[name="twitter:description"]', null, { name: "twitter:description", content: description }, "meta");
  }

  const url = `${window.location.origin}${path}`;
  upsert('link[rel="canonical"]', null, { rel: "canonical", href: url }, "link");
  upsert('meta[property="og:url"]', null, { property: "og:url", content: url }, "meta");
  upsert('meta[property="og:type"]', null, { property: "og:type", content: type }, "meta");
  upsert('meta[name="twitter:card"]', null, { name: "twitter:card", content: "summary_large_image" }, "meta");

  // Thin-content control: keep low-inventory category pages out of the index
  const robotsEl = document.querySelector('meta[name="robots"]');
  if (robotsEl) {
    robotsEl.setAttribute("content", noindex ? "noindex, follow" : "index, follow");
  } else {
    const m = document.createElement("meta");
    m.setAttribute("name", "robots");
    m.setAttribute("content", noindex ? "noindex, follow" : "index, follow");
    document.head.appendChild(m);
  }

  if (image) {
    const abs = image.startsWith("http") ? image : `${window.location.origin}${image}`;
    upsert('meta[property="og:image"]', null, { property: "og:image", content: abs }, "meta");
    upsert('meta[name="twitter:image"]', null, { name: "twitter:image", content: abs }, "meta");
  }

  // JSON-LD — wipe previous dynamic blocks, inject fresh
  document.querySelectorAll('script[data-seo-dynamic]').forEach((el) => el.remove());
  const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  blocks.filter(Boolean).forEach((schema) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo-dynamic", "true");
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  });
}

export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${window.location.origin}${item.path}`,
  })),
});

export const itemListSchema = (products) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: (products || []).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: `${window.location.origin}/product/${p._id || p.id}`,
  })),
});

export const productSchema = ({ product, image }) => {
  const img = product.mainImage || image;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: img ? (img.startsWith("http") ? [img] : [`${window.location.origin}${img}`]) : undefined,
    sku: product._id || product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: String(product.price),
      availability: "https://schema.org/InStock",
      url: `${window.location.origin}/product/${product._id || product.id}`,
    },
  };
};

export const articleSchema = ({ post }) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt || "",
  image: post.featuredImage || undefined,
  datePublished: post.createdAt,
  author: { "@type": "Person", name: post.author || SITE_NAME },
  publisher: { "@type": "Organization", name: SITE_NAME },
});
