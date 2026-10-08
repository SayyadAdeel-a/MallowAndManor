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

// NOTE: `slug: { unique: true }` above already creates a unique index; declaring
// postSchema.index({ slug: 1 }) as well made Mongoose warn about a duplicate.
postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ scheduledAt: 1, published: 1 });

export default mongoose.models.Post || mongoose.model('Post', postSchema);
