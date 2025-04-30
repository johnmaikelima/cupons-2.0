'use client';

import Image from 'next/image';

interface CouponCardProps {
  coupon: {
    _id: string;
    title: string;
    description: string;
    expiryDate: string;
    type: 'percentage' | 'fixed' | 'freeShipping';
    image?: string;
    affiliateLink: string;
    store: {
      name: string;
      logo: string;
    };
  };
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const handleCouponClick = () => {
    window.open(coupon.affiliateLink, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start space-x-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={coupon.store.logo}
            alt={coupon.store.name}
            fill
            className="object-contain"
          />
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {coupon.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {coupon.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">
                Válido até: {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}
              </span>
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {coupon.type === 'percentage' && 'Porcentagem'}
                {coupon.type === 'fixed' && 'Valor Fixo'}
                {coupon.type === 'freeShipping' && 'Frete Grátis'}
              </span>
            </div>
            
            <button
              onClick={handleCouponClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver Cupom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
