import { useState, useEffect } from "react";

const GOOGLE_G = (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

function Stars({ rating = 5, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${size}`} fill={i < rating ? "#C59B58" : "#EBDED5"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, photo }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        loading="lazy"
        className="w-10 h-10 rounded-full object-cover border border-brand-border/60"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-brand-blush border border-brand-border/60 flex items-center justify-center text-xs font-bold text-brand-burgundy shrink-0">
      {initials}
    </div>
  );
}

function ReviewCard({ review }) {
  const body = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={review.author} photo={review.photo} />
          <div>
            <p className="text-sm font-semibold text-brand-burgundy leading-tight">{review.author}</p>
            <p className="text-[11px] text-brand-wine-dark/50 mt-0.5">{review.date}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[#4285F4] bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-full shrink-0">
          {GOOGLE_G}
          Google
        </span>
      </div>
      <Stars rating={review.rating} />
      <p className="text-sm text-brand-wine-dark/70 leading-relaxed mt-3 line-clamp-4">
        {review.text}
      </p>
    </>
  );

  const cardClass = "w-[320px] md:w-[360px] shrink-0 bg-white rounded-2xl border border-brand-border/50 p-5 shadow-sm hover:border-brand-gold/40 transition-colors duration-300";

  return review.profileUrl ? (
    <a href={review.profileUrl} target="_blank" rel="noopener noreferrer" className={`${cardClass} block`}>
      {body}
    </a>
  ) : (
    <div className={cardClass}>{body}</div>
  );
}

export default function GoogleReviews() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/google-reviews")
      .then((r) => r.json())
      .then((d) => {
        if (d?.reviews?.length > 0) setData(d);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;
  if (!data) return null;

  const rowA = data.reviews;
  const rowB = [...data.reviews].reverse();

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mb-12">
        <div className="text-center">
          <div className="w-10 h-px bg-brand-gold mx-auto mb-6" />
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-3 block">
            Verified Google Reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-burgundy mb-6">
            What Customers Say on Google
          </h2>

          <div className="inline-flex items-center gap-4 bg-white border border-brand-border/60 rounded-full px-6 py-3 shadow-sm">
            <span className="text-3xl font-bold text-brand-burgundy font-display">
              {data.rating || "—"}
            </span>
            <div className="text-left">
              <Stars rating={Math.round(data.rating || 5)} />
              <p className="text-[11px] text-brand-wine-dark/50 mt-1">
                {data.totalRatings} verified ratings
              </p>
            </div>
            <div className="w-px h-8 bg-brand-border/60" />
            <div className="flex items-center gap-2">
              {GOOGLE_G}
              <span className="text-xs font-semibold text-brand-wine-dark/60">Google Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motion: two rows scrolling in opposite directions, pause on hover */}
      <div className="space-y-5 reviews-marquee-wrap">
        <div className="flex w-max gap-5 animate-[marquee_45s_linear_infinite] reviews-row">
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex gap-5 shrink-0" aria-hidden={copy > 0}>
              {rowA.map((r, i) => (
                <ReviewCard key={`${copy}-${i}`} review={r} />
              ))}
            </div>
          ))}
        </div>

        <div
          className="flex w-max gap-5 animate-[marquee_55s_linear_infinite] reviews-row"
          style={{ animationDirection: "reverse" }}
        >
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex gap-5 shrink-0" aria-hidden={copy > 0}>
              {rowB.map((r, i) => (
                <ReviewCard key={`${copy}-${i}`} review={r} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        {data.mapsUrl ? (
          <a
            href={data.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-burgundy hover:text-brand-gold transition-colors"
          >
            View all reviews on Google
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        ) : (
          <a
            href="https://www.google.com/maps/search/Honeybee+Lane"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-burgundy hover:text-brand-gold transition-colors"
          >
            Find us on Google Maps
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>

      <style>{`
        .reviews-marquee-wrap:hover .reviews-row {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .reviews-row {
            animation: none !important;
            width: auto !important;
            flex-wrap: wrap;
            justify-content: center;
            padding: 0 1rem;
          }
        }
      `}</style>
    </section>
  );
}
