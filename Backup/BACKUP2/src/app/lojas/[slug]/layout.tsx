import { notFound } from 'next/navigation';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import connectDB from '@/lib/mongodb';
import StorePageClient from './page';

interface Props {
  params: {
    slug: string;
  };
}

export default async function StoreLayout({ params }: Props) {
  await connectDB();

  const store = await Store.findOne({ slug: params.slug }).lean();
  if (!store) {
    notFound();
  }

  const coupons = await Coupon.find({ 
    store: store._id,
    active: true,
    expiryDate: { $gt: new Date() }
  }).sort({ createdAt: -1 }).lean();

  // Formata os dados para o cliente
  const formattedStore = {
    _id: store._id.toString(),
    name: store.name,
    logo: store.logo,
    description: store.description
  };

  const formattedCoupons = coupons.map(coupon => ({
    _id: coupon._id.toString(),
    title: coupon.title,
    description: coupon.description,
    code: coupon.code,
    type: coupon.type,
    expiryDate: coupon.expiryDate,
    affiliateLink: coupon.affiliateLink
  }));

  return <StorePageClient store={formattedStore} coupons={formattedCoupons} />;
}
