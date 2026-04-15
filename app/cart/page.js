'use client'
// app/cart/page.js - Shopping Cart Page
// Shows everything the customer has added, lets them adjust quantities,
// and has a "Proceed to Checkout" button.

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cartContext'
import { getImageUrl } from '@/lib/pocketbase'

export default function CartPage() {
  const { cart, removeFromCart, updateQty, totalItems, totalPrice, clearCart } = useCart()

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <span className="text-7xl block mb-6">🛒</span>
          <h1 className="font-display text-3xl font-bold text-navy mb-3">Your cart is empty</h1>
          <p className="text-navy/60 mb-8">Add some products to get started.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-navy py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white gold-underline">Your Cart</h1>
          <p className="text-cream-dark/70 mt-6">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items List (left/main column) ───────────── */}
          <div className="lg:col-span-2 space-y-4">

            {cart.map((item) => {
              const imageUrl = item.image ? getImageUrl(item, item.image) : null
              const minOrder = item.min_order ? parseInt(item.min_order) : 1

              return (
                <div key={item.id} className="bg-white rounded-sm shadow-sm p-4 flex gap-4 items-start">

                  {/* Product thumbnail */}
                  <div className="relative w-20 h-20 bg-cream rounded-sm overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">👜</div>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-navy leading-tight">{item.name}</h3>
                        {item.category && (
                          <span className="text-xs text-navy/40">{item.category}</span>
                        )}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 text-sm"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-gold font-bold mt-1">
                      Rs. {Number(item.price).toLocaleString()} / pc
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          disabled={item.qty <= minOrder}
                          className="w-7 h-7 border border-cream-dark rounded-sm text-navy font-bold hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.qty}
                          min={minOrder}
                          onChange={(e) => updateQty(item.id, e.target.value)}
                          className="w-14 text-center border border-cream-dark rounded-sm py-1 text-navy text-sm font-semibold focus:outline-none focus:border-gold"
                        />
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-7 h-7 border border-cream-dark rounded-sm text-navy font-bold hover:border-navy transition-colors text-sm"
                        >
                          +
                        </button>
                        <span className="text-xs text-navy/40">pcs</span>
                      </div>

                      {/* Line total */}
                      <p className="font-bold text-navy">
                        Rs. {(Number(item.price) * item.qty).toLocaleString()}
                      </p>
                    </div>

                    {item.min_order && (
                      <p className="text-xs text-navy/30 mt-1">Min. order: {item.min_order} pcs</p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Clear cart link */}
            <div className="text-right">
              <button
                onClick={() => {
                  if (confirm('Clear your entire cart?')) clearCart()
                }}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* ── Order Summary (right column) ─────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-sm p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-navy mb-5">Order Summary</h2>

              {/* Item breakdown */}
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-navy/60 truncate mr-2">
                      {item.name} × {item.qty}
                    </span>
                    <span className="text-navy font-medium flex-shrink-0">
                      Rs. {(Number(item.price) * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-cream-dark pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-navy">Total</span>
                  <span className="font-display text-2xl font-bold text-gold">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-navy/40 mt-1">
                  {totalItems} piece{totalItems !== 1 ? 's' : ''} total
                </p>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center block py-4">
                Proceed to Checkout →
              </Link>

              <Link href="/products" className="block text-center text-navy/50 text-sm mt-4 hover:text-gold transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
