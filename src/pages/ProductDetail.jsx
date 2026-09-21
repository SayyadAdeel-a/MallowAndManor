import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackProductView } from "../lib/analytics";
import { fetchProductById } from "../lib/api";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";

export default function ProductDetail({ products, handleAddToCart, toggleFavorite, favorites }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const isFav = product ? favorites.some(f => f.id === product.id) : false;

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === id || p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.mainImage || "");
      trackProductView(foundProduct.id, foundProduct.name);
      setLoading(false);
    } else if (loading) {
      // Products list empty, still booting, or id not in it — fetch directly (self-sufficient)
      fetchProductById(id)
        .then(data => {
          if (data && !data.error) {
            const mapped = { id: data._id, name: data.name, price: data.price, category: data.category, mainImage: data.mainImage, thumbnails: data.thumbnails || [], description: data.description, createdAt: data.createdAt };
            setProduct(mapped);
            setSelectedImage(mapped.mainImage || "");
            trackProductView(mapped.id, mapped.name);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, products]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-brand-wine-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h1 className="text-2xl font-bold mb-2 text-brand-burgundy">Product not found</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">This product may have been removed or is no longer available.</p>
        <a href="/products" className="inline-block px-6 py-2 text-sm font-medium text-brand-burgundy border border-brand-border hover:border-brand-gold hover:text-brand-gold transition-colors rounded-full">
          Back to Shop
        </a>
      </div>
    );
  }

  const handleWhatsAppOrder = () => {
    const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "923233334492";
    const cleanNumber = rawNumber.replace(/\D/g, "");
    const message = `Hello Honeybee Lane,

I would like to confirm this order.

*Product Details:*
Name: ${product.name}
Price: Rs. ${product.price}
Quantity: ${quantity}
Total: Rs. ${product.price * quantity}

Link: ${window.location.href}

*Delivery Location:*
I will share my delivery location in the next message.

*Payment:*
Please let me know the available payment methods and delivery charges.

Thank you.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank");
  };

  const related = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const sameCat = a.category === product.category ? 0 : 1;
      const bSameCat = b.category === product.category ? 0 : 1;
      return sameCat - bSameCat;
    })
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/50 mb-8">
        <a href="/" className="hover:text-brand-burgundy transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-brand-burgundy transition-colors">Shop</a>
        <span>/</span>
        {product.category && (
          <>
            <a href={`/products?category=${product.category}`} className="hover:text-brand-burgundy transition-colors capitalize">{product.category}</a>
            <span>/</span>
          </>
        )}
        <span className="text-brand-burgundy truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-brand-cream border border-brand-border overflow-hidden mb-4">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.thumbnails && product.thumbnails.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {[product.mainImage, ...product.thumbnails].filter(Boolean).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square overflow-hidden border-2 transition-all ${selectedImage === img ? "border-brand-burgundy" : "border-brand-border/60 opacity-60 hover:opacity-100"
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold mb-3 block">
            {product.category}
          </span>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-brand-burgundy">{product.name}</h1>
              <p className="text-2xl font-bold text-brand-burgundy">Rs. {product.price}</p>
            </div>
            <button onClick={() => toggleFavorite(product)}
              className={`shrink-0 w-10 h-10 flex items-center justify-center border rounded-full transition-colors ${isFav ? 'border-brand-rose bg-brand-blush text-brand-rose' : 'border-brand-border text-brand-dark/40 hover:border-brand-gold hover:text-brand-gold'}`}
              title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}>
              <AnimatedIcon
                path={isFav ? ICONS.heartFilled : ICONS.heart}
                animation={isFav ? "beat" : "none"}
                className="w-5 h-5"
                fill={isFav ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>
          </div>

          {product.description && (
            <p className="text-brand-wine-dark/70 text-sm leading-relaxed mb-8">{product.description}</p>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-xs font-medium tracking-wider uppercase text-brand-wine-dark/60 mb-3 block">
              Quantity
            </label>
            <div className="inline-flex items-center border border-brand-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-blush transition-colors text-brand-wine-dark rounded-full"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-medium text-brand-wine-dark">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-blush transition-colors text-brand-wine-dark rounded-full"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => handleAddToCart(product)}
              className="flex-1 bg-brand-burgundy text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors shadow-sm rounded-full"
            >
              Add to Cart
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex-1 bg-[#25D366] text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-[#128C7E] transition-colors shadow-sm rounded-full"
            >
              Order via WhatsApp
            </button>
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            {["Free shipping on orders over Rs. 5,000", "Handcrafted with premium materials", "Nationwide delivery across Pakistan"].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <AnimatedIcon
                  path={ICONS.check}
                  animation="none"
                  className="w-4 h-4 text-brand-gold shrink-0"
                  strokeWidth={2}
                />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-gray-100">
          <h2 className="text-xl font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <div
                key={p.id}
                className="cursor-pointer group"
                onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
              >
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                  <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-sm font-medium truncate">{p.name}</h3>
                <p className="text-sm text-gray-500">Rs. {p.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
