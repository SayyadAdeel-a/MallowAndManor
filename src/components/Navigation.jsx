import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimatedIcon, { ICONS } from "./AnimatedIcon";

export default function Navigation({ cartCount, favCount }) {
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
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid #EBDED5' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2"
            style={{ color: '#4A0E17' }}
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
            <Link to="/products" className="text-xs font-semibold tracking-widest uppercase hover:text-brand-gold transition-colors" style={{ color: '#4A0E17' }}>
              Shop
            </Link>
            <Link to="/blog" className="text-xs font-semibold tracking-widest uppercase hover:text-brand-gold transition-colors" style={{ color: '#4A0E17' }}>
              Journal
            </Link>
            <Link to="/about" className="text-xs font-semibold tracking-widest uppercase hover:text-brand-gold transition-colors" style={{ color: '#4A0E17' }}>
              Story
            </Link>
            <Link to="/contact" className="text-xs font-semibold tracking-widest uppercase hover:text-brand-gold transition-colors" style={{ color: '#4A0E17' }}>
              Contact
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
                className="w-32 lg:w-48 px-3.5 py-1.5 rounded-full text-xs focus:outline-none transition-colors"
                style={{ backgroundColor: '#F5E8EB', borderColor: '#EBDED5', color: '#340910', borderWidth: '1px' }}
              />
              <button
                onClick={() => { if (searchTerm.trim()) { navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`); setSearchTerm(""); } }}
                className="absolute right-2 p-1 rounded-full hover:opacity-80 transition-opacity"
                aria-label="Search"
              >
                <svg className="w-3.5 h-3.5" style={{ color: '#C59B58' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <Link to="/favorites" className="relative p-1 hover:opacity-80 transition-opacity">
              <AnimatedIcon
                path={ICONS.heart}
                animation="beat"
                className="w-5 h-5 text-brand-pink"
                strokeWidth={1.5}
              />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold" style={{ backgroundColor: '#C59B58', color: '#340910' }}>
                  {favCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-1 hover:opacity-80 transition-opacity">
              <AnimatedIcon
                path={ICONS.bag}
                animation="float"
                className="w-5 h-5 text-brand-burgundy"
                strokeWidth={1.5}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold" style={{ backgroundColor: '#C59B58', color: '#340910' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t ${isMobileMenuOpen ? "max-h-[60vh] py-6" : "max-h-0"
          }`}
        style={{ backgroundColor: '#FAF7F2', borderColor: '#EBDED5' }}
      >
        <div className="px-6 space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-4 py-2.5 rounded-full text-sm focus:outline-none"
              style={{ backgroundColor: '#F5E8EB', borderColor: '#EBDED5', color: '#340910', borderWidth: '1px' }}
            />
            <button
              onClick={() => { if (searchTerm.trim()) { navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`); setSearchTerm(""); setIsMobileMenuOpen(false); } }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              aria-label="Search"
            >
              <svg className="w-4 h-4" style={{ color: '#C59B58' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase" style={{ color: '#4A0E17' }}>
            Shop
          </Link>
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase" style={{ color: '#4A0E17' }}>
            Journal
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase" style={{ color: '#4A0E17' }}>
            Story
          </Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold tracking-wider uppercase" style={{ color: '#4A0E17' }}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
