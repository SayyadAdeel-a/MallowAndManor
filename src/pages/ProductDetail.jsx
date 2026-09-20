import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackProductView } from "../lib/analytics";

export default function ProductDetail({ products, handleAddToCart, toggleFavorite, favorites }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const isFav = product ? favorites.some(f => f.id === product.id) : false;

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.mainImage || "");
      trackProductView(foundProduct.id, foundProduct.name);
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin" />
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
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-brand-dark/50 hover:text-brand-burgundy transition-colors mb-8 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

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
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
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
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-blush transition-colors text-brand-wine-dark"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-medium text-brand-wine-dark">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-blush transition-colors text-brand-wine-dark"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => handleAddToCart(product)}
              className="flex-1 bg-brand-burgundy text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors shadow-sm"
            >
              Add to Cart
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex-1 bg-[#25D366] text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-[#128C7E] transition-colors shadow-sm"
            >
              Order via WhatsApp
            </button>
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            {["Free shipping on orders over Rs. 5,000", "Handcrafted with premium materials", "Nationwide delivery across Pakistan"].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <svg className="w-4 h-4 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
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
