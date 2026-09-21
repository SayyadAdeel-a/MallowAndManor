import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { trackProductView } from "../lib/analytics";
import { fetchProductById, fetchSettings, fetchProducts } from "../lib/api";
import { setMeta, breadcrumbSchema, productSchema } from "../lib/seo";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";
import NewsletterCTA from "../components/NewsletterCTA";
import Reveal from "../components/Reveal";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "923233334492";

const DEFAULT_PP = {
  sizesLabel: "Size",
  sizes: ["S", "M", "L", "XL"],
  showSizes: true,
  highlights: [
    { emoji: "✨", text: "Handcrafted with premium materials" },
    { emoji: "🚚", text: "Fast delivery across Pakistan" },
    { emoji: "💎", text: "Premium quality guarantee" },
    { emoji: "🎁", text: "Beautiful gift-ready packaging" },
    { emoji: "📦", text: "Free shipping over Rs. 5,000" },
  ],
  whatsappOrderLabel: "Order via WhatsApp",
  showWhatsappOrder: true,
  reviewsHeading: "Customer Reviews",
  showReviews: true,
  writeReviewLabel: "Write a Review",
  alsoLikeHeading: "You May Also Like",
  alsoLikeCount: 4,
  featuresTitle: "Features",
  craftedText: "Crafted from high-quality materials with attention to every detail, this piece offers comfort, versatility and timeless style.",
  noteText: "Note: You can wear these pieces with almost every outfit.",
  shippingInfo: { title: "Shipping Information", text: "We deliver nationwide across Pakistan. Free shipping on orders above Rs. 5,000." },
};

function Stars({ rating = 0, className = "w-4 h-4" }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={className} fill={i <= Math.round(rating) ? "#C59B58" : "#EBDED5"} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetail({ products, handleAddToCart, toggleFavorite, favorites }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [related, setRelated] = useState([]);
  const [shippingOpen, setShippingOpen] = useState(false);
  const isFav = product ? favorites.some(f => f.id === product.id) : false;

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === id || p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.mainImage || "");
      trackProductView(foundProduct.id, foundProduct.name);
      setLoading(false);
    } else if (loading) {
      fetchProductById(id)
        .then(data => {
          if (data && !data.error) {
            const mapped = { id: data._id, name: data.name, price: data.price, category: data.category, mainImage: data.mainImage, thumbnails: data.thumbnails || [], description: data.description, highlights: data.highlights || [], createdAt: data.createdAt };
            setProduct(mapped);
            setSelectedImage(mapped.mainImage || "");
            trackProductView(mapped.id, mapped.name);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, products]); // eslint-disable-line react-hooks/exhaustive-deps

  // Related products — derive from props when available, else fetch directly
  useEffect(() => {
    if (products?.length) {
      setRelated(products.filter(p => p.id !== id && p._id !== id).slice(0, 8));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProducts({ page: 1, limit: 50 });
        if (cancelled) return;
        const list = (Array.isArray(data) ? data : data?.products || [])
          .filter(p => (id ? p._id !== id : true))
          .slice(0, 8)
          .map(p => ({ id: p._id, name: p.name, price: p.price, category: p.category, mainImage: p.mainImage, thumbnails: p.thumbnails || [], description: p.description }));
        setRelated(list);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [id, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <AnimatedIcon path={ICONS.package} animation="float" className="w-16 h-16 mx-auto mb-4 text-brand-wine-dark/20" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold mb-2 text-brand-burgundy">Product not found</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">This product may have been removed or is no longer available.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 text-sm font-medium text-brand-burgundy border border-brand-border hover:border-brand-gold hover:text-brand-gold transition-colors rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }

  const pp = { ...DEFAULT_PP, ...(settings?.productPage || {}) };

  // SEO: product meta + Product JSON-LD
  useEffect(() => {
    if (!product) return;
    setMeta({
      title: `${product.name} — Rs. ${Number(product.price).toLocaleString()}`,
      description: product.description
        ? `${product.description.slice(0, 140)}`
        : `${product.name} by Honeybee Lane. Premium handcrafted quality with nationwide delivery across Pakistan. Order via WhatsApp.`,
      path: `/product/${product.id}`,
      image: product.mainImage,
      type: "product",
      jsonLd: [
        productSchema({ product }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.name, path: `/product/${product.id}` },
        ]),
      ],
    });
  }, [product]);
  // Per-product highlights first, then global settings, then built-in defaults
  const prodHighlights = product.highlights?.length
    ? product.highlights
    : pp.highlights?.length
      ? pp.highlights
      : DEFAULT_PP.highlights;
  const ppReviews = (settings?.productReviews || []).filter(r => r.body || r.author);
  const avgRating = ppReviews.length
    ? ppReviews.reduce((s, r) => s + (r.rating || 5), 0) / ppReviews.length
    : 5;
  const thumbs = [product.mainImage, ...(product.thumbnails || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const images = thumbs.length ? thumbs : [product.mainImage || "/hero-banner.webp"];

  const handleWhatsAppOrder = () => {
    const message = `Hello! I would like to order:\n\nProduct: ${product.name}\nPrice: Rs. ${product.price}\nQuantity: ${quantity}${selectedSize ? `\nSize: ${selectedSize}` : ""}\n\n[Product link: ${window.location.href}]`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleAdd = () => {
    handleAddToCart(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-brand-wine-dark/50 mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-burgundy transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-burgundy transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-brand-burgundy font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* ============ LEFT: Gallery ============ */}
        <Reveal>
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-cream border border-brand-border/50">
            <img src={images[0] || selectedImage} alt={product.name} className="w-full h-full object-cover" />
            <button
              onClick={() => toggleFavorite(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors ${isFav ? "bg-brand-rose/90 border-brand-rose text-white" : "bg-white/80 border-brand-border/60 text-brand-wine-dark/50 hover:text-brand-gold hover:border-brand-gold"}`}
              aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
            >
              <AnimatedIcon path={isFav ? ICONS.heartFilled : ICONS.heart} animation={isFav ? "beat" : "none"} className="w-5 h-5" fill={isFav ? "currentColor" : "none"} strokeWidth={1.8} />
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === 0 ? "border-brand-gold" : "border-brand-border/50 opacity-60 hover:opacity-100"}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        </Reveal>

        {/* ============ RIGHT: Info panel ============ */}
        <Reveal delay={80}>
        <div>
          {/* Title + rating */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-burgundy leading-tight mb-3">
            {product.name}
          </h1>

          {pp.showReviews && ppReviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={avgRating} />
              <span className="text-xs text-brand-wine-dark/50 underline underline-offset-2">
                {ppReviews.length} customer review{ppReviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Price */}
          <p className="text-2xl font-bold text-brand-burgundy mb-2">
            Rs. {Number(product.price).toLocaleString()}
          </p>
          <p className="text-xs text-brand-wine-dark/50 mb-5">Shipping calculated at checkout.</p>

          {/* Highlights */}
          {prodHighlights.filter(h => h.text).length > 0 && (
            <ul className="space-y-2.5 mb-7">
              {prodHighlights.filter(h => h.text).map((h, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-sm" aria-hidden="true">
                    {h.emoji || "✨"}
                  </span>
                  <span className="text-sm text-brand-wine-dark/75 font-medium">{h.text}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Sizes */}
          {pp.showSizes && pp.sizes?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/60 mb-2.5">{pp.sizesLabel || "Size"}</p>
              <div className="flex flex-wrap gap-2.5">
                {pp.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s === selectedSize ? "" : s)}
                    className={`min-w-[44px] px-3.5 py-2 text-sm font-semibold rounded-full border transition-all ${
                      selectedSize === s
                        ? "bg-brand-burgundy text-brand-cream border-brand-burgundy"
                        : "border-brand-border text-brand-wine-dark hover:border-brand-gold hover:text-brand-gold"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/60 mb-2.5">Quantity</p>
            <div className="inline-flex items-center border border-brand-border rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-brand-blush rounded-l-full transition-colors text-brand-wine-dark" aria-label="Decrease quantity">−</button>
              <span className="w-12 text-center text-sm font-semibold text-brand-wine-dark">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-brand-blush rounded-r-full transition-colors text-brand-wine-dark" aria-label="Increase quantity">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-10">
            <button
              onClick={handleAdd}
              className="w-full bg-brand-burgundy text-brand-cream py-3.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors shadow-sm"
            >
              Add to Cart
            </button>

            {/* WhatsApp order */}
            {pp.showWhatsappOrder && (
              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-white py-3.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-[#128C7E] transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {pp.whatsappOrderLabel || "Order via WhatsApp"}
              </button>
            )}
          </div>

          {/* Seems right under the CTA: mini also-like list */}
          {related.length > 0 && (
            <div className="border-t border-brand-border/60 pt-6 mb-8">
              <p className="text-sm font-semibold text-brand-burgundy mb-4">You may also like</p>
              <div className="space-y-3">
                {related.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 group">
                    <img
                      src={p.mainImage || "/hero-banner.webp"}
                      alt=""
                      className="w-12 h-14 object-cover rounded-lg border border-brand-border/50 cursor-pointer"
                      onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
                    />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}>
                      <p className="text-sm font-medium text-brand-burgundy truncate group-hover:text-brand-gold transition-colors">{p.name}</p>
                      <p className="text-xs text-brand-wine-dark/50">Rs. {Number(p.price).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-full border border-brand-border text-brand-wine-dark hover:bg-brand-burgundy hover:text-brand-cream hover:border-brand-burgundy transition-all"
                    >
                      <AnimatedIcon path={ICONS.plus} animation="none" className="w-3 h-3" strokeWidth={2} />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description + crafted + features + note */}
          <div className="border-t border-brand-border/60 pt-6 space-y-5">
            {product.description && (
              <p className="text-sm text-brand-wine-dark/70 leading-relaxed">{product.description}</p>
            )}
            {pp.craftedText && (
              <p className="text-sm text-brand-wine-dark/70 leading-relaxed">{pp.craftedText}</p>
            )}
            {pp.noteText && (
              <p className="text-sm text-brand-wine-dark/60 leading-relaxed italic">{pp.noteText}</p>
            )}
          </div>
        </div>
        </Reveal>
      </div>

      {/* ============ Customer Reviews ============ */}
      {pp.showReviews && (
        <Reveal as="section" className="mt-16 border-t border-brand-border/60 pt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-burgundy font-display mb-8">{pp.reviewsHeading}</h2>

          {ppReviews.length === 0 ? (
            <div className="text-center py-10 bg-brand-cream/40 rounded-2xl border border-brand-border/40">
              <p className="text-sm text-brand-wine-dark/60 mb-4">No reviews yet — be the first to share your experience.</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'd like to leave a review for ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 text-xs font-bold tracking-wider uppercase rounded-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-cream transition-all"
              >
                {pp.writeReviewLabel}
              </a>
            </div>
          ) : (
            <div>
              {/* Aggregate */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-burgundy font-display">{avgRating.toFixed(1)}</p>
                  <Stars rating={avgRating} className="w-3.5 h-3.5 mx-auto mt-1" />
                  <p className="text-[11px] text-brand-wine-dark/50 mt-1">{ppReviews.length} review{ppReviews.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="sm:border-l sm:border-brand-border/60 sm:pl-5">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'd like to leave a review for ${product.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 text-xs font-bold tracking-wider uppercase rounded-full border border-brand-burgundy text-brand-burgundy hover:bg-brand-burgundy hover:text-brand-cream transition-all"
                  >
                    {pp.writeReviewLabel}
                  </a>
                </div>
              </div>

              {/* Review list */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {ppReviews.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-brand-border/50 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-blush flex items-center justify-center text-xs font-bold text-brand-burgundy">
                          {(r.author || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-burgundy">{r.author || "Anonymous"}</p>
                          <Stars rating={r.rating || 5} className="w-3 h-3" />
                        </div>
                      </div>
                      {r.date && <span className="text-[11px] text-brand-wine-dark/40">{r.date}</span>}
                    </div>
                    <p className="text-sm text-brand-wine-dark/70 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      )}

      {/* ============ Shipping accordion ============ */}
      {pp.shippingInfo?.text && (
        <Reveal className="mt-14">
          <div className="border border-brand-border/60 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShippingOpen(!shippingOpen)}
              className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold tracking-[0.25em] uppercase text-brand-burgundy hover:bg-brand-cream/50 transition-colors"
              aria-expanded={shippingOpen}
            >
              {pp.shippingInfo.title || "Shipping Information"}
              <svg className={`w-4 h-4 transition-transform duration-300 ${shippingOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            {shippingOpen && (
              <div className="animate-fade-slide px-8 pb-6 pt-1 border-t border-brand-border/40">
                <p className="text-sm text-brand-wine-dark/70 leading-relaxed text-center max-w-2xl mx-auto">{pp.shippingInfo.text}</p>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* ============ You May Also Like grid ============ */}
      {related.length > 0 && (
        <Reveal as="section" className="mt-16 border-t border-brand-border/60 pt-12">
          <div className="text-center mb-10">
            <div className="w-10 h-px bg-brand-gold mx-auto mb-5" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-burgundy font-display">{pp.alsoLikeHeading}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.slice(0, pp.alsoLikeCount || 4).map((p) => (
              <div key={p.id} className="group cursor-pointer" onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}>
                <div className="hover-lift relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-cream border border-brand-border/50 mb-3">
                  <img src={p.mainImage || "/hero-banner.webp"} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p className="text-sm font-semibold text-brand-burgundy group-hover:text-brand-gold transition-colors truncate">{p.name}</p>
                <p className="text-sm text-brand-wine-dark/60">Rs. {Number(p.price).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* ============ Stay Connected ============ */}
      <section className="mt-16 mb-4">
        <NewsletterCTA />
      </section>
    </div>
  );
}

