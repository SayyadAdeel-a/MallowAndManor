import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function Favorites({ favorites, addToCart, removeFromFavorites }) {
  const navigate = useNavigate();

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <h1 className="text-2xl font-bold mb-3 text-brand-burgundy">Your wishlist is empty</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">Save items you love for later.</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-brand-burgundy text-brand-cream px-8 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors shadow-sm rounded-full"
        >
          Discover Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-burgundy">Wishlist</h1>
          <p className="text-sm text-brand-wine-dark/60 mt-1">{favorites.length} {favorites.length === 1 ? "item" : "items"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <div key={product.id} className="group">
            <div className="relative">
              <ProductCard product={product} onAddToCart={() => addToCart(product)} />
              <button
                onClick={() => removeFromFavorites(product.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-brand-cream/90 flex items-center justify-center text-brand-wine-dark/50 hover:text-brand-burgundy rounded-full border border-brand-border/60 transition-colors z-10"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
