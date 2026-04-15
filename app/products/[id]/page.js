'use client'
// app/products/[id]/page.js - Single Product Detail Page
// Updated with quantity selector and Add to Cart button.

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProduct, getImageUrl } from '@/lib/pocketbase'
import { useCart } from '@/lib/cartContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { addToCart } = useCart()

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProduct(id)
        setProduct(data)
        // Default quantity to the minimum order amount
        if (data.min_order) setQty(parseInt(data.min_order))
      } catch (err) {
        setError('Product not found.')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  function handleAddToCart() {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy/60">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😕</span>
          <p className="text-navy font-semibold text-xl mb-2">Product Not Found</p>
          <Link href="/products" className="text-gold hover:underline">← Back to Products</Link>
        </div>
      </div>
    )
  }

  const imageUrl = product.image ? getImageUrl(product, product.image) : null
  const minOrder = product.min_order ? parseInt(product.min_order) : 1

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-navy/50 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-gold">Products</Link>
          <span>›</span>
          <span className="text-navy">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-sm shadow-sm p-6 sm:p-10">

          {/* Product Image */}
          <div className="relative w-full h-80 sm:h-96 bg-cream rounded-sm overflow-hidden">
            {imageUrl ? (
              <Image src={imageUrl} alt={product.name} fill loading="eager" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">👜</span>
              </div>
            )}
          </div>

          {/* Product Details */}
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

            {/* Pricing info */}
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
                  <span className={`font-semibold text-sm px-2 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-navy mb-2">
                Quantity (pieces)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(minOrder, q - 1))}
                  className="w-10 h-10 border border-cream-dark rounded-sm text-navy font-bold hover:border-navy transition-colors text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  min={minOrder}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val) && val >= minOrder) setQty(val)
                  }}
                  className="w-20 text-center border border-cream-dark rounded-sm py-2 text-navy font-semibold focus:outline-none focus:border-gold"
                />
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 border border-cream-dark rounded-sm text-navy font-bold hover:border-navy transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {product.min_order && (
                <p className="text-xs text-navy/40 mt-1.5">Minimum order: {product.min_order} pieces</p>
              )}
            </div>

            {/* Order total preview */}
            <div className="bg-gold/10 border border-gold/30 rounded-sm px-4 py-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-navy/70 text-sm">Order Total ({qty} pcs)</span>
                <span className="font-bold text-navy text-lg">
                  Rs. {(Number(product.price) * qty).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 text-base font-semibold rounded-sm transition-all duration-200 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-gold text-navy hover:bg-gold-light'
              }`}
            >
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>

            <Link href="/cart" className="text-center text-gold text-sm mt-3 hover:underline block">
              View Cart →
            </Link>

            <Link href="/products" className="text-center text-navy/40 text-sm mt-2 hover:text-gold block">
              ← Back to All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
