import Image from 'next/image';
import CouponModal from '@/components/CouponModal';
import CouponCard from '@/components/CouponCard';
import StoreHeader from '@/components/StoreHeader';
import StoreSidebar from '@/components/StoreSidebar';
import RelatedStores from '@/components/RelatedStores';
import { Store } from '@/models/Store';
import connectDB from '@/lib/mongodb';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    slug: string;
  };
}

// Função para formatar o mês em português
function getMonthName(month: number): string {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 
    'maio', 'junho', 'julho', 'agosto',
    'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return months[month];
}

// Função para encontrar o maior desconto entre os cupons ativos
function getMaxDiscount(coupons: any[]): number {
  const now = new Date();
  const activeCoupons = coupons.filter(coupon => 
    coupon.active && new Date(coupon.expiryDate) > now
  );

  let maxDiscount = 0;
  for (const coupon of activeCoupons) {
    if (coupon.type === 'percentage') {
      // Extrai o número do título/descrição do cupom
      const match = coupon.description.match(/(\d+)%/);
      if (match) {
        const discount = parseInt(match[1]);
        maxDiscount = Math.max(maxDiscount, discount);
      }
    }
  }
  return maxDiscount;
}

// Função para formatar a data
const formatExpiryDate = (date: string) => {
  if (!date) return "Mai/2025";
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const d = new Date(date);
  return `${months[d.getMonth()]}/${d.getFullYear()}`;
};

// Função para gerar os metadados da página
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const store = await Store.findOne({ slug: params.slug }).populate('coupons');
  
  if (!store) {
    return {
      title: 'Loja não encontrada'
    };
  }

  const maxDiscount = getMaxDiscount(store.coupons);
  const now = new Date();
  const month = getMonthName(now.getMonth());
  const year = now.getFullYear();

  const title = maxDiscount > 0
    ? `Cupons ${store.name} 💰Até ${maxDiscount}% OFF em ${month} de ${year}`
    : `Cupons ${store.name} - Ofertas de ${month} de ${year}`;

  return {
    title,
    description: `Cupons de desconto ${store.name} válidos para ${month} de ${year}. Economize até ${maxDiscount}% em suas compras.`
  };
}

export default async function StorePage({ params }: Props) {
  if (!params?.slug) {
    return notFound();
  }

  await connectDB();
  
  // Busca os dados da loja atual
  const storeDoc = await Store.findOne({ slug: params.slug })
    .populate('coupons')
    .lean();

  if (!storeDoc) {
    return notFound();
  }

  // Converte os dados do MongoDB para objetos simples
  const storeData = {
    ...storeDoc,
    _id: storeDoc._id.toString(),
    coupons: storeDoc.coupons?.map((coupon: any) => ({
      ...coupon,
      _id: coupon._id.toString(),
      store: typeof coupon.store === 'object' ? coupon.store.toString() : coupon.store,
      createdAt: coupon.createdAt?.toISOString(),
      updatedAt: coupon.updatedAt?.toISOString(),
      expiryDate: coupon.expiryDate?.toISOString()
    }))
  };

  // Busca lojas relacionadas
  const relatedStoresDoc = await Store.find({
    _id: { $ne: storeDoc._id },
    $or: [
      { category: storeDoc.category },
      { maxDiscount: { $gte: getMaxDiscount(storeDoc.coupons) - 10, $lte: getMaxDiscount(storeDoc.coupons) + 10 } }
    ]
  })
  .limit(12)
  .select('name logo slug maxDiscount')
  .lean();

  // Converte as lojas relacionadas para objetos simples
  const relatedStores = relatedStoresDoc.map((store: any) => ({
    ...store,
    _id: store._id.toString()
  }));

  const maxDiscount = getMaxDiscount(storeData.coupons);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header with Stats */}
      <StoreHeader
        logo={storeData.logo}
        name={storeData.name}
        maxDiscount={maxDiscount}
        affiliateLink={storeData.coupons?.[0]?.affiliateLink}
        activeCoupons={storeData.coupons?.length || 0}
        expirationDate={formatExpiryDate(storeData.coupons?.[0]?.expiryDate)}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Coupon Grid */}
          <div className="flex flex-col gap-4">
            {storeData.coupons?.map((coupon: any) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
              />
            ))}
          </div>

          {/* Store Description */}
          <article className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Sobre a {storeData.name}</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: storeData.description }}
            />
          </article>

          {/* Lojas Relacionadas */}
          <RelatedStores
            stores={relatedStores}
            currentStoreId={storeData._id}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="lg:sticky lg:top-4 space-y-6">
            <StoreSidebar
              storeName={storeData.name}
              affiliateLink={storeData.coupons?.[0]?.affiliateLink || '#'}
            />

            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Informações da Loja</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cupons Ativos</span>
                  <span className="font-semibold">{storeData.coupons?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Desconto Médio</span>
                  <span className="font-semibold">{Math.round(maxDiscount * 0.7)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Última Atualização</span>
                  <span className="font-semibold">Hoje</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Categoria</span>
                  <span className="font-semibold">E-commerce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
