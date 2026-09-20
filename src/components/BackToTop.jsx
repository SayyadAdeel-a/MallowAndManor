import { useState, useEffect } from "react";
import AnimatedIcon, { ICONS } from "./AnimatedIcon";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 400);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 w-11 h-11 bg-brand-burgundy text-brand-cream border border-brand-gold/60 shadow-lg hover:bg-brand-wine-dark hover:scale-105 transition-all rounded-full flex items-center justify-center z-50"
      aria-label="Back to top"
    >
      <AnimatedIcon
        path={ICONS.chevronUp}
        animation="float"
        className="w-4 h-4 text-brand-gold"
        strokeWidth={2.5}
      />
    </button>
  );
}
