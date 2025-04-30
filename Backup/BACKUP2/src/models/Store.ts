import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

storeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
