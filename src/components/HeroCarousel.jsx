import { useNavigate } from "react-router-dom";
import AnimatedIcon, { ICONS } from "./AnimatedIcon";

const DEFAULT_FEATURES = [
  { icon: "star", label: "Elegant" },
  { icon: "clock", label: "Timeless" },
  { icon: "heart", label: "Empowered" },
  { icon: "sparkle", label: "Curated" },
];

const FEATURE_ANIMS = ["float", "pulse", "beat", "spin"];

export default function HeroCarousel({ hero }) {
  const navigate = useNavigate();
  const h = hero || {};
  const features = h.features?.length ? h.features : DEFAULT_FEATURES;

  return (
    <section className="relative w-full overflow-hidden bg-[#F5EDE4]">
      <div className="absolute inset-0">
        <img src={h.image || "/hero-banner.webp"} alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5EDE4]/50 via-[#F5EDE4]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5EDE4]/40 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 lg:py-36 flex flex-col items-center text-center">
        <div className="mb-6 animate-[spin-slow_6s_linear_infinite]">
          <svg className="w-6 h-6 text-[#C59B58]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>

        {h.tagline && (
          <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-[#C59B58] mb-4">
            {h.tagline}
          </p>
        )}

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-4 text-[#340910]">
          {h.heading1 || "Curated"}
          <br />
          <span className="text-[#C59B58]">{h.heading2 || "Beauty"}</span>
        </h1>

        {h.subtitle && (
          <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-[#4A0E17]/70 mb-10">
            {h.subtitle}
          </p>
        )}

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-[#C59B58]" />
          <div className="animate-[spin-slow_4s_linear_infinite]">
            <svg className="w-4 h-4 text-[#C59B58]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
          <div className="w-12 h-px bg-[#C59B58]" />
        </div>

        <div className="flex items-center gap-8 md:gap-12 mb-10">
          {features.map((f, i) => (
            <div key={f.label} className="flex flex-col items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-[#C59B58]/30 flex items-center justify-center group-hover:border-[#C59B58] transition-colors duration-300">
                <AnimatedIcon
                  path={ICONS[f.icon]}
                  animation={FEATURE_ANIMS[i % FEATURE_ANIMS.length]}
                  className="w-5 h-5 text-[#C59B58]"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#4A0E17]/60 group-hover:text-[#4A0E17] transition-colors">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate(h.cta1Link || "/shop")}
            className="px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full bg-[#340910] text-[#FAF7F2] hover:bg-[#4A0E17] transition-colors duration-300 shadow-lg"
          >
            {h.cta1Text || "Shop Now"}
          </button>
          <button
            onClick={() => navigate(h.cta2Link || "/about")}
            className="px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full border border-[#C59B58] text-[#C59B58] hover:bg-[#C59B58] hover:text-[#340910] transition-all duration-300"
          >
            {h.cta2Text || "Our Story"}
          </button>
        </div>

        {h.taglineBottom && (
          <p className="font-display text-base md:text-lg italic text-[#4A0E17]/50">
            {h.taglineBottom}
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

