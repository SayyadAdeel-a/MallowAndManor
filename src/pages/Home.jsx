import { useNavigate } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import Collections from "../components/Collections";
import ProductsSection from "../components/ProductsSection";
import OfferHeadline from "../components/OfferHeadline";

export default function Home({ products, categories, handleAddToCart, productStats = {}, toggleFavorite, favorites }) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Offer Banner */}
      <OfferHeadline text="SALE SALE SALE • Flat 30% Off on All Abayas • Limited Time Only • Shop Now Before Stock Runs Out" />

      {/* Hero */}
      <HeroCarousel />

      {/* Trust bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-1">Free Shipping</h4>
            <p className="text-xs text-gray-400">On all orders over Rs. 5,000</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-1">Handcrafted</h4>
            <p className="text-xs text-gray-400">Every piece made with intention</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-1">Premium Quality</h4>
            <p className="text-xs text-gray-400">Curated for excellence</p>
          </div>
        </div>
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

      {/* Flyer 1 - Full Width Product Showcase */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm min-h-[400px] flex items-center"
            style={{background: "linear-gradient(135deg, #38070F 0%, #4A0E17 100%)"}}>
            <img
              src="/earrings-stud.webp"
              alt="Earrings"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 p-10 md:p-16 max-w-lg">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-3 block" style={{color: "#C59B58"}}>
                Statement Pieces
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight" style={{color: "#FAF7F2"}}>
                Bold Designs for Bold Personalities
              </h2>
              <p className="text-brand-cream/70 text-sm mb-6">
                From everyday elegance to occasion-ready glam, find your perfect match.
              </p>
              <a
                href="/products?category=necklaces"
                className="inline-block px-8 py-3 text-sm font-bold tracking-wider uppercase transition-all hover:bg-white hover:text-brand-black"
                style={{backgroundColor: "#C59B58", color: "#38070F"}}
              >
                Shop Necklaces
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Flyer 2 - Masonry Grid with Different Sizes */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tall Card */}
            <div className="row-span-2 relative overflow-hidden rounded-sm bg-gray-100 min-h-[500px]">
              <img src="/earrings-portrait.webp" alt="Earrings Collection" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-[10px] font-bold tracking-wider uppercase block mb-1" style={{color: "#C59B58"}}>Featured</span>
                <h3 className="text-lg font-bold text-white">Earring Collection</h3>
                <p className="text-xs text-white/60 mt-1">Shop Now →</p>
              </div>
            </div>

            {/* Small Card */}
            <div className="relative overflow-hidden rounded-sm bg-gray-100 h-[240px]">
              <img src="/image_3.webp" alt="Bangles" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-sm font-bold text-white">Bangles</h3>
                <p className="text-[10px] text-white/60">From Rs. 299</p>
              </div>
            </div>

            {/* Small Card */}
            <div className="relative overflow-hidden rounded-sm bg-gray-100 h-[240px]">
              <img src="/nails-art.webp" alt="Nail Art" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-sm font-bold text-white">Nail Art</h3>
                <p className="text-[10px] text-white/60">Trending Now</p>
              </div>
            </div>

            {/* Wide Card */}
            <div className="col-span-2 relative overflow-hidden rounded-sm bg-gray-100 h-[240px]">
              <img src="/earrings-hand.webp" alt="Earrings" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-[10px] font-bold tracking-wider uppercase block mb-1" style={{color: "#C59B58"}}>New Drop</span>
                <h3 className="text-xl font-bold text-white">Earrings Collection</h3>
                <p className="text-xs text-white/60 mt-1">Shop the Latest →</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flyer 3 - Small + Large Combo */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Small Square Card */}
            <div className="relative overflow-hidden rounded-sm min-h-[280px]">
              <img src="/earrings-stud.webp" alt="Gifts" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="text-[10px] font-bold tracking-wider uppercase block mb-2" style={{color: "#C59B58"}}>Gift Idea</span>
                <h3 className="text-xl font-bold text-white mb-2">Perfect Gifts for Her</h3>
                <p className="text-xs text-white/50">Curated gift sets starting Rs. 999</p>
                <a href="/products" className="text-xs font-bold tracking-wider uppercase mt-4 inline-block hover:underline" style={{color: "#C59B58"}}>
                  Shop Gifts →
                </a>
              </div>
            </div>

            {/* Large Landscape Card */}
            <div className="md:col-span-2 relative overflow-hidden rounded-sm bg-gray-100 min-h-[280px]">
              <img src="/image_2.webp" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="text-[10px] font-bold tracking-wider uppercase block mb-2" style={{color: "#C59B58"}}>Celebration Special</span>
                <h3 className="text-2xl font-bold text-white mb-2">Eid Collection</h3>
                <p className="text-xs text-white/60 mb-4">Exclusive designs for the festive season</p>
                <a href="/products" className="inline-block px-6 py-2 text-xs font-bold tracking-wider uppercase transition-all hover:opacity-90" style={{backgroundColor: "#4A0E17", color: "#FAF7F2"}}>
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Offer Banner - promo ribbon */}
      <div
        className="w-full overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #38070F 0%, #4A0E17 50%, #340910 100%)",
          padding: "14px 0",
        }}
      >
        <div
          className="flex w-max whitespace-nowrap"
          style={{
            animationName: "marquee",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDuration: "280s",
            animationDirection: "reverse",
            willChange: "transform",
          }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-3 px-10 text-xs font-bold tracking-[0.2em] uppercase select-none"
                  style={{ color: "#FAF7F2" }}
                >
                  <span
                    className="w-2 h-2 rotate-45 shrink-0"
                    style={{ backgroundColor: "#C59B58" }}
                  />
                  Sale is Live • Free Delivery on Orders Over Rs.5000 • Nationwide Shipping
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Promotional Flyer 1 - Big Sale Banner */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{ background: "linear-gradient(135deg, #FAF7F2 0%, #F7ECEE 60%, #F4ECE4 100%)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px]">
              <div className="p-10 md:p-14 flex flex-col justify-center relative z-10">
                <span className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{color: "#C59B58"}}>
                  Limited Time Offer
                </span>
                <h2 className="text-4xl md:text-5xl font-black leading-none mb-4" style={{color: "#38070F"}}>
                  30% OFF
                </h2>
                <p className="text-sm mb-6 max-w-sm" style={{color: "rgba(56,7,15,0.8)"}}>
                  On our entire Abaya collection. Handcrafted luxury at unbeatable prices.
                </p>
                <a
                  href="/products?category=abayas"
                  className="inline-block px-8 py-3 text-sm font-bold tracking-wider uppercase transition-all w-fit hover:bg-brand-gold hover:text-white"
                  style={{backgroundColor: "#4A0E17", color: "#FAF7F2"}}
                >
                  Shop Abayas
                </a>
              </div>
              <div className="relative h-[250px] md:h-auto bg-gray-800 overflow-hidden">
                <img
                  src="/earrings-hand.webp"
                  alt="Sale Earrings"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Flyer 2 - Grid Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="relative overflow-hidden rounded-sm h-[250px] group cursor-pointer bg-brand-black">
              <img
                src="/image_2.webp"
                alt="Necklaces"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2 block" style={{color: "#C59B58"}}>
                  New Arrivals
                </span>
                <h3 className="text-lg font-bold text-white mb-2">Necklace Collection</h3>
                <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                  Shop Now →
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative overflow-hidden rounded-sm h-[250px] group cursor-pointer bg-brand-black">
              <img
                src="/image_3.webp"
                alt="Bangles"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2 block" style={{color: "#C59B58"}}>
                  Bestsellers
                </span>
                <h3 className="text-lg font-bold text-white mb-2">Bangle Collection</h3>
                <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                  Shop Now →
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative overflow-hidden rounded-sm h-[250px] group cursor-pointer bg-brand-black">
              <img
                src="/nails-art.webp"
                alt="Nails"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2 block" style={{color: "#C59B58"}}>
                  Trending
                </span>
                <h3 className="text-lg font-bold text-white mb-2">Nail Art Collection</h3>
                <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                  Shop Now →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Flyer 3 - Full Width CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-sm p-10 md:p-16 text-center"
            style={{background: "linear-gradient(135deg, #FAF7F2 0%, #F7ECEE 55%, #FAF7F2 100%)", border: "1px solid #DFC18A"}}
          >
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-3 block" style={{color: "#C59B58"}}>
                Exclusive Collection
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{color: "#38070F"}}>
                Wedding Season Special
              </h2>
              <p className="text-sm mb-6 max-w-lg mx-auto" style={{color: "rgba(56,7,15,0.75)"}}>
                Discover our curated bridal collection. Bangles, necklaces, and accessories
                designed to make your special day unforgettable.
              </p>
              <a
                href="/products"
                className="inline-block px-10 py-3 text-sm font-bold tracking-wider uppercase transition-all hover:bg-brand-gold hover:text-white"
                style={{backgroundColor: "#4A0E17", color: "#FAF7F2"}}
              >
                Explore Bridal Collection
              </a>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{background: "#DFC18A"}} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20" style={{background: "#EBDED5"}} />
          </div>
        </div>
      </section>

      {/* Lifestyle Section - CB Style */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-[400px] lg:h-[500px] bg-gray-100 overflow-hidden">
              <img
                src="/earrings-stud.webp"
                alt="Luxury Abayas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Content */}
            <div className="bg-brand-black text-brand-cream p-10 lg:p-16 flex flex-col justify-center">
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-brand-gold mb-4 block">
                Our Essence
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                The Art of<br />Refinement
              </h2>
              <p className="text-brand-cream/60 text-sm leading-relaxed mb-6">
                "We believe that luxury isn't about the price tag; it's about the feeling
                of wearing something that was created with intention."
              </p>
              <p className="text-brand-cream/40 text-sm leading-relaxed mb-8">
                Honeybee Lane was founded on the principle of careful curation.
                We don't just sell abayas and bangles; we bring you quality
                pieces made for a life well-lived.
              </p>
              <a
                href="/about"
                className="inline-block text-sm font-semibold tracking-wider uppercase border-b-2 border-brand-gold pb-1 text-brand-gold hover:text-brand-cream hover:border-brand-cream transition-colors w-fit"
              >
                Read Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Callout - CB Style */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Content */}
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-gray-400 mb-4 block">
                Customer Favorite
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                "Beautifully made"
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Every piece in our collection is crafted with premium materials
                and designed to last. From artisanal bangles to handcrafted abayas,
                each item tells a story of elegance.
              </p>
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4" style={{color: "#C59B58"}} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-gray-400 ml-2">Based on 200+ reviews</span>
              </div>
              <a
                href="/products"
                className="inline-block text-sm font-semibold tracking-wider uppercase border-b-2 border-brand-black pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors w-fit"
              >
                Shop Bestsellers
              </a>
            </div>

            {/* Image */}
            <div className="relative h-[400px] lg:h-[500px] bg-gray-100 overflow-hidden">
              <img
                src="/nails-art.webp"
                alt="Bangles Collection"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Community Grid - CB UGC Style */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-gray-400 mb-4 block">
              Our Community
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Styled by You
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { img: "/nails-art.webp", handle: "@glow.up" },
              { img: "/earrings-stud.webp", handle: "@elegance.pk" },
              { img: "/earrings-portrait.webp", handle: "@luxury.lifestyle" },
              { img: "/image_3.webp", handle: "@style.queen" },
            ].map((item, i) => (
              <div key={i} className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer">
                <img
                  src={item.img}
                  alt={item.handle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.handle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Delivery Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Map */}
            <div className="relative h-[350px] lg:h-auto lg:min-h-[450px] bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13605435.82338966!2d60.93428445!3d30.375321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38db52d2f3d59673%3A0x7f7409cf6da3f30f!2sPakistan!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80"
                title="Pakistan Delivery Map"
              />
            </div>

            {/* Info */}
            <div className="bg-brand-black text-brand-cream p-10 lg:p-14 flex flex-col justify-center">
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-brand-cream/40 mb-4 block">
                Nationwide Reach
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight text-white">
                Delivering Elegance<br />All Over Pakistan
              </h2>
              <p className="text-brand-cream/50 text-sm leading-relaxed mb-8">
                From the vibrant streets of Karachi to the serene valleys of the North,
                we ensure your luxury treasures reach you with care.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot"].map((city) => (
                  <div key={city} className="flex items-center gap-2 text-sm text-brand-cream/70">
                    <svg className="w-3 h-3 text-brand-gold shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {city}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-brand-cream/50 border-t border-brand-cream/10 pt-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  85+ Districts
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Free over Rs. 5,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Material callout */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-gray-400 mb-4 block">
              What We're Made Of
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Thoughtfully Sourced
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { name: "Artisanal Craft", desc: "Handpicked by experts" },
              { name: "Premium Materials", desc: "Quality you can feel" },
              { name: "Sustainable", desc: "Less waste, more beauty" },
              { name: "Nationwide Delivery", desc: "Across all of Pakistan" },
            ].map((item, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold tracking-wider uppercase mb-2">{item.name}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-brand-black py-16 px-8 md:px-16 text-center text-brand-cream">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-brand-cream/50 mb-4 block">
            Stay Connected
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Join the Inner Circle
          </h2>
          <p className="text-brand-cream/50 text-sm max-w-md mx-auto mb-8">
            Sign up for early access to exclusive drops and seasonal events.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 bg-brand-cream/10 border border-brand-cream/20 text-brand-cream text-sm placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-cream/50 transition-colors"
            />
            <button className="px-8 py-3 bg-brand-cream text-brand-dark text-sm font-semibold tracking-wider uppercase hover:bg-brand-gold hover:text-brand-cream transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
