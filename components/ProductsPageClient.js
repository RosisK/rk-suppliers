'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'

const CATEGORIES = ['All', 'Backpacks', 'Handbags', 'Tote Bags', 'Travel Bags', 'Wallets', 'Kids Bags']

export default function ProductsPageClient({ products, activeCategory }) {
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = normalizedSearch
    ? products.filter((product) => {
        return [product.name, product.description, product.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      })
    : products

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white gold-underline">
            Our Products
          </h1>
          <p className="text-cream-dark/70 mt-6 max-w-xl">
            Browse our full wholesale catalogue. All prices are per-unit at wholesale rate.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 border border-cream-dark bg-white px-4 py-2.5 rounded-sm text-navy placeholder-navy/40 focus:outline-none focus:border-gold"
          />
        </div>

        <nav aria-label="Product categories" className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((category) => {
            const href =
              category === 'All'
                ? '/products'
                : `/products?category=${encodeURIComponent(category)}`

            return (
              <Link
                key={category}
                href={href}
                aria-current={activeCategory === category ? 'page' : undefined}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors border ${
                  activeCategory === category
                    ? 'bg-navy text-gold border-navy'
                    : 'bg-white text-navy border-cream-dark hover:border-navy'
                }`}
              >
                {category}
              </Link>
            )
          })}
        </nav>

        {filteredProducts.length > 0 ? (
          <>
            <p className="text-navy/50 text-sm mb-4">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <span className="text-6xl block mb-4">🔎</span>
            <p className="text-navy/60 text-lg font-medium">No products found</p>
            <p className="text-navy/40 text-sm mt-2">
              Try a different category or search term
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
