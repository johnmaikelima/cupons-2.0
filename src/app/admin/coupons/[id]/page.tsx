import { notFound } from 'next/navigation';
import CouponForm from '@/components/admin/CouponForm';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import connectDB from '@/lib/mongodb';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditCouponPage({ params }: Props) {
  await connectDB();
  
  const [coupon, stores] = await Promise.all([
    Coupon.findById(params.id).lean(),
    Store.find().sort({ name: 1 }).lean()
  ]);

  if (!coupon) {
    notFound();
  }

  // Ajusta os dados para o formato esperado pelo formulário
  const formattedCoupon = {
    ...coupon,
    _id: coupon._id.toString(),
    store: coupon.store.toString(),
    expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
  };

  const formattedStores = stores.map(store => ({
    ...store,
    _id: store._id.toString()
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Cupom</h1>
      <CouponForm 
        stores={formattedStores}
        initialData={formattedCoupon}
      />
    </div>
  );
}
