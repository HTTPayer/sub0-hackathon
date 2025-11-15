'use client'

import React from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-pink-400 transition cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base sm:text-lg mb-1">{product.name}</h4>
          <p className="text-xs sm:text-sm text-gray-500">by {product.provider}</p>
        </div>
        <Lock size={16} className="text-green-600 flex-shrink-0 ml-2" />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

      {/* Features */}
      <div className="flex flex-wrap gap-1 mb-3">
        {product.features.map((feature) => (
          <span key={feature} className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded text-xs">
            {feature}
          </span>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-xs sm:text-sm font-medium text-gray-900">{product.estimate}</p>
        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
          <span>↑ {product.uptime}</span>
          <span>• {product.users}</span>
        </div>
      </div>
      <button
        onClick={() => onSelect(product)}
        className="w-full bg-gray-900 text-white py-2 rounded font-medium hover:bg-gray-800 transition flex items-center justify-center text-sm"
      >
        View Details <ArrowRight size={14} className="ml-2" />
      </button>
    </div>
  )
}
