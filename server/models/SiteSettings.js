import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  defaultsVersion: { type: Number, default: 0 },
  // Hero section
  hero: {
    tagline: { type: String, default: '' },
    heading1: { type: String, default: 'Curated' },
    heading2: { type: String, default: 'Beauty' },
    subtitle: { type: String, default: 'Bangles · Abayas · Accessories' },
    cta1Text: { type: String, default: 'Shop Now' },
    cta1Link: { type: String, default: '/products' },
    cta2Text: { type: String, default: 'Our Story' },
    cta2Link: { type: String, default: '/about' },
    taglineBottom: { type: String, default: 'Style with purpose. Elegance in every layer.' },
    image: { type: String, default: '/hero-banner.webp' },
    features: [{
      icon: { type: String, default: 'star' },
      label: { type: String, default: '' },
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
    description: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
    image: { type: String, default: '' },
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
    description: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '/about' },
    image: { type: String, default: '' },
  },

  // Newsletter
  newsletter: {
    tagline: { type: String, default: 'Stay Connected' },
    heading: { type: String, default: 'Join the Inner Circle' },
    description: { type: String, default: '' },
    buttonText: { type: String, default: 'Subscribe' },
    successMessage: { type: String, default: 'Thank you for subscribing!' },
  },

  // Footer
  footer: {
    description: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    copyrightText: { type: String, default: 'Honeybee Lane. All rights reserved.' },
  },

  // Contact page
  contact: {
    heading: { type: String, default: 'Get In Touch' },
    subheading: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    faqs: [{
      q: { type: String, default: '' },
      a: { type: String, default: '' },
    }],
  },

  // About page
  about: {
    heading: { type: String, default: 'Our Story' },
    subheading: { type: String, default: '' },
    paragraphs: [String],
    image: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);
