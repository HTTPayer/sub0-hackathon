'use client'

import React from 'react'
import CategoryCard from './CategoryCard'
import ProductCard from './ProductCard'
import { Category, Product } from '@/types'

interface MarketplaceViewProps {
  categories: Category[]
  products: Product[]
  onProductSelect: (product: Product) => void
}

export default function MarketplaceView({ categories, products, onProductSelect }: MarketplaceViewProps) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
        {categories.map((cat) => (
          <CategoryCard key={cat.name} category={cat} />
        ))}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Most Used Arkivendor Capabilities</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={onProductSelect} />
        ))}
      </div>
    </>
  )
}
