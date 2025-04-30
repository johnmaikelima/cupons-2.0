import mongoose from 'mongoose';
import slugify from 'slugify';

const couponSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, unique: true },
  code: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ['percentage', 'fixed', 'freeShipping']
  },
  store: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  expiryDate: { type: Date, required: true },
  affiliateLink: { type: String, required: true },
  active: { type: Boolean, default: true },
  externalId: {
    provider: { type: String },
    id: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Remove imagem do schema
// Adiciona geração automática de slug
couponSchema.pre('save', function(next) {
  if (!this.slug) {
    // Gera o slug base
    let baseSlug = slugify(this.title, { 
      lower: true,
      strict: true,
      trim: true
    });

    // Adiciona um timestamp para garantir unicidade
    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }
  
  this.updatedAt = new Date();
  next();
});

// Índice composto para evitar duplicatas de cupons externos
couponSchema.index({ 'externalId.provider': 1, 'externalId.id': 1 }, { unique: true, sparse: true });

// Índice para o slug
couponSchema.index({ slug: 1 }, { unique: true });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
