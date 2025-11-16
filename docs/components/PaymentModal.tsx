'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Product } from '@/types'

interface PaymentModalProps {
  product: Product | null
  onClose: () => void
}

export default function PaymentModal({ product, onClose }: PaymentModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!product) return null

  return (
    // Overlay: visually blurred and semi-transparent
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 pointer-events-none">
      {/* Modal container: re-enable pointer events for the modal itself */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="bg-white rounded-lg p-6 max-w-md w-full pointer-events-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="payment-modal-title" className="text-xl font-semibold">Pay with HTTPayer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">Authorizing purchase for:</p>
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm text-gray-500">{product.provider}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="spend-limit" className="block text-sm font-medium text-gray-700">
              Spend Limit (USDC)
            </label>
            <input
              id="spend-limit"
              type="number"
              defaultValue={50}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-xs text-gray-500">Agent can spend up to this amount via x402</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Grant access to:</p>
            <div className="flex items-center">
              <input type="checkbox" id="memory" className="mr-2" defaultChecked />
              <label htmlFor="memory" className="text-sm">
                Memory Bucket API
              </label>
            </div>
          </div>

          <button className="w-full bg-pink-600 text-white py-3 rounded font-semibold hover:bg-pink-700 transition">
            Authorize & Generate Token
          </button>

          <p className="text-xs text-gray-500 text-center">
            Session expires in 24h or when spend limit is reached. Payments processed via HTTPayer in USDC.
          </p>
        </div>
      </div>
    </div>
  )
}
