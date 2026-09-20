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
        backgroundColor: "#4A0E17",
        borderBottom: "1px solid #340910",
        padding: big ? "14px 0" : "10px 0",
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
                className={`inline-flex items-center ${big ? 'px-12 text-xl md:text-2xl font-bold' : 'px-8 text-xs font-semibold'} tracking-[0.18em] uppercase select-none`}
                style={{
                  color: "#FAF7F2",
                  textShadow: "none",
                }}
              >
                {showDot && (
                  <span
                    className={`shrink-0 ${big ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full mr-3`}
                    style={{ backgroundColor: "#C59B58" }}
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
