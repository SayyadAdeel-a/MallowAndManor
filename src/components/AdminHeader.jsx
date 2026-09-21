import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../lib/api";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard" },
  { path: "/admin/posts", label: "Posts" },
  { path: "/admin/analytics", label: "Analytics" },
  { path: "/admin/reports", label: "Reports" },
];

export default function AdminHeader({ userEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const NavPill = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <button
        onClick={() => navigate(item.path)}
        className={`px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full transition-colors ${
          active
            ? "bg-brand-burgundy text-brand-cream"
            : "text-brand-wine-dark/60 hover:text-brand-burgundy hover:bg-brand-blush/50"
        }`}
      >
        {item.label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 -ml-2 text-brand-burgundy rounded-lg hover:bg-brand-blush/60 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/logo.png" alt="Honeybee Lane" className="h-9 w-9 object-contain rounded-full border border-brand-border/60" />
              <div className="leading-tight hidden sm:block">
                <p className="text-sm font-bold text-brand-burgundy font-display">Honeybee Lane</p>
                <p className="text-[10px] tracking-[0.25em] uppercase text-brand-gold">Admin Panel</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Admin navigation">
              {navItems.map((item) => <NavPill key={item.path} item={item} />)}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden sm:inline-flex items-center text-xs font-medium text-brand-burgundy bg-brand-blush/70 border border-brand-border/50 rounded-full px-3 py-1.5">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/60 hover:text-brand-burgundy border border-brand-border rounded-full px-3.5 py-1.5 hover:border-brand-gold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-brand-cream">
          <nav className="px-4 py-3 space-y-1" aria-label="Admin navigation">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-sm font-semibold tracking-wider uppercase rounded-xl transition-colors ${
                    active ? "bg-brand-burgundy text-brand-cream" : "text-brand-wine-dark/70 hover:bg-brand-blush/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
