import { useNavigate } from "react-router-dom";

const features = [
  {
    label: "Elegant",
    path: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z",
    anim: "float",
  },
  {
    label: "Timeless",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    anim: "pulse",
  },
  {
    label: "Empowered",
    path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    anim: "beat",
  },
  {
    label: "Curated",
    path: "M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z",
    anim: "spin-slow",
  },
];

export default function HeroCarousel() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full overflow-hidden bg-[#F5EDE4]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-banner.webp"
          alt=""
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5EDE4]/50 via-[#F5EDE4]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5EDE4]/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 lg:py-36 flex flex-col items-center text-center">
        {/* Decorative diamond */}
        <div className="mb-6 animate-[spin-slow_6s_linear_infinite]">
          <svg className="w-6 h-6 text-[#C59B58]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-4 text-[#340910]">
          Curated
          <br />
          <span className="text-[#C59B58]">Beauty</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-[#4A0E17]/70 mb-10">
          Bangles &middot; Abayas &middot; Accessories
        </p>

        {/* Decorative line */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-[#C59B58]" />
          <div className="animate-[spin-slow_4s_linear_infinite]">
            <svg className="w-4 h-4 text-[#C59B58]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
          <div className="w-12 h-px bg-[#C59B58]" />
        </div>

        {/* Animated feature icons */}
        <div className="flex items-center gap-8 md:gap-12 mb-10">
          {features.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-[#C59B58]/30 flex items-center justify-center group-hover:border-[#C59B58] transition-colors duration-300">
                <svg
                  className={`w-5 h-5 text-[#C59B58] ${
                    f.anim === "float"
                      ? "animate-[float_3s_ease-in-out_infinite]"
                      : f.anim === "pulse"
                      ? "animate-[pulse_2s_ease-in-out_infinite]"
                      : f.anim === "beat"
                      ? "animate-[beat_1.5s_ease-in-out_infinite]"
                      : "animate-[spin-slow_6s_linear_infinite]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={f.path} />
                </svg>
              </div>
              <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#4A0E17]/60 group-hover:text-[#4A0E17] transition-colors">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate("/products")}
            className="px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full bg-[#340910] text-[#FAF7F2] hover:bg-[#4A0E17] transition-colors duration-300 shadow-lg"
          >
            Shop Now
          </button>
          <button
            onClick={() => navigate("/about")}
            className="px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full border border-[#C59B58] text-[#C59B58] hover:bg-[#C59B58] hover:text-[#340910] transition-all duration-300"
          >
            Our Story
          </button>
        </div>

        {/* Tagline */}
        <p className="font-display text-base md:text-lg italic text-[#4A0E17]/50">
          Style with purpose. Elegance in every layer.
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
