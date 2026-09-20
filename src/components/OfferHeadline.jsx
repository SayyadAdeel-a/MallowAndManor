import { useState } from "react";

export default function OfferHeadline({
  text = "Free Delivery on Orders Over Rs. 5,000",
  speed = 300,
  big = false,
  showDot = true,
  glow = false,
}) {
  const [isPaused, setIsPaused] = useState(false);
  const repeats = big ? 12 : 8;

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #F3D5E1 0%, #F6E7ED 50%, #EDD9C6 100%)",
        padding: big ? "16px 0" : "12px 0",
        boxShadow: "0 4px 20px rgba(192, 138, 165, 0.2)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Offer banner"
    >
      <div
        className="flex w-max whitespace-nowrap"
        style={{
          animationName: "marquee",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? "paused" : "running",
          animationDirection: "reverse",
          willChange: "transform",
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {Array.from({ length: repeats }).map((_, i) => (
              <span
                key={i}
                className={`inline-flex items-center ${big ? 'px-12 text-2xl md:text-4xl font-black' : 'px-8 text-xs font-extrabold'} tracking-[0.15em] uppercase select-none`}
                style={{
                  color: "#6E4E5C",
                  textShadow: "none",
                }}
              >
                {showDot && (
                  <span
                    className={`shrink-0 ${big ? 'w-3 h-3' : 'w-1.5 h-1.5'} rounded-full mr-3`}
                    style={{ backgroundColor: "#D9BEA6" }}
                  />
                )}
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
