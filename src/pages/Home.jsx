import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import Collections from "../components/Collections";
import ProductsSection from "../components/ProductsSection";

const trustItems = [
  { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Free Shipping over Rs. 5,000" },
  { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", label: "Handcrafted with Intention" },
  { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", label: "Premium Quality Materials" },
  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Delivered Across Pakistan" },
];

const categoryCards = [
  { id: "necklaces", name: "Necklaces", tagline: "Royal adornments", image: "/earrings-portrait.webp" },
  { id: "bangles", name: "Bangles", tagline: "Artisanal adornments", image: "/image_3.webp" },
  { id: "nails", name: "Nails", tagline: "Precision artistry", image: "/nails-art.webp" },
  { id: "abayas", name: "Abayas", tagline: "Silk & sobriety", image: "/earrings-stud.webp" },
];

export default function Home({ handleAddToCart, toggleFavorite, favorites }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const scrollRef = useRef(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero */}
      <HeroCarousel />

      {/* Marquee trust bar */}
      <div className="overflow-hidden border-b border-gray-100 py-5">
        <div
          className="flex w-max"
          style={{
            animation: "trust-marquee 20s linear infinite",
          }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {trustItems.map((item, i) => (
                <div key={`${copy}-${i}`} className="inline-flex items-center gap-2.5 px-8">
                  <svg className="w-4 h-4 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  <span className="text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes trust-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Collections */}
      <Collections
        onCategoryClick={(cat) => navigate(`/products?category=${cat}`)}
      />

      {/* Featured Products */}
      <ProductsSection
        onAddToCart={handleAddToCart}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* Editorial sale banner */}
      <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-brand-wine-dark min-h-[420px] grid grid-cols-1 md:grid-cols-2">
          {/* Left: copy */}
          <div className="relative z-10 p-10 md:p-16 lg:p-20 flex flex-col justify-center">
            <span className="inline-block text-[10px] font-bold tracking-[0.4em] uppercase mb-4 px-3 py-1.5 rounded-full border border-brand-gold/40 text-brand-gold w-fit">
              Limited Time
            </span>
            <h2 className="text-6xl md:text-8xl font-black leading-[0.9] mb-6 text-white">
              30%
              <br />
              <span className="text-brand-gold">OFF</span>
            </h2>
            <p className="text-brand-cream/70 text-sm md:text-base mb-8 max-w-md leading-relaxed">
              Our entire Abaya collection. Handcrafted luxury, now at prices that make elegance accessible.
            </p>
            <a
              href="/products?category=abayas"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs font-bold tracking-wider uppercase rounded-full transition-all duration-300 hover:gap-5 w-fit"
              style={{ backgroundColor: "#C59B58", color: "#340910" }}
            >
              Shop Abayas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          {/* Right: image */}
          <div className="relative h-[300px] md:h-auto overflow-hidden">
            <img
              src="/earrings-hand.webp"
              alt="Earrings collection"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-wine-dark via-brand-wine-dark/50 to-transparent md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-wine-dark via-transparent to-transparent md:hidden" />
          </div>
          {/* Decorative corner circles */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="#C59B58" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="60" stroke="#C59B58" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="40" stroke="#C59B58" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* Category carousel */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-3 block">
                Explore
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-burgundy">
                Shop by Category
              </h2>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-10 h-10 flex items-center justify-center border border-brand-border rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors"
                aria-label="Scroll left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 flex items-center justify-center border border-brand-border rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors"
                aria-label="Scroll right"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(`/products?category=${card.id}`)}
                className="snap-start shrink-0 w-[280px] md:w-[320px] cursor-pointer group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase block mb-1" style={{ color: "#C59B58" }}>
                      {card.tagline}
                    </span>
                    <span className="text-sm font-bold text-white">Shop Now →</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-brand-burgundy group-hover:text-brand-gold transition-colors">
                  {card.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax story section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url(/earrings-stud.webp)" }}
        />
        <div className="absolute inset-0 bg-brand-wine-dark/70" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="max-w-xl">
            <div className="w-12 h-px bg-brand-gold mx-auto mb-6" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-gold mb-4 block">
              Our Story
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">
              The Art of<br />Refinement
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto">
              We believe luxury isn't about the price tag — it's about wearing something created with intention.
            </p>
            <a
              href="/about"
              className="inline-flex items-center gap-3 px-8 py-3.5 border border-brand-gold text-brand-gold text-xs font-bold tracking-wider uppercase hover:bg-brand-gold hover:text-brand-cream transition-all duration-300 rounded-full"
            >
              Read Our Story
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <div className="w-12 h-px bg-brand-gold mx-auto mt-6" />
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-brand-black py-12 px-6 md:py-16 md:px-16 text-center text-brand-cream rounded-2xl overflow-hidden shadow-sm">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-4 block">
            Stay Connected
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 !text-white" style={{ color: "#ffffff" }}>
            Join the Inner Circle
          </h2>
          <p className="text-white/80 text-sm max-w-md mx-auto mb-8">
            Sign up for early access to exclusive drops and seasonal events.
          </p>
          {subscribed ? (
            <p className="text-brand-gold text-sm font-semibold">Thank you for subscribing!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 bg-brand-cream/10 border border-brand-cream/20 text-brand-cream text-sm placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-cream/50 transition-colors rounded-full"
              />
              <button type="submit" className="px-8 py-3 bg-brand-cream text-brand-dark text-sm font-semibold tracking-wider uppercase hover:bg-brand-gold hover:text-brand-cream transition-all duration-300 rounded-full">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
