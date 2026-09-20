import { useState } from "react";

const animations = {
  float: "animate-[icon-float_3s_ease-in-out_infinite]",
  pulse: "animate-[icon-pulse_2s_ease-in-out_infinite]",
  beat: "animate-[icon-beat_1.5s_ease-in-out_infinite]",
  spin: "animate-[icon-spin_6s_linear_infinite]",
  bounce: "animate-[icon-bounce_2s_ease-in-out_infinite]",
  shake: "animate-[icon-shake_3s_ease-in-out_infinite]",
  wiggle: "animate-[icon-wiggle_2s_ease-in-out_infinite]",
  none: "",
};

export default function AnimatedIcon({
  path,
  animation = "none",
  className = "",
  fill = "none",
  strokeWidth = 1.5,
  viewBox = "0 0 24 24",
  hoverAnimation = null,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const animClass = isHovered && hoverAnimation ? animations[hoverAnimation] : animations[animation] || "";

  return (
    <svg
      className={`${animClass} ${className}`}
      viewBox={viewBox}
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path d={path} />
    </svg>
  );
}

// Pre-defined icon paths
export const ICONS = {
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  heartFilled: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bag: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  cart: "M3 4h2.2l2.3 11.5h10.7l2-8H7M9.5 19.5a.5.5 0 11-1 0 .5.5 0 011 0zm7 0a.5.5 0 11-1 0 .5.5 0 011 0z",
  plus: "M12 4v16m8-8H4",
  minus: "M20 12H4",
  close: "M6 18L18 6M6 6l12 12",
  chevronLeft: "M15 19l-7-7 7-7",
  chevronRight: "M9 5l7 7-7 7",
  chevronUp: "M18 15l-6-6-6 6",
  arrowRight: "M17 8l4 4m0 0l-4 4m4-4H3",
  check: "M5 13l4 4L19 7",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  diamond: "M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z",
  clock: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  truck: "M16 3H1v13h15V3zm2 4h3l3 4v5h-6V7zM5.5 19.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  sparkle: "M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  document: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  menu: "M4 6h16M4 12h16M4 18h16",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  tiktok: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.16 8.16 0 005.58 2.2v-3.45a4.85 4.85 0 01-2-.83 4.84 4.84 0 01-1.65-2.23h3.45z",
  location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5v2l8 5 8-5V6z",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
  globe: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z",
  crown: "M2 20h20M4 17l2-12 6 4 6-4 2 12H4z",
};

export function IconStyle() {
  return (
    <style>{`
      @keyframes icon-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes icon-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes icon-beat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
      @keyframes icon-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes icon-bounce {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-6px); }
        75% { transform: translateY(2px); }
      }
      @keyframes icon-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        75% { transform: translateX(3px); }
      }
      @keyframes icon-wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-8deg); }
        75% { transform: rotate(8deg); }
      }
    `}</style>
  );
}
