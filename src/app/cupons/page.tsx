import { Coupon } from "@/models/Coupon";
import connectDB from "@/lib/mongodb";
import CouponCard from "@/components/CouponCard";

async function getCoupons() {
  await connectDB();
  const coupons = await Coupon.find({ active: true })
    .populate('store', 'name logo slug')
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(coupons));
}

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Todos os Cupons</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <CouponCard key={coupon._id} coupon={coupon} />
        ))}
      </div>

      {coupons.length === 0 && (
        <p className="text-gray-500 text-center">
          Nenhum cupom disponível no momento.
        </p>
      )}
    </main>
  );
}
