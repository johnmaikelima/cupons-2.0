import connectDB from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';

export async function getCoupons() {
  await connectDB();
  const coupons = await Coupon.find()
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(coupons));
}
