'use client'
// components/ProductCard.js
// Updated with an "Add to Cart" button.

import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl } from '@/lib/pocketbase'
import { useCart } from '@/lib/cartContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const imageUrl = product.image ? getImageUrl(product, product.image) : null
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleAddToCart(e) {
    // Stop the click from also navigating to the product page
    e.preventDefault()
    e.stopPropagation()
    // Add the minimum order qty (or 1 if not set)
    const qty = product.min_order ? parseInt(product.min_order) : 1
    addToCart(product, qty)
    // Show a brief "Added!" confirmation
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="card overflow-hidden">
        {/* Product Image */}
        <div className="relative w-full h-52 bg-cream overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="eager"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream-dark/30">
              <span className="text-5xl opacity-30">👜</span>
            </div>
          )}
          {product.category && (
            <span className="absolute top-3 left-3 bg-navy text-gold text-xs font-medium px-2 py-1 rounded-sm">
              {product.category}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-navy text-lg leading-tight group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-navy/60 mt-1 line-clamp-2">
            {product.description || 'Quality wholesale bag'}
          </p>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-navy/40 uppercase tracking-wide">Wholesale Price</p>
              <p className="text-xl font-bold text-gold">
                Rs. {Number(product.price).toLocaleString()}
              </p>
            </div>
            {product.min_order && (
              <p className="text-xs text-navy/50 bg-cream px-2 py-1 rounded-sm">
                Min: {product.min_order} pcs
              </p>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className={`w-full mt-3 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-navy text-gold hover:bg-navy-light'
            }`}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
