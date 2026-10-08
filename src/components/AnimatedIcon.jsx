import { useState } from "react";

// This module exports components only. The SVG path data lives in ./icons.js
// so that react-refresh can hot-reload this file without invalidating the
// constant map.

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
