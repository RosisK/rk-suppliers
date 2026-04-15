'use client'
// app/products/page.js - The Products Catalogue Page
// Shows all products with a category filter and search.

import { use } from 'react'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/lib/pocketbase'

// These match the categories on the home page
const CATEGORIES = ['All', 'Backpacks', 'Handbags', 'Tote Bags', 'Travel Bags', 'Wallets', 'Kids Bags']

export default function ProductsPage({ searchParams }) {
  const params = use(searchParams)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Read category from URL (e.g. /products?category=Backpacks)
  const [activeCategory, setActiveCategory] = useState(
    params.category || 'All'
  )

  // Load products when category changes
  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const cat = activeCategory === 'All' ? '' : activeCategory
        const data = await getProducts(cat)
        setProducts(data)
      } catch (err) {
        console.error('Error loading products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [activeCategory])

  // Filter products by search term (client-side, simple)
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-cream">

      {/* Page Header */}
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

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 border border-cream-dark bg-white px-4 py-2.5 rounded-sm text-navy placeholder-navy/40 focus:outline-none focus:border-gold"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors border ${
                activeCategory === cat
                  ? 'bg-navy text-gold border-navy'
                  : 'bg-white text-navy border-cream-dark hover:border-navy'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-cream-dark/30 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
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
            <span className="text-6xl block mb-4">🔍</span>
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
