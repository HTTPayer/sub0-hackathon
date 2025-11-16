'use client'

import React from 'react'
import ProductCard from './ProductCard'
import { Product } from '@/types'

interface MarketplaceViewProps {
  products: Product[]
  onProductSelect: (product: Product) => void
}

export default function MarketplaceView({ products, onProductSelect }: MarketplaceViewProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-center">
       Arkivolts
        </h3>
        <p className="text-sm sm:text-base text-gray-600 text-center">
          Arkiv Functions paid with HTTPayer
        </p>
      </div>
      <div
        className={
          products.length === 1
            ? 'flex justify-center gap-4 sm:gap-6'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={onProductSelect} />
        ))}
      </div>
    </div>
  )
}
