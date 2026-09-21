import { useState, useEffect } from "react";
import { fetchSettings } from "../lib/api";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [newsletter, setNewsletter] = useState(null);

  useEffect(() => {
    fetchSettings().then(s => setNewsletter(s?.newsletter)).catch(() => {});
  }, []);

  const n = newsletter || {};

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="bg-brand-black py-12 px-6 md:py-16 md:px-16 text-center text-brand-cream rounded-2xl overflow-hidden shadow-sm">
      <span className="text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-4 block">
        {n.tagline || "Stay Connected"}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 !text-white" style={{ color: "#ffffff" }}>
        {n.heading || "Join the Inner Circle"}
      </h2>
      <p className="text-white/80 text-sm max-w-md mx-auto mb-8">
        {n.description || "Sign up for early access to exclusive drops and seasonal events."}
      </p>
      {subscribed ? (
        <p className="text-brand-gold text-sm font-semibold">{n.successMessage || "Thank you for subscribing!"}</p>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-6 py-3 bg-brand-cream/10 border border-brand-cream/20 text-brand-cream text-sm placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-cream/50 transition-colors rounded-full"
          />
          <button type="submit" className="px-8 py-3 bg-brand-cream text-brand-dark text-sm font-semibold tracking-wider uppercase hover:bg-brand-gold hover:text-brand-cream transition-all duration-300 rounded-full">
            {n.buttonText || "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}
