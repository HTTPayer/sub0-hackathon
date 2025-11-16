'use client'

import React, { useState } from 'react'
import { Lock, Copy, Check } from 'lucide-react'
import { Product } from '@/types'

interface ProductDetailProps {
  product: Product
  onBack: () => void
  onPaymentClick: () => void
}

export default function ProductDetail({ product, onBack, onPaymentClick }: ProductDetailProps) {
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(product.integration)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <button
        onClick={onBack}
        className="text-pink-600 hover:text-pink-700 mb-4 sm:mb-6 flex items-center text-sm sm:text-base"
      >
        ← Back to catalogue
      </button>

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4 sm:mb-6 flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h2>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Lock size={20} className="text-green-600" />
            <span className="text-xs sm:text-sm text-gray-600">x402 Protected</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{product.description}</p>

        {/* Features */}
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Key Features</h3>
          <div className="flex flex-wrap gap-2">
            {product.features.map((feature) => (
              <span key={feature} className="bg-pink-50 text-pink-700 px-3 py-1 rounded text-sm">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">Pricing</h3>
          <div className="space-y-2 mb-4">
            {product.pricing.write !== undefined && (
              <p className="text-xs sm:text-sm">• ${product.pricing.write} per write</p>
            )}
            {product.pricing.read !== undefined && (
              <p className="text-xs sm:text-sm">• ${product.pricing.read} per read</p>
            )}
            {product.pricing.base !== undefined && (
              <p className="text-xs sm:text-sm">
                • ${product.pricing.base}/mo base + ${product.pricing.perRun}/run
              </p>
            )}
            {product.pricing.perCall !== undefined && (
              <p className="text-xs sm:text-sm">• ${product.pricing.perCall} per API call</p>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-pink-600">→ {product.estimate}</p>
        </div>

        <button
          onClick={onPaymentClick}
          className="w-full bg-pink-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-pink-700 transition text-base sm:text-lg mb-6 sm:mb-8"
        >
          Pay with HTTPayer
        </button>

        <div className="border-t pt-4 sm:pt-6">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">Integration</h3>
          <div className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg relative overflow-x-auto">
            <pre className="text-xs sm:text-sm">
              <code>{product.integration}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-700 hover:bg-gray-600 p-2 rounded transition"
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
            <button className="text-xs sm:text-sm text-pink-600 hover:text-pink-700">Test in Playground</button>
            <button className="text-xs sm:text-sm text-pink-600 hover:text-pink-700">View Python</button>
            <button className="text-xs sm:text-sm text-pink-600 hover:text-pink-700">View cURL</button>
          </div>
        </div>
      </div>
    </div>
  )
}
