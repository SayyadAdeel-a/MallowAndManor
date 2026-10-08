import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  eventData: mongoose.Schema.Types.Mixed,
  userAgent: String,
  referrer: String,
}, { timestamps: true });

analyticsSchema.index({ eventType: 1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ 'eventData.productId': 1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
