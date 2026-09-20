import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../lib/api";

const navItems = [
  { path: "/admin/dashboard", label: "Products" },
  { path: "/admin/analytics", label: "Analytics" },
  { path: "/admin/reports", label: "Reports" },
  { path: "/admin/posts", label: "Posts" },
];

export default function AdminHeader({ userEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <header className="bg-brand-cream border-b border-brand-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1 -ml-1 text-brand-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Honeybee Lane" className="h-8 w-auto object-contain" />
          </Link>
          <h1 className="text-sm font-bold tracking-wider uppercase text-brand-burgundy">Admin</h1>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                  location.pathname === item.path
                    ? "text-brand-burgundy border-b-2 border-brand-gold"
                    : "text-brand-black/60 hover:text-brand-burgundy"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-brand-dark/60 hidden sm:block">{userEmail}</span>
          <button onClick={handleLogout} className="text-xs text-brand-black/60 hover:text-brand-burgundy transition-colors font-medium">
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-border bg-brand-cream">
          <div className="px-6 py-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-sm font-semibold tracking-wider uppercase transition-colors ${
                  location.pathname === item.path
                    ? "text-brand-burgundy bg-brand-blush"
                    : "text-brand-black/60 hover:text-brand-burgundy"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
