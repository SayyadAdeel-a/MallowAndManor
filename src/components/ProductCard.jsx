import { useState } from "react";
import { Link } from "react-router-dom";
import { cloudUrl } from "../lib/img";
import AnimatedIcon, { ICONS } from "./AnimatedIcon";

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
  const [selectedImage, setSelectedImage] = useState(cloudUrl(product.mainImage, 500));
  const tag = getTag(product);

  return (
    <div className="group">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden mb-3 bg-gray-100 rounded-2xl shadow-sm">
        <img
          src={selectedImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Tag Badge */}
        {tag && (
          <span
            className="absolute top-3 left-3 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full shadow-sm"
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
            <AnimatedIcon
              path={isFavorite ? ICONS.heartFilled : ICONS.heart}
              animation={isFavorite ? "beat" : "none"}
              className="w-4 h-4"
              fill={isFavorite ? "currentColor" : "none"}
              strokeWidth={2}
            />
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
                className={`w-8 h-8 rounded-xl overflow-hidden border transition-all ${selectedImage === img
                    ? "border-brand-burgundy ring-1 ring-brand-burgundy/50"
                    : "border-brand-border hover:border-brand-gold"
                  }`}
              >
                <img src={cloudUrl(img, 100)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/product/${product.slug}`}>
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
          <AnimatedIcon
            path={ICONS.plus}
            animation="none"
            hoverAnimation="spin"
            className="w-4 h-4"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </div>
  );
}




