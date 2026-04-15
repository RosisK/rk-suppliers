'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cartContext'

export default function ProductPurchasePanel({ product }) {
  const { addToCart } = useCart()
  const minOrder = product.min_order ? parseInt(product.min_order, 10) : 1
  const [qty, setQty] = useState(minOrder)
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col justify-center">
      {product.category && (
        <span className="text-xs font-medium text-gold uppercase tracking-widest mb-3">
          {product.category}
        </span>
      )}

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
        {product.name}
      </h1>

      {product.description && (
        <p className="text-navy/60 leading-relaxed mb-6">{product.description}</p>
      )}

      <div className="bg-cream p-5 rounded-sm mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-navy/60 text-sm">Wholesale Price (per piece)</span>
          <span className="font-display text-2xl font-bold text-gold">
            Rs. {Number(product.price).toLocaleString()}
          </span>
        </div>
        {product.min_order && (
          <div className="flex justify-between items-center border-t border-cream-dark pt-3">
            <span className="text-navy/60 text-sm">Minimum Order</span>
            <span className="font-semibold text-navy">{product.min_order} pieces</span>
          </div>
        )}
        {product.stock !== undefined && product.stock !== '' && (
          <div className="flex justify-between items-center border-t border-cream-dark pt-3">
            <span className="text-navy/60 text-sm">Stock</span>
            <span
              className={`font-semibold text-sm px-2 py-1 rounded-full ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-navy mb-2">
          Quantity (pieces)
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((value) => Math.max(minOrder, value - 1))}
            className="w-10 h-10 border border-cream-dark rounded-sm text-navy font-bold hover:border-navy transition-colors text-lg"
          >
            -
          </button>
          <input
            type="number"
            value={qty}
            min={minOrder}
            onChange={(e) => {
              const nextQty = parseInt(e.target.value, 10)
              if (!Number.isNaN(nextQty) && nextQty >= minOrder) {
                setQty(nextQty)
              }
            }}
            className="w-20 text-center border border-cream-dark rounded-sm py-2 text-navy font-semibold focus:outline-none focus:border-gold"
          />
          <button
            onClick={() => setQty((value) => value + 1)}
            className="w-10 h-10 border border-cream-dark rounded-sm text-navy font-bold hover:border-navy transition-colors text-lg"
          >
            +
          </button>
        </div>
        {product.min_order && (
          <p className="text-xs text-navy/40 mt-1.5">Minimum order: {product.min_order} pieces</p>
        )}
      </div>

      <div className="bg-gold/10 border border-gold/30 rounded-sm px-4 py-3 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-navy/70 text-sm">Order Total ({qty} pcs)</span>
          <span className="font-bold text-navy text-lg">
            Rs. {(Number(product.price) * qty).toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className={`w-full py-4 text-base font-semibold rounded-sm transition-all duration-200 ${
          added ? 'bg-green-500 text-white' : 'bg-gold text-navy hover:bg-gold-light'
        }`}
      >
        {added ? 'Added to cart!' : 'Add to Cart'}
      </button>

      <Link href="/cart" className="text-center text-gold text-sm mt-3 hover:underline block">
        View Cart -&gt;
      </Link>

      <Link href="/products" className="text-center text-navy/40 text-sm mt-2 hover:text-gold block">
        {'<-'} Back to All Products
      </Link>
    </div>
  )
}
