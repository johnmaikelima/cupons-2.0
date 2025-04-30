'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coupon: {
    title: string;
    code?: string;
    affiliateLink: string;
  } | null;
  codeAlreadyRevealed?: boolean;
}

export default function CouponModal({ isOpen, onClose, coupon, codeAlreadyRevealed = false }: Props) {
  const [codeRevealed, setCodeRevealed] = useState(codeAlreadyRevealed);

  // Atualiza o estado quando a prop muda
  useEffect(() => {
    setCodeRevealed(codeAlreadyRevealed);
  }, [codeAlreadyRevealed]);

  // Função para revelar o código
  const handleRevealCode = () => {
    if (!coupon?.affiliateLink) return;

    // Abre o link de afiliado em uma nova aba
    window.open(coupon.affiliateLink, '_blank');
    
    // Revela o código
    setCodeRevealed(true);
  };

  // Função para copiar o código
  const handleCopy = () => {
    if (!coupon?.code) return;

    const textArea = document.createElement('textarea');
    textArea.value = coupon.code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      alert(`Código copiado: ${coupon.code}`);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
      alert(`Não foi possível copiar o código. Por favor, copie manualmente: ${coupon.code}`);
    }

    document.body.removeChild(textArea);
    onClose();
  };

  // Se não houver cupom selecionado, não renderiza nada
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {coupon.title}
                </Dialog.Title>

                {coupon.code && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {codeRevealed 
                        ? 'Copie o código abaixo e use no checkout:'
                        : 'Clique no botão abaixo para revelar o código do cupom:'
                      }
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg border-2 border-dashed border-gray-300">
                      <code className="text-lg font-mono">
                        {codeRevealed ? coupon.code : '••••••••'}
                      </code>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  {!codeRevealed ? (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleRevealCode}
                    >
                      Revelar Código
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleCopy}
                    >
                      Copiar Código
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
