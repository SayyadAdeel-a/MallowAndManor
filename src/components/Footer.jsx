import { Link } from "react-router-dom";
import AnimatedIcon, { ICONS } from "./AnimatedIcon";

export default function Footer() {
  return (
    <footer className="bg-brand-wine-dark text-brand-cream border-t border-brand-burgundy">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 block w-fit">
              <img src="/logo.png" alt="Honeybee Lane" className="h-14 md:h-16 w-auto object-contain" />
            </Link>
            <p className="text-brand-cream/60 text-sm leading-relaxed max-w-sm mb-6">
              Premium bangles, abayas, nails and accessories,
              thoughtfully curated for modern living.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/honeybeelane/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-brand-gold/30 rounded-full flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-brand-wine-dark transition-all"
                aria-label="Instagram"
              >
                <AnimatedIcon
                  path={ICONS.instagram}
                  animation="wiggle"
                  className="w-4 h-4"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </a>
              <a
                href="https://www.tiktok.com/@honeybeelane?lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-brand-gold/30 rounded-full flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-brand-wine-dark transition-all"
                aria-label="TikTok"
              >
                <AnimatedIcon
                  path={ICONS.tiktok}
                  animation="bounce"
                  className="w-4 h-4"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-6 text-brand-gold">Shop</h4>
            <ul className="space-y-3 text-sm text-brand-cream/70">
              <li><Link to="/products" className="hover:text-brand-gold transition-colors">All Products</Link></li>
              <li><Link to="/products?category=bangles" className="hover:text-brand-gold transition-colors">Bangles</Link></li>
              <li><Link to="/products?category=nails" className="hover:text-brand-gold transition-colors">Nails</Link></li>
              <li><Link to="/products?category=abayas" className="hover:text-brand-gold transition-colors">Abayas</Link></li>
              <li><Link to="/products?category=necklaces" className="hover:text-brand-gold transition-colors">Necklaces</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-6 text-brand-gold">Company</h4>
            <ul className="space-y-3 text-sm text-brand-cream/70">
              <li><Link to="/about" className="hover:text-brand-gold transition-colors">Our Story</Link></li>
              <li><Link to="/blog" className="hover:text-brand-gold transition-colors">Journal</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Contact</Link></li>
              <li><Link to="/favorites" className="hover:text-brand-gold transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-brand-gold transition-colors">Cart</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-brand-burgundy pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-cream/50">
          <p>&copy; 2026 Honeybee Lane. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a
              href="https://syab.tech/mentee"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-gold transition-colors"
            >
              Made with Love by Mentee
            </a>
            <Link to="#" className="hover:text-brand-gold transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-brand-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
