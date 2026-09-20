import { useNavigate } from "react-router-dom";

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M5.5 8h13l-1 12.5h-11L5.5 8z" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M3 4h2.2l2.3 11.5h10.7l2-8H7" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="16.5" cy="19.5" r="1.3" />
    </svg>
  );
}

function BangleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="4.5" r="1.2" />
    </svg>
  );
}

function RingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M12 3.5 15 8l-3 3-3-3 3-4.5z" />
      <path d="M9.5 10.5a4.8 4.8 0 1 0 5 0" />
    </svg>
  );
}

function ShoppingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M4 9.5 7 20h10l3-10.5H4z" />
      <path d="M8.5 9.5 12 4l3.5 5.5" />
      <path d="M10 13.5h4" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M3.5 11.5V4.5h7L20 14l-7.5 7.5-9-10z" />
      <circle cx="8.5" cy="9.5" r="1.4" />
    </svg>
  );
}

function DressIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M12 3.5c-1.8 0-2.3.8-2.3 2L7 9.5l2.2 1L8 20.5h8L14.8 10.5 17 9.5l-2.7-4c0-1.2-.5-2-2.3-2z" />
      <path d="M9.7 6.5h4.6" />
    </svg>
  );
}

function ShoeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" {...iconStroke}>
      <path d="M3.5 16.5v-6l3.5-1 4 3.5 4.5 1c2 0 5 .8 5 2.5H3.5z" />
      <path d="M3.5 19.5h17" />
    </svg>
  );
}

const stickers = [
  { label: "Bags", Icon: BagIcon, color: "#4A0E17", tilt: "-3deg" },
  { label: "Cart", Icon: CartIcon, color: "#C59B58", tilt: "2deg" },
  { label: "Bangles", Icon: BangleIcon, color: "#D8AF6E", tilt: "-2deg" },
  { label: "Rings", Icon: RingIcon, color: "#4A0E17", tilt: "3deg" },
  { label: "Shopping", Icon: ShoppingIcon, color: "#D495A0", tilt: "2deg" },
  { label: "Tags", Icon: TagIcon, color: "#C59B58", tilt: "-3deg" },
  { label: "Clothes", Icon: DressIcon, color: "#4A0E17", tilt: "-2deg" },
  { label: "Shoes", Icon: ShoeIcon, color: "#D8AF6E", tilt: "3deg" },
];

export default function HeroCarousel() {
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FAF7F2 0%, #F7ECEE 50%, #F4ECE4 100%)",
      }}
    >
      {/* Honeycomb corners — brand motif from the logo */}
      <svg
        className="absolute top-0 right-0 w-44 md:w-64 pointer-events-none"
        viewBox="0 0 220 170"
        fill="#DFC18A"
        opacity="0.3"
        aria-hidden
      >
        <defs>
          <polygon
            id="hb-hive"
            points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
          />
        </defs>
        <use href="#hb-hive" x="180" y="30" />
        <use href="#hb-hive" x="140" y="30" />
        <use href="#hb-hive" x="100" y="30" />
        <use href="#hb-hive" x="160" y="65" />
        <use href="#hb-hive" x="120" y="65" />
        <use href="#hb-hive" x="80" y="65" />
        <use href="#hb-hive" x="180" y="100" />
        <use href="#hb-hive" x="140" y="100" />
        <use href="#hb-hive" x="100" y="100" />
        <use href="#hb-hive" x="160" y="135" />
        <use href="#hb-hive" x="120" y="135" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-44 md:w-64 pointer-events-none"
        viewBox="0 0 220 170"
        fill="#DFC18A"
        opacity="0.25"
        aria-hidden
      >
        <use href="#hb-hive" x="40" y="140" />
        <use href="#hb-hive" x="80" y="140" />
        <use href="#hb-hive" x="120" y="140" />
        <use href="#hb-hive" x="60" y="105" />
        <use href="#hb-hive" x="100" y="105" />
        <use href="#hb-hive" x="140" y="105" />
        <use href="#hb-hive" x="40" y="70" />
        <use href="#hb-hive" x="80" y="70" />
        <use href="#hb-hive" x="120" y="70" />
        <use href="#hb-hive" x="60" y="35" />
        <use href="#hb-hive" x="100" y="35" />
      </svg>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left: static copy */}
        <div>
          <span
            className="inline-block text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase mb-5 px-4 py-2 rounded-full"
            style={{
              background: "#FAF7F2",
              color: "#4A0E17",
              border: "1px solid #DFC18A",
            }}
          >
            New Arrivals at Honeybee Lane
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold mb-5 leading-[1.05]"
            style={{ color: "#38070F" }}
          >
            Curated beauty,
            <br />
            made for every day
          </h1>
          <p
            className="text-sm md:text-lg mb-8 max-w-md leading-relaxed"
            style={{ color: "rgba(56,7,15,0.8)" }}
          >
            Premium bangles, abayas, nails and accessories, delivered across Pakistan.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/products")}
              className="px-8 md:px-10 py-3 md:py-4 text-xs md:text-sm font-bold tracking-wider uppercase rounded-full transition-all duration-300 hover:bg-brand-gold hover:text-white"
              style={{ background: "#4A0E17", color: "#FAF7F2" }}
            >
              Shop Now
            </button>
            <button
              onClick={() => navigate("/about")}
              className="px-8 py-3 md:py-4 text-xs md:text-sm font-bold tracking-wider uppercase rounded-full transition-all duration-300 hover:border-brand-burgundy hover:text-brand-burgundy"
              style={{
                background: "transparent",
                color: "#4A0E17",
                border: "1.5px solid #C59B58",
              }}
            >
              Our Story
            </button>
          </div>
        </div>

        {/* Right: sticker wall */}
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {stickers.map(({ label, Icon, color, tilt }) => (
            <div
              key={label}
              className="relative rounded-xl px-2 pt-5 pb-3 flex flex-col items-center gap-2"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBDED5",
                boxShadow: "0 8px 20px rgba(56,7,15,0.08)",
                transform: `rotate(${tilt})`,
              }}
            >
              {/* tape strip */}
              <span
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 rounded-sm"
                style={{ background: "#DFC18A", opacity: 0.8 }}
              />
              <span style={{ color }}>
                <Icon />
              </span>
              <span
                className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ color: "#38070F" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
