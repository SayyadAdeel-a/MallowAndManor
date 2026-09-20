import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navigation({ cartCount, favCount, categories }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-brand-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Left nav links - desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-xs font-semibold tracking-widest uppercase text-brand-black hover:text-brand-gold transition-colors">
              Shop
            </Link>
            <Link to="/blog" className="text-xs font-semibold tracking-widest uppercase text-brand-black hover:text-brand-gold transition-colors">
              Journal
            </Link>
            <Link to="/about" className="text-xs font-semibold tracking-widest uppercase text-brand-black hover:text-brand-gold transition-colors">
              Story
            </Link>
          </div>

          {/* Logo - center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <img src="/logo.png" alt="Honeybee Lane" className="h-14 md:h-16 w-auto object-contain" />
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Search - desktop */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-32 lg:w-48 px-3 py-1.5 rounded-full text-xs focus:outline-none transition-colors bg-brand-blush border border-brand-gold-light text-brand-black placeholder:text-brand-dark/50 focus:border-brand-gold"
              />
              <svg className="absolute right-3 w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <Link to="/favorites" className="relative p-1 text-brand-gold hover:text-brand-burgundy transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold bg-brand-gold text-white">
                  {favCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-1 text-brand-black hover:text-brand-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold bg-brand-burgundy text-brand-cream">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-brand-border bg-brand-cream ${
          isMobileMenuOpen ? "max-h-[60vh] py-6" : "max-h-0"
        }`}
      >
        <div className="px-6 space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none bg-brand-blush border border-brand-gold-light text-brand-black focus:border-brand-gold"
            />
          </div>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase text-brand-black">
            Shop
          </Link>
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase text-brand-black">
            Journal
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase text-brand-black">
            Story
          </Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase text-brand-black">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
