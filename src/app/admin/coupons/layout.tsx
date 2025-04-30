import { getCoupons } from './page.server';
import CouponsPage from './page';

export default async function CouponsLayout() {
  const coupons = await getCoupons();

  return <CouponsPage coupons={coupons} />;
}
