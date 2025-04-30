'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coupon: {
    code?: string;
    title: string;
    affiliateLink: string;
  } | null;
}

export default function CouponModal({ isOpen, onClose, coupon }: Props) {
  const [copied, setCopied] = useState(false);

  const handleAction = async () => {
    if (!coupon) return;

    if (coupon.code) {
      try {
        await navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => {
          window.open(coupon.affiliateLink, '_blank');
          onClose();
        }, 2000);
      } catch (err) {
        console.error('Erro ao copiar código:', err);
        window.open(coupon.affiliateLink, '_blank');
        onClose();
      }
    } else {
      window.open(coupon.affiliateLink, '_blank');
      onClose();
    }
  };

  if (!coupon) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-800 mb-4"
                >
                  {coupon.title}
                </Dialog.Title>

                <div className="mt-4">
                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <span className="font-mono text-lg font-semibold text-gray-800">
                        {coupon.code || 'ATIVAR DESCONTO'}
                      </span>
                      <button
                        onClick={handleAction}
                        className="ml-4 p-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
                      >
                        {copied ? (
                          <CheckIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <ClipboardIcon className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {copied ? (
                    <p className="text-sm font-medium text-green-600">
                      Código copiado! Redirecionando para a loja...
                    </p>
                  ) : coupon.code ? (
                    <p className="text-sm text-gray-700">
                      Clique no ícone para copiar o código e ser redirecionado para a loja
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      Clique no ícone para ativar o desconto na loja
                    </p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
