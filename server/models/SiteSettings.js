import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
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
      label: { type: String, default: '' },
    }],
  },
  trustItems: [{
    iconKey: { type: String, default: 'package' },
    label: { type: String, default: '' },
  }],
  sale: {
    badge: { type: String, default: 'Limited Time' },
    heading: { type: String, default: '30%' },
    headingAccent: { type: String, default: 'OFF' },
    description: { type: String, default: '' },
    ctaText: { type: String, default: 'Shop Abayas' },
    ctaLink: { type: String, default: '/products?category=abayas' },
    image: { type: String, default: '/earrings-hand.webp' },
    enabled: { type: Boolean, default: true },
  },
  promises: [{
    iconKey: { type: String, default: 'heart' },
    animation: { type: String, default: 'beat' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  }],
  story: {
    tagline: { type: String, default: 'Our Story' },
    heading: { type: String, default: 'The Art of\nRefinement' },
    description: { type: String, default: '' },
    ctaText: { type: String, default: 'Read Our Story' },
    ctaLink: { type: String, default: '/about' },
    image: { type: String, default: '/earrings-stud.webp' },
  },
  newsletter: {
    tagline: { type: String, default: 'Stay Connected' },
    heading: { type: String, default: 'Join the Inner Circle' },
    description: { type: String, default: '' },
    buttonText: { type: String, default: 'Subscribe' },
    successMessage: { type: String, default: 'Thank you for subscribing!' },
  },
  footer: {
    description: { type: String, default: '' },
    instagram: { type: String, default: 'https://www.instagram.com/honeybeelane/' },
    tiktok: { type: String, default: 'https://www.tiktok.com/@honeybeelane?lang=en' },
    copyrightText: { type: String, default: 'Honeybee Lane. All rights reserved.' },
  },
  contact: {
    heading: { type: String, default: 'Get In Touch' },
    subheading: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    faqs: [{ q: String, a: String }],
  },
  about: {
    heading: { type: String, default: 'Our Story' },
    subheading: { type: String, default: '' },
    paragraphs: [String],
    image: { type: String, default: '/earrings-portrait.webp' },
  },
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);
