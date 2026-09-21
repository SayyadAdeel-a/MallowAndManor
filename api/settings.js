import connectDB from './_lib/db.js';
import { verifyToken } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import SiteSettings from './_lib/models/SiteSettings.js';

// Bump this when DEFAULT_SETTINGS change to auto-migrate stale docs
const DEFAULTS_VERSION = 3;

const DEFAULT_SETTINGS = {
  defaultsVersion: DEFAULTS_VERSION,
  hero: {
    tagline: '',
    heading1: 'Curated',
    heading2: 'Beauty',
    subtitle: 'Bangles · Abayas · Accessories',
    cta1Text: 'Shop Now',
    cta1Link: '/products',
    cta2Text: 'Our Story',
    cta2Link: '/about',
    taglineBottom: 'Style with purpose. Elegance in every layer.',
    image: '/hero-banner.webp',
    features: [
      { icon: 'star', label: 'Elegant' },
      { icon: 'clock', label: 'Timeless' },
      { icon: 'heart', label: 'Empowered' },
      { icon: 'sparkle', label: 'Curated' },
    ],
  },
  trustItems: [
    { iconKey: 'package', label: 'Free Shipping over Rs. 5,000' },
    { iconKey: 'sparkle', label: 'Handcrafted with Intention' },
    { iconKey: 'star', label: 'Premium Quality Materials' },
    { iconKey: 'truck', label: 'Delivered Across Pakistan' },
  ],
  sale: {
    badge: 'Limited Time',
    heading: '30%',
    headingAccent: 'OFF',
    description: 'Our entire Abaya collection. Handcrafted luxury, now at prices that make elegance accessible.',
    ctaText: 'Shop Abayas',
    ctaLink: '/products?category=abayas',
    image: '/Limited Time Sale Banner.webp',
    enabled: true,
  },
  promises: [
    { iconKey: 'heart', animation: 'beat', title: 'Made with Love', description: 'Every piece is handcrafted by skilled artisans who pour care into each detail.' },
    { iconKey: 'sparkle', animation: 'pulse', title: 'Premium Materials', description: 'We source only the finest fabrics, stones, and metals for lasting quality.' },
    { iconKey: 'truck', animation: 'float', title: 'Fast Delivery', description: 'Free nationwide shipping on orders over Rs. 5,000. Delivered to your doorstep.' },
    { iconKey: 'shield', animation: 'spin', title: 'Quality Guarantee', description: 'Not satisfied? We accept returns within 24 hours of delivery. No questions asked.' },
  ],
  story: {
    tagline: 'Our Story',
    heading: 'The Art of\nRefinement',
    description: "We believe luxury isn't about the price tag — it's about wearing something created with intention.",
    ctaText: 'Read Our Story',
    ctaLink: '/about',
    image: '/Brand Story Parallax Banner.webp',
  },
  newsletter: {
    tagline: 'Stay Connected',
    heading: 'Join the Inner Circle',
    description: 'Sign up for early access to exclusive drops and seasonal events.',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing!',
  },
  footer: {
    description: 'Premium bangles, abayas, nails and accessories, thoughtfully curated for modern living.',
    instagram: 'https://www.instagram.com/honeybeelane/',
    tiktok: 'https://www.tiktok.com/@honeybeelane?lang=en',
    copyrightText: 'Honeybee Lane. All rights reserved.',
  },
  contact: {
    heading: 'Get In Touch',
    subheading: "We're here to help you get every detail right.",
    phone: '+92 323 3334492',
    email: 'hello@honeybeelane.com',
    address: 'DHA Phase 6, Karachi, Pakistan',
    whatsapp: 'https://wa.me/923233334492',
    faqs: [
      { q: 'Where do you deliver?', a: 'We provide nationwide delivery across Pakistan, covering all major cities including Karachi, Lahore, Islamabad, and more.' },
      { q: 'How can I track my order?', a: 'Once confirmed via WhatsApp, we provide a tracking number and regular delivery updates.' },
      { q: 'What are the shipping costs?', a: 'Shipping is calculated by destination. Free delivery on orders over Rs. 5,000.' },
      { q: 'What is your return policy?', a: 'We accept returns for damaged items reported within 24 hours of delivery.' },
    ],
  },
  about: {
    heading: 'Our Story',
    subheading: 'Born from a passion for timeless beauty',
    paragraphs: [
      'Honeybee Lane was born from a simple belief: every woman deserves access to handcrafted beauty without compromise.',
      'Our pieces blend traditional craftsmanship with modern design, creating jewelry and accessories that honor heritage while embracing the contemporary woman.',
    ],
    image: '/About Page Hero Banner.webp',
  },
  productPage: {
    sizesLabel: 'Size',
    sizes: ['S', 'M', 'L', 'XL'],
    showSizes: true,
    highlights: [
      { emoji: '✨', text: 'Handcrafted with premium materials' },
      { emoji: '🚚', text: 'Fast delivery across Pakistan' },
      { emoji: '💎', text: 'Premium quality guarantee' },
      { emoji: '🎁', text: 'Beautiful gift-ready packaging' },
      { emoji: '📦', text: 'Free shipping over Rs. 5,000' },
    ],
    whatsappOrderLabel: 'Order via WhatsApp',
    showWhatsappOrder: true,
    reviewsHeading: 'Customer Reviews',
    showReviews: true,
    writeReviewLabel: 'Write a Review',
    alsoLikeHeading: 'You May Also Like',
    alsoLikeCount: 4,
    featuresTitle: 'Features',
    craftedText: 'Crafted from high-quality materials with attention to every detail, this piece offers comfort, versatility and timeless style.',
    noteText: 'Note: You can wear these pieces with almost every outfit.',
    shippingInfo: {
      title: 'Shipping Information',
      text: 'We deliver nationwide across Pakistan, covering all major cities. Free shipping on orders above Rs. 5,000. Orders are dispatched within 24 hours, and delivery takes 3-5 working days. Cash on delivery is available.',
    },
  },
  productReviews: [
    {
      author: 'Hafsa Kamran', rating: 5, date: '2 weeks ago',
      body: 'Product ki quality bohat achi hai, bilkul photos jaisa. Delivery bhi jaldi hui. Must recommend!',
    },
    {
      author: 'Areeba Khan', rating: 5, date: '1 month ago',
      body: 'Quality zabardast hai aur packing bhi bohat achi thi. Paisa wasool!',
    },
    {
      author: 'Ahmed Raza', rating: 4, date: '1 month ago',
      body: 'Pehle doubt tha online order karne mein, lekin WhatsApp pe sab confirm karwaya aur bilkul sahi product mila.',
    },
    {
      author: 'Anaya Malik', rating: 5, date: '2 months ago',
      body: 'Second time order kar rahi hoon — pehli wali abhi tak bilkul nayi hai. Bohat durable.',
    },
    {
      author: 'Sidra Baloch', rating: 5, date: '2 months ago',
      body: 'Bohat pyara item hai, gift ke liye liya tha aur behen bohat khush hui. 5 stars!',
    },
    {
      author: 'Usman Ghani', rating: 4, date: '3 months ago',
      body: 'Bhabhi ko gift kiya, unhe bohat pasand aaya. Shukriya Honeybee Lane!',
    },
  ],
  homeReviews: [
    {
      name: 'Ayesha Siddiqui', city: 'Karachi', language: 'ur', rating: 5,
      text: 'Mashallah bangles bohat khoobsurat hain! Packaging zabardast thi aur Karachi mein agli hi din delivery mil gayi. Aisa quality bazaar mein nahi milta.',
    },
    {
      name: 'Gulalai Yousafzai', city: 'Peshawar', language: 'ps', rating: 5,
      text: 'Dera khaista churyane wen! Zar raghle aw quality ye dera sha — Peshawar na ba baya kharam.',
    },
    {
      name: 'Fatima Noor', city: 'Lahore', language: 'ur', rating: 5,
      text: 'Abaya ka kapra bohat naram aur premium hai, silai bohat aala hai. Shadi se pehle order kiya tha, sab ne tareef ki.',
    },
    {
      name: 'Bakhtawar Khan', city: 'Mardan', language: 'ps', rating: 5,
      text: 'Abaya dera khaista da, toar ye naram aw andaza ye barabar da. Dera manana!',
    },
    {
      name: 'Maryam Bibi', city: 'Islamabad', language: 'ur', rating: 5,
      text: 'Pehle kabhi press-on nails nahi lagayi thin, lekin ye itni asaan hain aur design bilkul tasveeron jaisa hai.',
    },
    {
      name: 'Zarlasht Khan', city: 'Swat', language: 'ps', rating: 5,
      text: 'Da qeemat mein itne khoobsurat nails kahin nahi milte. Dera manana!',
    },
    {
      name: 'Zainab Khan', city: 'Quetta', language: 'ur', rating: 5,
      text: 'WhatsApp se order karna bohat asaan tha, apni pasand ka design bataya aur bilkul waisa hi mila. Shukriya Honeybee Lane!',
    },
    {
      name: 'Gul Makai', city: 'Khyber', language: 'ps', rating: 5,
      text: 'Necklace dera khaista da, rang ye khog da. Ammi dera khush shwa.',
    },
  ],
  categoryIntros: [
    {
      slug: 'bangles',
      intro: 'Discover handcrafted gold-plated bangles designed for Pakistani women who love timeless jewellery. Each bangle set in our collection is finished by hand with intricate floral motifs — perfect for weddings, Eid, and everyday elegance, delivered to your doorstep anywhere in Pakistan.',
    },
    {
      slug: 'nails',
      intro: 'Luxury press-on nails with Swarovski crystals and hand-placed pearl detailing. Our designer nail sets give you a salon-quality manicure in minutes — no appointments, no drying time, reusable across wears, shipped anywhere in Pakistan.',
    },
    {
      slug: 'abayas',
      intro: 'Elegant abayas crafted from soft, breathable fabrics with delicate embroidery and graceful drape. Designed for daily comfort and special occasions alike, our abaya collection balances modesty with modern style — with free shipping on larger orders.',
    },
    {
      slug: 'necklaces',
      intro: 'Royal artificial necklaces with premium stones and gold-tone finish, made for bridal looks, mehndi nights and festive celebrations. Handcrafted jewellery that holds its shine — at accessible prices, delivered across Pakistan.',
    },
  ],
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // GET /api/settings — public
    if (req.method === 'GET') {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create(DEFAULT_SETTINGS);
      } else {
        // Backfill sections added after the document was first created
        let dirty = false;
        if (!settings.productPage) {
          settings.productPage = DEFAULT_SETTINGS.productPage;
          dirty = true;
        }
        if (!settings.productPage.sizes?.length) {
          settings.productPage.sizes = DEFAULT_SETTINGS.productPage.sizes;
          dirty = true;
        }
        // One-time: replace native-script (Urdu/Pashto) reviews with the Hinglish defaults
        if (Array.isArray(settings.homeReviews) && settings.homeReviews.some((r) => /[\u0600-\u06FF]/.test(r?.text || ""))) {
          settings.homeReviews = DEFAULT_SETTINGS.homeReviews;
          dirty = true;
        }
        if (dirty) await settings.save();
      }
      if ((settings.defaultsVersion || 0) < DEFAULTS_VERSION) {
        settings = await SiteSettings.findByIdAndUpdate(
          settings._id,
          { ...DEFAULT_SETTINGS },
          { new: true }
        );
      }
      return res.json(settings);
    }

    // PUT /api/settings — admin only
    if (req.method === 'PUT') {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({ ...DEFAULT_SETTINGS, ...req.body });
      } else {
        Object.assign(settings, req.body);
        await settings.save();
      }
      return res.json(settings);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
