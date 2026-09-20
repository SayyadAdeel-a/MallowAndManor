import { useState } from "react";
import { Link } from "react-router-dom";

const tagColors = {
  sale: { bg: "#4A0E17", text: "#ffffff" },
  new: { bg: "#340910", text: "#FAF7F2" },
  bestseller: { bg: "#C59B58", text: "#340910" },
  hot: { bg: "#D495A0", text: "#340910" },
};

function getTag(product) {
  const name = product.name?.toLowerCase() || "";
  if (name.includes("gold") || name.includes("premium")) return { label: "Bestseller", key: "bestseller" };
  if (product.price > 1000) return { label: "Premium", key: "new" };
  if (product.price < 500) return { label: "Sale", key: "sale" };
  return null;
}

export default function ProductCard({ product, onAddToCart, isFavorite, onToggleFavorite }) {
  const [selectedImage, setSelectedImage] = useState(product.mainImage);
  const tag = getTag(product);

  return (
    <div className="group">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden mb-3 bg-gray-100">
        <img
          src={selectedImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Tag Badge */}
        {tag && (
          <span
            className="absolute top-3 left-3 px-3 py-1 text-[10px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: tagColors[tag.key].bg, color: tagColors[tag.key].text }}
          >
            {tag.label}
          </span>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite(product); }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-brand-cream/90 hover:bg-brand-cream text-brand-gold hover:text-brand-burgundy rounded-full transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </Link>

      {/* Thumbnails */}
      {product.thumbnails && product.thumbnails.length > 0 && (
        <div className="flex gap-1.5 mb-3">
          {[product.mainImage, ...product.thumbnails]
            .filter(Boolean)
            .slice(0, 4)
            .map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(img)}
                className={`w-8 h-8 rounded overflow-hidden border transition-all ${selectedImage === img
                    ? "border-brand-burgundy ring-1 ring-brand-burgundy/50"
                    : "border-brand-border hover:border-brand-gold"
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-medium truncate text-brand-black hover:text-brand-burgundy transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm font-bold text-brand-burgundy">Rs. {product.price?.toLocaleString()}</p>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          className="shrink-0 w-9 h-9 flex items-center justify-center border border-brand-border rounded-full hover:bg-brand-burgundy hover:text-white hover:border-brand-burgundy transition-all shadow-sm"
          title="Add to cart"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
