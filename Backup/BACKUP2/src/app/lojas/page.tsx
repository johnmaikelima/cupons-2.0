import { Store } from '@/models/Store';
import connectDB from '@/lib/mongodb';
import StoreCard from '@/components/StoreCard';

export default async function StoresPage() {
  await connectDB();
  const stores = await Store.find().sort({ name: 1 });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Todas as Lojas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store: any) => (
          <StoreCard key={store._id} store={JSON.parse(JSON.stringify(store))} />
        ))}
      </div>
    </div>
  );
}
