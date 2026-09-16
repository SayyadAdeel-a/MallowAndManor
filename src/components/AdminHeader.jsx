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
    <header className="bg-brand-cream border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Honeybee Lane" className="h-6 w-auto" />
          </Link>
          <h1 className="text-sm font-bold tracking-wider uppercase">Admin</h1>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors ${
                  location.pathname === item.path
                    ? "text-brand-dark"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-brand-cream">
          <div className="px-6 py-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-sm font-medium tracking-wider uppercase transition-colors ${
                  location.pathname === item.path
                    ? "text-brand-dark bg-gray-50"
                    : "text-gray-400 hover:text-gray-600"
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
