'use client'

import React from 'react'
import { Category } from '@/types'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-pink-400 cursor-pointer transition">
      <Icon className="mb-3 text-pink-600" size={32} />
      <h3 className="font-semibold mb-1 text-sm sm:text-base">{category.name}</h3>
      <p className="text-xs sm:text-sm text-gray-500">{category.count} capabilities</p>
    </div>
  )
}
