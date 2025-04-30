'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ApiFormProps {
  initialData?: {
    _id?: string;
    name: string;
    provider: string;
    appToken: string;
    sourceId: string;
    isActive: boolean;
  };
}

export default function ApiForm({ initialData }: ApiFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      provider: formData.get('provider'),
      appToken: formData.get('appToken'),
      sourceId: formData.get('sourceId'),
      isActive: formData.get('isActive') === 'on'
    };

    try {
      const url = initialData?._id 
        ? `/api/apis/${initialData._id}`
        : '/api/apis';
        
      const res = await fetch(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Erro ao salvar API');
      }

      router.push('/admin/apis');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao salvar API:', error);
      setError(error.message || 'Erro ao salvar API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Provedor
        </label>
        <select
          id="provider"
          name="provider"
          required
          defaultValue={initialData?.provider}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        >
          <option value="">Selecione um provedor</option>
          <option value="lomadee">Lomadee</option>
        </select>
      </div>

      <div>
        <label htmlFor="appToken" className="block text-sm font-medium text-gray-700">
          App Token
        </label>
        <input
          type="text"
          id="appToken"
          name="appToken"
          required
          defaultValue={initialData?.appToken}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="sourceId" className="block text-sm font-medium text-gray-700">
          Source ID
        </label>
        <input
          type="text"
          id="sourceId"
          name="sourceId"
          required
          defaultValue={initialData?.sourceId}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked={initialData?.isActive ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Ativo
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
