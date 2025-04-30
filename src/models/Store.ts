import mongoose from 'mongoose';
import slugify from 'slugify';

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  couponsCount?: number;
}

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  featured: { type: Boolean, default: false },
  coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Gera slug único antes de salvar
storeSchema.pre('save', async function(next) {
  try {
    if (!this.slug) {
      // Gera o slug base
      let baseSlug = slugify(this.name, { 
        lower: true,
        strict: true,
        trim: true
      });

      // Verifica se já existe uma loja com esse slug
      const existingStore = await mongoose.models.Store.findOne({ slug: baseSlug });
      if (existingStore) {
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

// Índice para o slug
storeSchema.index({ slug: 1 }, { unique: true });

// Índice para o nome da loja
storeSchema.index({ name: 1 });

export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
