import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  mainImage: String,
  thumbnails: [String],
  description: String,
  highlights: [{
    emoji: { type: String, default: '✨' },
    text: { type: String, default: '' },
  }],
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
