import { notFound } from 'next/navigation';
import ApiForm from '@/components/admin/ApiForm';
import { ApiConfig } from '@/models/ApiConfig';
import connectDB from '@/lib/mongodb';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditApiPage({ params }: Props) {
  await connectDB();
  
  const api = await ApiConfig.findById(params.id).lean();

  if (!api) {
    notFound();
  }

  const formattedApi = {
    ...api,
    _id: api._id.toString()
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar API</h1>
      <ApiForm initialData={formattedApi} />
    </div>
  );
}
