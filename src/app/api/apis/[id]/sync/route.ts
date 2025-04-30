'use server';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ApiConfig } from '@/models/ApiConfig';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import slugify from 'slugify';

function generateStoreDescription(storeName: string) {
  return `Encontre os melhores cupons de desconto e ofertas da ${storeName}. Economize em suas compras online com códigos promocionais exclusivos e ofertas imperdíveis.`;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Busca a API pelo ID
    const api = await ApiConfig.findById(params.id);
    if (!api) {
      return NextResponse.json(
        { message: 'API não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se tem appToken e sourceId
    if (!api.appToken || !api.sourceId) {
      return NextResponse.json(
        { message: 'API não configurada corretamente (falta appToken ou sourceId)' },
        { status: 400 }
      );
    }

    // Busca cupons da API Lomadee
    const lomadeeUrl = `http://api.lomadee.com/v2/${api.appToken}/coupon/_all?sourceId=${api.sourceId}`;
    
    try {
      const response = await fetch(lomadeeUrl);
      if (!response.ok) {
        return NextResponse.json(
          { message: 'Erro ao buscar cupons da API Lomadee' },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Verifica se a resposta tem o formato esperado
      if (!data.coupons) {
        return NextResponse.json(
          { message: 'Formato de resposta inválido da API Lomadee' },
          { status: 400 }
        );
      }

      // Processa cada cupom
      for (const lomadeeCoupon of data.coupons) {
        try {
          // Verifica se a data de vigência é válida
          const vigencyDate = new Date(lomadeeCoupon.vigency);
          if (isNaN(vigencyDate.getTime())) {
            console.warn(`Cupom ${lomadeeCoupon.id} ignorado: data de vigência inválida`);
            continue;
          }

          // Busca ou cria a loja
          let store = await Store.findOne({ name: lomadeeCoupon.store.name });
          
          if (!store) {
            try {
              let storeSlug = slugify(lomadeeCoupon.store.name, { lower: true, strict: true });
              // Verifica se já existe uma loja com esse slug
              const existingStoreWithSlug = await Store.findOne({ slug: storeSlug });
              if (existingStoreWithSlug) {
                storeSlug = `${storeSlug}-${Date.now().toString(36)}`;
              }

              store = await Store.create({
                name: lomadeeCoupon.store.name,
                logo: lomadeeCoupon.store.image || 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(lomadeeCoupon.store.name),
                slug: storeSlug,
                description: generateStoreDescription(lomadeeCoupon.store.name),
                featured: false
              });
            } catch (storeError) {
              console.error('Erro ao criar loja:', storeError);
              continue;
            }
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
            expiryDate: vigencyDate,
            affiliateLink: lomadeeCoupon.link,
            active: true,
            externalId: {
              provider: 'lomadee',
              id: lomadeeCoupon.id
            }
          };

          let coupon;
          if (existingCoupon) {
            // Atualiza o cupom existente
            coupon = await Coupon.findByIdAndUpdate(existingCoupon._id, couponData, { new: true });
          } else {
            // Cria um novo cupom
            coupon = await Coupon.create(couponData);
            // Adiciona o cupom à lista de cupons da loja
            await Store.findByIdAndUpdate(store._id, {
              $addToSet: { coupons: coupon._id }
            });
          }
        } catch (couponError) {
          console.error('Erro ao processar cupom:', couponError);
          continue;
        }
      }

      // Atualiza a data da última sincronização
      await ApiConfig.findByIdAndUpdate(params.id, {
        lastSync: new Date()
      });

      return NextResponse.json({ 
        message: 'Cupons sincronizados com sucesso',
        totalCoupons: data.coupons.length
      });

    } catch (error) {
      console.error('Erro ao sincronizar cupons:', error);
      return NextResponse.json(
        { message: 'Erro ao sincronizar cupons' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
