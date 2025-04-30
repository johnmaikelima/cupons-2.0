import mongoose from 'mongoose';
import slugify from 'slugify';
import { Store } from './Store';

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code?: string;
  type: string;
  discount?: number;
  store?: Store;
  expirationDate?: string;
}

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

// Gera slug único antes de salvar
couponSchema.pre('save', async function(next) {
  try {
    if (!this.slug) {
      // Gera o slug base
      let baseSlug = slugify(this.title, { 
        lower: true,
        strict: true,
        trim: true
      });

      // Verifica se já existe um cupom com esse slug
      const existingCoupon = await mongoose.models.Coupon.findOne({ slug: baseSlug });
      if (existingCoupon) {
        // Se existir, adiciona um timestamp para garantir unicidade
        baseSlug = `${baseSlug}-${Date.now().toString(36)}`;
      }

      this.slug = baseSlug;
    }
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Índice composto para evitar duplicatas de cupons externos
couponSchema.index({ 'externalId.provider': 1, 'externalId.id': 1 }, { unique: true, sparse: true });

// Índice para o slug
couponSchema.index({ slug: 1 }, { unique: true });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
