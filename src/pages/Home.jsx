import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import Collections from "../components/Collections";
import ProductsSection from "../components/ProductsSection";
import AnimatedIcon, { ICONS, IconStyle } from "../components/AnimatedIcon";
import GoogleReviews from "../components/GoogleReviews";
import NewsletterCTA from "../components/NewsletterCTA";
import Reveal from "../components/Reveal";
import { fetchSettings } from "../lib/api";
import { setMeta } from "../lib/seo";
import { cloudUrl } from "../lib/img";

const DEFAULT_TRUST = [
  { iconKey: "package", label: "Free Shipping over Rs. 5,000" },
  { iconKey: "sparkle", label: "Handcrafted with Intention" },
  { iconKey: "star", label: "Premium Quality Materials" },
  { iconKey: "truck", label: "Delivered Across Pakistan" },
];

const DEFAULT_PROMISES = [
  { iconKey: "heart", animation: "beat", title: "Made with Love", description: "Every piece is handcrafted by skilled artisans who pour care into each detail." },
  { iconKey: "sparkle", animation: "pulse", title: "Premium Materials", description: "We source only the finest fabrics, stones, and metals for lasting quality." },
  { iconKey: "truck", animation: "float", title: "Fast Delivery", description: "Free nationwide shipping on orders over Rs. 5,000. Delivered to your doorstep." },
  { iconKey: "shield", animation: "spin", title: "Quality Guarantee", description: "Not satisfied? We accept returns within 24 hours of delivery. No questions asked." },
];

const TRUST_ANIMATIONS = ["float", "pulse", "beat", "bounce"];

const LANGUAGE_LABELS = { ur: "اردو", ps: "پښتو", en: "English" };

const DEFAULT_HOME_REVIEWS = [
  { name: "Ayesha Siddiqui", nameUrdu: "عائشہ صدیقی", city: "Karachi", language: "ur", rating: 5, text: "ماشاءاللہ، چوڑیاں بہت خوبصورت ہیں! پیکنگ شاندار تھی اور کراچی میں دوسرے ہی دن ڈیلیوری ہو گئی۔ ایسا معیار بازار میں نہیں ملتا۔", textEnglish: "Mashallah, the bangles are so beautiful! The packaging was excellent and delivery reached Karachi the very next day. Quality like this is not found in the market." },
  { name: "Gulalai Yousafzai", nameUrdu: "ګلالۍ يوسفزي", city: "Peshawar", language: "ps", rating: 5, text: "ډېرې ښکلیې چوړیانې وې! ژر رارسېدې او کیفیت یې ډېر ښه دی — له پېښوره به بيا هم اخلم.", textEnglish: "Very beautiful bangles! They arrived quickly and the quality is excellent — I will buy again from Peshawar." },
  { name: "Fatima Noor", nameUrdu: "فاطمہ نور", city: "Lahore", language: "ur", rating: 5, text: "عبایا کا کپڑا بہت نرم اور اعلیٰ ہے، سلائی بہت عمدہ ہے۔ شادی سے پہلے آرڈر کیا تھا، سب نے تعریف کی۔", textEnglish: "The abaya fabric is very soft and premium, and the stitching is excellent. I ordered before my wedding and everyone praised it." },
  { name: "Bakhtawar Khan", nameUrdu: "بختاور خان", city: "Mardan", language: "ps", rating: 5, text: "پرټه ډېره ښکلې ده، تور یې نرم دی او اندازه یې برابره ده. ډېره مننه!", textEnglish: "The abaya is very beautiful, the fabric is soft and the size is perfect. Thank you very much!" },
  { name: "Maryam Bibi", nameUrdu: "مریم بی بی", city: "Islamabad", language: "ur", rating: 5, text: "پہلے کبھی پریس آن نیلز نہیں لگائی تھیں، لیکن یہ اتنی آسان ہیں اور ڈیزائن بالکل تصویروں جیسا ہے۔", textEnglish: "I had never worn press-on nails before, but these are so easy to apply — and the design is exactly like the pictures." },
  { name: "Zarlasht Khan", nameUrdu: "زرلښت خان", city: "Swat", language: "ps", rating: 5, text: "په دې بیه داسې ښکلي نیوز نور چېرې نه پیدا کیږي. ډېره مننه!", textEnglish: "Such beautiful nails at this price are found nowhere else. Thank you very much!" },
  { name: "Zainab Khan", nameUrdu: "زینب خان", city: "Quetta", language: "ur", rating: 5, text: "ویٹس ایپ سے آرڈر کرنا بہت آسان تھا، اپنی مرضی کا ڈیزائن بتایا اور بالکل ویسا ہی ملا۔ شکریہ ہنی بی لین!", textEnglish: "Ordering over WhatsApp was very easy — I told them my choice of design and got exactly that. Thank you Honeybee Lane!" },
  { name: "Gul Makai", nameUrdu: "ګل مکۍ", city: "Khyber", language: "ps", rating: 5, text: "د غاړې زیور ډېر ښکلې دی او رنګ یې خوږ دی. زه مور مې ډېره خوښه شوه.", textEnglish: "The necklace is very beautiful and the colour is lovely. My mother was delighted with it." },
];

export default function Home({ handleAddToCart, toggleFavorite, favorites }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    setMeta({
      title: "Honeybee Lane — Handcrafted Bangles, Nails, Abayas & Accessories in Pakistan",
      description: "Premium handcrafted bangles, press-on nails, abayas and necklaces. Nationwide delivery across Pakistan. Order via WhatsApp.",
      path: "/",
    });
  }, []);

  const s = settings || {};
  const trustItems = s.trustItems?.length ? s.trustItems : DEFAULT_TRUST;
  const promises = s.promises?.length ? s.promises : DEFAULT_PROMISES;
  const sale = s.sale || {};
  const story = s.story || {};

  return (
    <div>
      {/* Hero */}
      <HeroCarousel hero={s.hero} />

      {/* Marquee trust bar */}
      <div className="overflow-hidden border-b border-gray-100 py-5">
        <div className="flex w-max animate-[marquee_25s_linear_infinite]">
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy > 0}>
              {trustItems.map((item, i) => (
                <div key={`${copy}-${i}`} className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-10">
                  <AnimatedIcon
                    path={ICONS[item.iconKey]}
                    animation={TRUST_ANIMATIONS[i % TRUST_ANIMATIONS.length]}
                    className="w-5 h-5 text-brand-gold shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <IconStyle />

      {/* Collections */}
      <Reveal><Collections onCategoryClick={(cat) => navigate(`/shop/${cat}`)} /></Reveal>

      {/* Featured Products */}
      <ProductsSection onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={toggleFavorite} />

      {/* Sale banner */}
      {sale.enabled !== false && (
        <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
          <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-wine-dark min-h-[420px] grid grid-cols-1 md:grid-cols-2">
            <div className="relative z-10 p-10 md:p-16 lg:p-20 flex flex-col justify-center">
              <span className="inline-block text-[10px] font-bold tracking-[0.4em] uppercase mb-4 px-3 py-1.5 rounded-full border border-brand-gold/40 text-brand-gold w-fit">
                {sale.badge || "Limited Time"}
              </span>
              <h2 className="text-6xl md:text-8xl font-black leading-[0.9] mb-6 text-white">
                {sale.heading || "30%"}
                <br />
                <span className="text-brand-gold">{sale.headingAccent || "OFF"}</span>
              </h2>
              <p className="text-brand-cream/70 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                {sale.description || "Our entire Abaya collection. Handcrafted luxury, now at prices that make elegance accessible."}
              </p>
              <a
                href={sale.ctaLink || "/shop"}
                className="inline-flex items-center gap-3 px-8 py-4 text-xs font-bold tracking-wider uppercase rounded-full transition-all duration-300 hover:gap-5 w-fit"
                style={{ backgroundColor: "#C59B58", color: "#340910" }}
              >
                {sale.ctaText || "Shop Now"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            <div className="relative h-[300px] md:h-auto overflow-hidden">
              <img src={cloudUrl(sale.image || "/Limited Time Sale Banner.webp", 900)} alt="Sale" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-wine-dark/70 via-brand-wine-dark/20 to-transparent md:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-wine-dark/70 via-transparent to-transparent md:hidden" />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" stroke="#C59B58" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="60" stroke="#C59B58" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="40" stroke="#C59B58" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
          </Reveal>
        </section>
      )}

      {/* Brand Promise */}
      <section className="py-16 md:py-24 bg-brand-cream/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-14">
            <div className="w-10 h-px bg-brand-gold mx-auto mb-6" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-3 block">
              The Honeybee Promise
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-burgundy">
              Why Women Trust Us
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {promises.map((item, i) => (
              <Reveal key={i} delay={i * 70} className="text-center group">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center group-hover:bg-brand-gold/20 group-hover:border-brand-gold/40 transition-all duration-300">
                  <AnimatedIcon
                    path={ICONS[item.iconKey]}
                    animation={item.animation}
                    className="w-6 h-6 text-brand-gold"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-brand-burgundy mb-2">{item.title}</h3>
                <p className="text-xs text-brand-wine-dark/60 leading-relaxed max-w-[200px] mx-auto">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Customer reviews — Urdu & Pashto testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Reveal className="text-center mb-12">
            <div className="w-10 h-px bg-brand-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-burgundy mb-2">
              What Our Customers Say
            </h2>
            <p className="urdu-text text-brand-wine-dark/60">ہمارے گاہکوں کی رائے</p>
          </Reveal>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {(s.homeReviews?.length ? s.homeReviews : DEFAULT_HOME_REVIEWS).map((r, i) => (
              <Reveal key={i} delay={(i % 3) * 60} className="break-inside-avoid mb-5">
                <div className="bg-white p-5 rounded-2xl border border-brand-border/50 hover:border-brand-gold/40 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((st) => (
                        <svg key={st} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={st <= (r.rating || 5) ? "#C59B58" : "#EBDED5"} aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-full">
                      {LANGUAGE_LABELS[r.language] || ""}
                    </span>
                  </div>

                  <p className={"urdu-text text-brand-wine-dark/80 mb-3"} dir="rtl">{r.text}</p>
                  {r.textEnglish && (
                    <p className="text-xs text-brand-wine-dark/50 italic leading-relaxed mb-4 border-l-2 border-brand-gold/30 pl-3">
                      {r.textEnglish}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-3 border-t border-brand-border/40">
                    <div className="w-9 h-9 rounded-full bg-brand-blush border border-brand-border/60 flex items-center justify-center text-xs font-bold text-brand-burgundy shrink-0">
                      {(r.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-burgundy leading-tight">{r.name}</p>
                      {r.nameUrdu && <p className="urdu-name text-xs text-brand-wine-dark/40 leading-tight">{r.nameUrdu}</p>}
                    </div>
                    {r.city && <p className="ml-auto text-[10px] tracking-wider uppercase text-brand-wine-dark/40 shrink-0">{r.city}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax story section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url("${story.image || "/Brand Story Parallax Banner.webp"}")` }} />
        <div className="absolute inset-0 bg-brand-wine-dark/70" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <Reveal className="max-w-xl">
            <div className="w-12 h-px bg-brand-gold mx-auto mb-6" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-gold mb-4 block">
              {story.tagline || "Our Story"}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white whitespace-pre-line">
              {story.heading || "The Art of\nRefinement"}
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto">
              {story.description || "We believe luxury isn't about the price tag — it's about wearing something created with intention."}
            </p>
            <a
              href={story.ctaLink || "/about"}
              className="inline-flex items-center gap-3 px-8 py-3.5 border border-brand-gold text-brand-gold text-xs font-bold tracking-wider uppercase hover:bg-brand-gold hover:text-brand-cream transition-all duration-300 rounded-full"
            >
              {story.ctaText || "Read Our Story"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <div className="w-12 h-px bg-brand-gold mx-auto mt-6" />
          </Reveal>
        </div>
      </section>

      {/* Verified Google Reviews */}
      <GoogleReviews />

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <NewsletterCTA />
        </Reveal>
      </section>
    </div>
  );
}



