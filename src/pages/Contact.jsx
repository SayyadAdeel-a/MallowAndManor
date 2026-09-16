export default function Contact() {
  const faqs = [
    { q: "Where do you deliver?", a: "We provide nationwide delivery across Pakistan, covering all major cities including Karachi, Lahore, Islamabad, and more." },
    { q: "How can I track my order?", a: "Once confirmed via WhatsApp, we provide a tracking number and regular delivery updates." },
    { q: "What are the shipping costs?", a: "Shipping is calculated by destination. Free delivery on orders over Rs. 5,000." },
    { q: "What is your return policy?", a: "We accept returns for damaged items reported within 24 hours of delivery." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Get In Touch</h1>
        <p className="text-gray-400 text-sm">We're here to help you get every detail right.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Contact */}
        <div>
          <h2 className="text-lg font-semibold mb-6">Contact Details</h2>
          <div className="space-y-5">
            {[
              { label: "Phone", value: "+92 323 3334492", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
              { label: "Email", value: "hello@honeybeelane.com", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { label: "Address", value: "DHA Phase 6, Karachi, Pakistan", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 tracking-wider uppercase mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50">
            <h3 className="text-sm font-semibold mb-3">Business Hours</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between"><span>Mon - Fri</span><span className="font-medium text-brand-dark">9:00 AM - 6:00 PM</span></div>
              <div className="flex justify-between"><span>Saturday</span><span className="font-medium text-brand-dark">10:00 AM - 4:00 PM</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-medium text-gray-400">Closed</span></div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <h4 className="text-sm font-medium mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-brand-black text-brand-cream py-12 px-8 text-center">
        <h2 className="text-xl font-bold mb-6">Where We Deliver</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-brand-cream/70 mb-6">
          {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot"].map((city) => (
            <span key={city}>{city}</span>
          ))}
        </div>
        <p className="text-xs text-brand-cream/40">We deliver to all districts across Pakistan</p>
      </div>
    </div>
  );
}
