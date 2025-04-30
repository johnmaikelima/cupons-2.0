'use client';

import Image from 'next/image';
import { useState } from 'react';
import CouponModal from '@/components/CouponModal';

interface Props {
  store: {
    name: string;
    logo: string;
    description: string;
  };
  coupons: Array<{
    _id: string;
    title: string;
    code?: string;
    affiliateLink: string;
  }>;
}

export default function StorePage({ store, coupons }: Props) {
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCouponClick = (coupon: any) => {
    setSelectedCoupon(coupon);
    setModalOpen(true);
  };

  const maxDiscount = coupons.reduce((max, coupon) => {
    const discount = parseFloat(coupon.title.match(/\d+/)?.[0] || '0');
    return Math.max(max, discount);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 grid md:grid-cols-3 gap-6 items-center">
        <div className="flex justify-center md:justify-start">
          <div className="relative w-40 h-40">
            <Image
              src={store.logo}
              alt={`${store.name} logo`}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{store.name}</h1>
          <div className="space-y-2">
            <p className="text-lg text-gray-700">
              <span className="font-semibold">Maior desconto:</span>{' '}
              <span className="text-green-700 font-bold">até {maxDiscount}% OFF</span>
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold">Cupons disponíveis:</span>{' '}
              <span className="font-bold">{coupons.length}</span>
            </p>
          </div>
        </div>

        <div className="text-center md:text-left space-y-4">
          <a
            href={coupons[0]?.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto text-center font-semibold"
          >
            Ir para a Loja
          </a>
          <div className="text-sm text-gray-700">
            <h3 className="font-bold mb-1">Como usar:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li key="step1">Copie o código do cupom</li>
              <li key="step2">Clique em "Ir para a Loja"</li>
              <li key="step3">Cole o código no checkout</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{coupon.title}</h3>
              <button
                onClick={() => handleCouponClick(coupon)}
                className="w-full relative group"
              >
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex-1 mr-4">
                    <div className="font-mono bg-white rounded px-3 py-2 border-dashed border-2 border-gray-300 text-gray-700">
                      {coupon.code 
                        ? `${coupon.code.slice(0, -3)}***`
                        : 'ATIVAR DESCONTO'
                      }
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all font-medium">
                    Ver Cupom
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Store Description */}
      <div 
        className="mt-12 bg-white rounded-lg shadow-md p-6 prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: store.description }}
      />

      {/* Coupon Modal */}
      <CouponModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        coupon={selectedCoupon}
      />
    </div>
  );
}
