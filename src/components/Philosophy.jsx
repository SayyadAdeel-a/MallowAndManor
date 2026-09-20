export default function Philosophy() {
  return (
    <section className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4 block">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight text-brand-burgundy">
              Crafted with intention,<br />
              designed for life.
            </h2>
            <p className="text-brand-wine-dark/75 leading-relaxed mb-4">
              Honeybee Lane was founded on a simple principle: to make quality
              beauty accessible, personal, and effortless for the modern customer.
            </p>
            <p className="text-brand-wine-dark/75 leading-relaxed mb-8">
              We specialize in artisanal bangles, handcrafted abayas, boutique
              nails, and exclusive necklaces — items that are intimate, personal,
              and essential to your identity.
            </p>
            <button
              onClick={() => (window.location.href = "/about")}
              className="text-sm font-semibold tracking-wider uppercase border-b-2 border-brand-burgundy text-brand-burgundy pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors"
            >
              Read Our Story
            </button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden border border-brand-border shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1470&auto=format&fit=crop"
                alt="Luxury craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
