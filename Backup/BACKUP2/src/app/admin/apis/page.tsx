'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Api {
  _id: string;
  name: string;
  provider: string;
  isActive: boolean;
  lastSync?: string;
}

declare global {
  interface Window {
    __INITIAL_APIS__: Api[];
  }
}

export default function ApisPage() {
  const router = useRouter();
  const [apis, setApis] = useState<Api[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApis(window.__INITIAL_APIS__ || []);
    }
  }, []);

  const handleSync = async (apiId: string) => {
    try {
      setSyncing(apiId);
      setError('');

      const res = await fetch(`/api/apis/${apiId}/sync`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro na sincronização');
      }

      // Atualiza a lista de APIs
      router.refresh();
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      setError(error.message || 'Erro na sincronização');
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">APIs de Importação</h1>
        <Link
          href="/admin/apis/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nova API
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Sincronização
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apis.map((api) => (
              <tr key={api._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {api.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {api.provider}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    api.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {api.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {api.lastSync ? new Date(api.lastSync).toLocaleString('pt-BR') : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/apis/${api._id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleSync(api._id)}
                    disabled={syncing === api._id || !api.isActive}
                    className={`text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                      syncing === api._id ? 'animate-pulse' : ''
                    }`}
                  >
                    {syncing === api._id ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                </td>
              </tr>
            ))}

            {apis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhuma API configurada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
