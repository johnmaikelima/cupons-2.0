import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import connectDB from '@/lib/mongodb';
import StoreCard from '@/components/StoreCard';
import CouponCard from '@/components/CouponCard';

export default async function HomePage() {
  await connectDB();
  
  const [featuredStores, latestCoupons] = await Promise.all([
    Store.find({ featured: true }).limit(6).lean(),
    Coupon.find({ active: true })
      .populate('store')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  return (
    <div className="space-y-12">
      {/* Seção de Lojas em Destaque */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Lojas em Destaque
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStores.map((store) => (
            <StoreCard key={store._id.toString()} store={JSON.parse(JSON.stringify(store))} />
          ))}
        </div>
      </section>

      {/* Seção de Cupons Recentes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Cupons Recentes
        </h2>
        <div className="space-y-4">
          {latestCoupons.map((coupon) => (
            <CouponCard key={coupon._id.toString()} coupon={JSON.parse(JSON.stringify(coupon))} />
          ))}
        </div>
      </section>
    </div>
  );
}
