export default function About() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08759df9a13?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-brand-cream/60 mb-4 block">Our Story</span>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-cream mb-4">Honeybee Lane</h1>
          <p className="text-brand-cream/70 text-sm max-w-lg mx-auto">
            Born from a simple desire to make quality beauty accessible, personal, and effortless.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4 block">Who We Are</span>
            <h2 className="text-3xl font-bold tracking-tight mb-6 text-brand-burgundy">Modern Essentials for a New Generation</h2>
            <div className="space-y-4 text-brand-wine-dark/75 text-sm leading-relaxed">
              <p>
                In a world of mass production, we stand for the unique. Honeybee Lane is not just
                an e-commerce platform — it's a carefully curated collection of quality essentials.
              </p>
              <p>
                Starting from a small boutique in 2024, our vision was to bridge the gap between
                digital convenience and the personal touch of a private concierge.
              </p>
              <p>
                We specialize in artisanal bangles, handcrafted abayas, boutique nails, and exclusive
                necklaces — items that are intimate, personal, and essential to your identity.
              </p>
            </div>
          </div>
          <div className="aspect-[4/5] overflow-hidden border border-brand-border shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=1000&q=80"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-brand-border bg-brand-blush/20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2024", label: "Founded" },
            { value: "10K+", label: "Happy Clients" },
            { value: "500+", label: "Curated Items" },
            { value: "85+", label: "Districts Served" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-serif font-bold text-brand-burgundy mb-1">{stat.value}</p>
              <p className="text-xs text-brand-wine-dark/60 tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4 block">Our Principles</span>
          <h2 className="text-3xl font-bold tracking-tight text-brand-burgundy">What We Stand For</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Quality Over Quantity", desc: "We don't sell everything. We sell the right things. Each item is personally selected for exceptional quality and design." },
            { title: "Global Craftsmanship", desc: "From the finest silk to precise movements, we source from artisans worldwide who live and breathe their craft." },
            { title: "Seamless Luxury", desc: "Our unique WhatsApp integration ensures your shopping experience is personal, fast, and human-centric." },
          ].map((v, i) => (
            <div key={i} className="text-center p-6 bg-brand-cream border border-brand-border/60">
              <h3 className="text-lg font-semibold mb-3 text-brand-burgundy">{v.title}</h3>
              <p className="text-sm text-brand-wine-dark/70 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-brand-burgundy text-brand-cream py-16 px-8 text-center border border-brand-wine-dark shadow-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-brand-cream">Join the Inner Circle</h2>
          <p className="text-brand-cream/80 text-sm max-w-md mx-auto mb-8">
            Experience luxury redefined. Every order handled with personal care.
          </p>
          <button
            onClick={() => (window.location.href = "/products")}
            className="px-8 py-3 bg-brand-gold text-brand-wine-dark text-sm font-bold tracking-wider uppercase hover:bg-brand-cream hover:text-brand-burgundy transition-all duration-300 shadow-sm"
          >
            Explore Collections
          </button>
        </div>
      </section>
    </div>
  );
}
