'use client';

import { useState } from 'react';
import CouponModal from './CouponModal';
import { FiExternalLink, FiCheckCircle } from 'react-icons/fi';

interface CouponCardProps {
  coupon: {
    _id: string;
    title: string;
    description: string;
    code?: string;
    type: 'percentage' | 'fixed' | 'freeShipping';
    expiryDate: string;
    affiliateLink: string;
    store: {
      name: string;
      logo: string;
    };
  };
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isUrlCoupon = coupon.code === 'URL CUPONADA';

  const handleCouponClick = () => {
    if (isUrlCoupon) {
      window.open(coupon.affiliateLink, '_blank');
      return;
    }

    // Primeiro abre o link em uma nova aba
    window.open(coupon.affiliateLink, '_blank');
    // Depois abre o modal
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{coupon.title}</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {isUrlCoupon ? (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                <button
                  onClick={handleCouponClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg 
                  transition-colors duration-200 flex items-center justify-center gap-2 min-w-[160px]"
                >
                  <FiExternalLink className="w-5 h-5" />
                  Resgatar oferta
                </button>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  Você não precisa copiar o código desse cupom, basta clicar em "Resgatar Oferta" que o cupom será aplicado automaticamente.
                </p>
              </div>
            ) : (
              <button
                onClick={handleCouponClick}
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
            )}
          </div>
        </div>
      </div>

      <CouponModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        coupon={coupon}
        codeAlreadyRevealed={true} // Indica que o link já foi aberto
      />
    </>
  );
}
