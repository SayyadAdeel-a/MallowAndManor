import { useState, useEffect } from "react";
import { fetchProducts } from "../lib/api";
import ProductCard from "./ProductCard";

export default function ProductsSection({ onAddToCart, favorites = [], onToggleFavorite }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchProducts({ page: 1, limit: 8, sort: "latest" })
      .then((data) => {
        setProducts((data?.products || []).map(p => ({ ...p, id: p._id })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = (products || []).filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  return (
    <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4 block">
            Discovery
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-burgundy">
            Curated Selection
          </h2>
        </div>

        {/* Category filters */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "bangles", label: "Bangles" },
            { id: "nails", label: "Nails" },
            { id: "abayas", label: "Abayas" },
            { id: "necklaces", label: "Necklaces" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap rounded-sm ${selectedCategory === cat.id
                  ? "bg-brand-burgundy text-brand-cream shadow-sm"
                  : "text-brand-wine-dark/70 hover:text-brand-burgundy hover:bg-brand-blush/40"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product)}
              isFavorite={favorites.some(f => f.id === product.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-brand-wine-dark/60">
            No products found. Check back soon for new arrivals.
          </p>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="text-center mt-12">
          <a
            href="/products"
            className="inline-block text-sm font-semibold tracking-wider uppercase border-b-2 border-brand-burgundy text-brand-burgundy pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors"
          >
            View All Products
          </a>
        </div>
      )}
    </section>
  );
}
