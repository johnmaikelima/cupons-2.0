import { NextResponse } from 'next/server';
import { ApiConfig } from '@/models/ApiConfig';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { generateStoreDescription } from '@/utils/storeDescription';
import connectDB from '@/lib/mongodb';
import slugify from 'slugify';

// POST /api/apis/[id]/sync
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const api = await ApiConfig.findById(params.id);
    if (!api) {
      return NextResponse.json(
        { message: 'API não encontrada' },
        { status: 404 }
      );
    }

    if (!api.isActive) {
      return NextResponse.json(
        { message: 'API está inativa' },
        { status: 400 }
      );
    }

    if (api.provider !== 'lomadee') {
      return NextResponse.json(
        { message: 'Provedor não suportado' },
        { status: 400 }
      );
    }

    // Busca cupons da API Lomadee
    const lomadeeUrl = `https://api.lomadee.com/v2/${api.appToken}/coupon/_all?sourceId=${api.sourceId}`;
    const response = await fetch(lomadeeUrl);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar cupons da API Lomadee');
    }

    const data = await response.json();

    // Processa os cupons
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (const lomadeeCoupon of data.coupons) {
      try {
        // Busca ou cria a loja
        let store = await Store.findOne({ name: lomadeeCoupon.store.name });
        
        if (!store) {
          store = await Store.create({
            name: lomadeeCoupon.store.name,
            logo: lomadeeCoupon.store.image || 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(lomadeeCoupon.store.name),
            slug: slugify(lomadeeCoupon.store.name, { lower: true, strict: true }),
            description: generateStoreDescription(lomadeeCoupon.store.name),
            featured: false
          });
        } else if (!store.logo && lomadeeCoupon.store.image) {
          // Atualiza o logo da loja se ela não tiver um e a API fornecer
          await Store.findByIdAndUpdate(store._id, {
            logo: lomadeeCoupon.store.image
          });
        }

        // Determina o tipo de cupom
        let type = 'fixed';
        if (lomadeeCoupon.discount > 0) {
          type = 'percentage';
        } else if (lomadeeCoupon.description.toLowerCase().includes('frete')) {
          type = 'freeShipping';
        }

        // Busca ou atualiza o cupom
        const existingCoupon = await Coupon.findOne({ 
          'externalId.provider': 'lomadee',
          'externalId.id': lomadeeCoupon.id
        });

        const couponData = {
          title: lomadeeCoupon.description,
          description: lomadeeCoupon.description,
          code: lomadeeCoupon.code,
          type,
          store: store._id,
          expiryDate: new Date(lomadeeCoupon.vigency),
          affiliateLink: lomadeeCoupon.link,
          active: true,
          externalId: {
            provider: 'lomadee',
            id: lomadeeCoupon.id
          }
        };

        if (existingCoupon) {
          await Coupon.findByIdAndUpdate(existingCoupon._id, couponData);
          updated++;
        } else {
          await Coupon.create(couponData);
          imported++;
        }
      } catch (error) {
        console.error('Erro ao processar cupom:', error);
        errors++;
      }
    }

    // Atualiza a data da última sincronização
    await ApiConfig.findByIdAndUpdate(params.id, {
      lastSync: new Date()
    });

    return NextResponse.json({
      message: 'Sincronização concluída',
      stats: {
        imported,
        updated,
        errors
      }
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json(
      { message: 'Erro na sincronização' },
      { status: 500 }
    );
  }
}
