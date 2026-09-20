import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { SkeletonGrid, ErrorState } from "../components/Skeletons";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";

const ITEMS_PER_PAGE = 12;

export default function AllProducts({ handleAddToCart, toggleFavorite, favorites }) {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    const search = params.get("search");
    const p = params.get("page");
    if (cat) setSelectedCategory(cat);
    if (search) setSearchTerm(search);
    if (p) setPage(parseInt(p) || 1);
  }, [location]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        page,
        limit: ITEMS_PER_PAGE,
        category: selectedCategory,
        search: searchTerm,
        sort: sortBy,
      });
      setProducts((data.products || []).map(p => ({ ...p, id: p._id })));
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    }
    setLoading(false);
  }, [page, selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (updates) => {
    setPage(1);
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'category') setSelectedCategory(value);
      if (key === 'search') setSearchTerm(value);
      if (key === 'sort') setSortBy(value);
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-brand-burgundy">All Products</h1>
        <p className="text-brand-wine-dark/60 text-sm">
          {total} {total === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="w-full px-4 py-2.5 bg-brand-blush/30 border border-brand-border text-brand-wine-dark placeholder:text-brand-wine-dark/40 text-sm focus:outline-none focus:border-brand-gold transition-colors"
          />
          <AnimatedIcon
            path={ICONS.search}
            animation="none"
            className="absolute right-3 top-3 w-4 h-4 text-brand-gold"
            strokeWidth={2}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => handleFilterChange({ category: "all" })}
            className={`px-4 py-2 text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-colors rounded-sm ${selectedCategory === "all" ? "bg-brand-burgundy text-brand-cream" : "text-brand-wine-dark/70 hover:text-brand-burgundy hover:bg-brand-blush/40"
              }`}
          >
            All
          </button>
          {["bangles", "nails", "abayas", "necklaces"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange({ category: cat })}
              className={`px-4 py-2 text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-colors rounded-sm ${selectedCategory === cat ? "bg-brand-burgundy text-brand-cream" : "text-brand-wine-dark/70 hover:text-brand-burgundy hover:bg-brand-blush/40"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => handleFilterChange({ sort: e.target.value })}
          className="px-4 py-2 bg-brand-blush/30 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold"
        >
          <option value="latest">Latest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={12} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                isFavorite={favorites?.some(f => f.id === product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium border border-brand-border hover:border-brand-gold hover:text-brand-burgundy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 text-sm font-medium transition-colors ${page === pageNum
                        ? "bg-brand-burgundy text-brand-cream"
                        : "border border-brand-border text-brand-wine-dark hover:border-brand-gold hover:text-brand-burgundy"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium border border-brand-border hover:border-brand-gold hover:text-brand-burgundy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          )}

          <div className="text-center mt-4 text-xs text-brand-wine-dark/60">
            Page {page} of {totalPages}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <AnimatedIcon
            path={ICONS.search}
            animation="pulse"
            className="w-12 h-12 mx-auto mb-4 text-brand-wine-dark/20"
            strokeWidth={1.5}
          />
          <p className="text-brand-wine-dark/60 text-sm mb-2">No products found.</p>
          <p className="text-brand-wine-dark/40 text-xs mb-4">Try adjusting your search or filter.</p>
          <button
            onClick={() => handleFilterChange({ category: "all", search: "" })}
            className="text-sm font-medium text-brand-burgundy underline hover:text-brand-gold transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
