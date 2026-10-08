import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, index: true },
  price: { type: Number, required: true, min: 0, max: 10_000_000 },
  category: { type: String, required: true, trim: true },
  mainImage: String,
  thumbnails: [String],
  description: { type: String, maxlength: 5000 },
  highlights: [{
    emoji: { type: String, default: '✨' },
    text: { type: String, default: '' },
  }],
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
