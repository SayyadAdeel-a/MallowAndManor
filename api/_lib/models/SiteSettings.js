import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  // Hero section
  hero: {
    tagline: { type: String, default: 'Curated Beauty' },
    heading1: { type: String, default: 'Adorned' },
    heading2: { type: String, default: 'in Elegance' },
    subtitle: { type: String, default: 'Handcrafted jewelry & beauty essentials, designed for the modern woman who honors tradition.' },
    cta1Text: { type: String, default: 'Shop Collection' },
    cta1Link: { type: String, default: '/products' },
    cta2Text: { type: String, default: 'Our Story' },
    cta2Link: { type: String, default: '/about' },
    taglineBottom: { type: String, default: '"Where tradition meets modern elegance"' },
    image: { type: String, default: '/earrings-portrait.webp' },
    features: [{
      icon: { type: String, default: 'star' },
      label: { type: String, default: 'Elegant' },
    }],
  },

  // Trust marquee
  trustItems: [{
    iconKey: { type: String, default: 'package' },
    label: { type: String, default: '' },
  }],

  // Sale banner
  sale: {
    badge: { type: String, default: 'Limited Time' },
    heading: { type: String, default: '30%' },
    headingAccent: { type: String, default: 'OFF' },
    description: { type: String, default: 'Our entire Abaya collection. Handcrafted luxury, now at prices that make elegance accessible.' },
    ctaText: { type: String, default: 'Shop Abayas' },
    ctaLink: { type: String, default: '/products?category=abayas' },
    image: { type: String, default: '/earrings-hand.webp' },
    enabled: { type: Boolean, default: true },
  },

  // Brand promise
  promises: [{
    iconKey: { type: String, default: 'heart' },
    animation: { type: String, default: 'beat' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  }],

  // Parallax story
  story: {
    tagline: { type: String, default: 'Our Story' },
    heading: { type: String, default: 'The Art of\nRefinement' },
    description: { type: String, default: "We believe luxury isn't about the price tag — it's about wearing something created with intention." },
    ctaText: { type: String, default: 'Read Our Story' },
    ctaLink: { type: String, default: '/about' },
    image: { type: String, default: '/earrings-stud.webp' },
  },

  // Newsletter
  newsletter: {
    tagline: { type: String, default: 'Stay Connected' },
    heading: { type: String, default: 'Join the Inner Circle' },
    description: { type: String, default: 'Sign up for early access to exclusive drops and seasonal events.' },
    buttonText: { type: String, default: 'Subscribe' },
    successMessage: { type: String, default: 'Thank you for subscribing!' },
  },

  // Footer
  footer: {
    description: { type: String, default: 'Handcrafted beauty essentials, designed with intention and delivered with care across Pakistan.' },
    instagram: { type: String, default: 'https://www.instagram.com/honeybeelane/' },
    tiktok: { type: String, default: 'https://www.tiktok.com/@honeybeelane?lang=en' },
    copyrightText: { type: String, default: 'Honeybee Lane. All rights reserved.' },
  },

  // Contact page
  contact: {
    heading: { type: String, default: 'Get In Touch' },
    subheading: { type: String, default: "We're here to help you get every detail right." },
    phone: { type: String, default: '+92 323 3334492' },
    email: { type: String, default: 'hello@honeybeelane.com' },
    address: { type: String, default: 'DHA Phase 6, Karachi, Pakistan' },
    whatsapp: { type: String, default: 'https://wa.me/923233334492' },
    faqs: [{
      q: { type: String, default: '' },
      a: { type: String, default: '' },
    }],
  },

  // About page
  about: {
    heading: { type: String, default: 'Our Story' },
    subheading: { type: String, default: 'Born from a passion for timeless beauty' },
    paragraphs: [String],
    image: { type: String, default: '/earrings-portrait.webp' },
  },
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);
