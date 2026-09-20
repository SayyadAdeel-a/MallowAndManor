import { useState, useEffect } from "react";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";
import { fetchSettings } from "../lib/api";

export default function Contact() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    fetchSettings().then(s => setContact(s?.contact)).catch(() => {});
  }, []);

  const c = contact || {};
  const faqs = c.faqs?.length ? c.faqs : [
    { q: "Where do you deliver?", a: "We provide nationwide delivery across Pakistan, covering all major cities including Karachi, Lahore, Islamabad, and more." },
    { q: "How can I track my order?", a: "Once confirmed via WhatsApp, we provide a tracking number and regular delivery updates." },
    { q: "What are the shipping costs?", a: "Shipping is calculated by destination. Free delivery on orders over Rs. 5,000." },
    { q: "What is your return policy?", a: "We accept returns for damaged items reported within 24 hours of delivery." },
  ];

  const contactIcons = [
    { label: "Phone", value: c.phone || "+92 323 3334492", iconKey: "phone", animation: "pulse" },
    { label: "Email", value: c.email || "hello@honeybeelane.com", iconKey: "mail", animation: "float" },
    { label: "Address", value: c.address || "DHA Phase 6, Karachi, Pakistan", iconKey: "location", animation: "bounce" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-brand-burgundy">
          {c.heading || "Get In Touch"}
        </h1>
        <p className="text-brand-wine-dark/60 text-sm">
          {c.subheading || "We're here to help you get every detail right."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-lg font-semibold mb-6 text-brand-burgundy">Contact Details</h2>
          <div className="space-y-5">
            {contactIcons.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-blush/60 border border-brand-border flex items-center justify-center shrink-0 rounded-sm">
                  <AnimatedIcon path={ICONS[item.iconKey]} animation={item.animation} className="w-4 h-4 text-brand-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-brand-wine-dark/60 tracking-wider uppercase mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-brand-burgundy">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-brand-blush/30 border border-brand-border rounded-lg">
            <h3 className="text-sm font-semibold mb-3 text-brand-burgundy">Business Hours</h3>
            <div className="space-y-2 text-sm text-brand-wine-dark/70">
              <div className="flex justify-between"><span>Mon - Fri</span><span className="font-semibold text-brand-burgundy">9:00 AM - 6:00 PM</span></div>
              <div className="flex justify-between"><span>Saturday</span><span className="font-semibold text-brand-burgundy">10:00 AM - 4:00 PM</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-medium text-brand-wine-dark/40">Closed</span></div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-6 text-brand-burgundy">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-brand-border pb-4">
                <h4 className="text-sm font-semibold mb-2 text-brand-burgundy">{faq.q}</h4>
                <p className="text-sm text-brand-wine-dark/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand-burgundy text-brand-cream py-12 px-8 text-center rounded-lg border border-brand-wine-dark shadow-md">
        <h2 className="text-xl font-bold mb-6 text-brand-cream">Where We Deliver</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-brand-cream/80 mb-6">
          {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot"].map((city) => (
            <span key={city} className="border border-brand-gold/30 py-2 rounded-sm bg-brand-wine-dark/40">{city}</span>
          ))}
        </div>
        <p className="text-xs text-brand-gold tracking-wider uppercase font-semibold">We deliver to all districts across Pakistan</p>
      </div>
    </div>
  );
}
