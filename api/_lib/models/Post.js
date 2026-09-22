import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  excerpt: String,
  author: String,
  published: { type: Boolean, default: false },
  scheduledAt: { type: Date, default: null },
  tags: [String],
  featuredImage: String,
  seoTitle: String,
  seoDescription: String,
}, { timestamps: true });

postSchema.index({ slug: 1 });
postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ scheduledAt: 1, published: 1 });

export default mongoose.model('Post', postSchema);
