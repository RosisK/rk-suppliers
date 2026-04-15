'use client'
// app/checkout/page.js - Checkout Page
// Collects customer details and places the order into Supabase.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cartContext'
import { createOrder } from '@/lib/supabase'

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'esewa', label: 'eSewa', icon: '💚' },
  { value: 'khalti', label: 'Khalti', icon: '💜' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, totalPrice, totalItems, clearCart } = useCart()

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    address: '',
    city: '',
    payment_method: 'cod',
    notes: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Redirect to cart if they land here with an empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-navy font-semibold text-xl mb-3">Your cart is empty</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    )
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const order = await createOrder({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        address: `${form.address}, ${form.city}`,
        items: cart,
        total: totalPrice,
        payment_method: form.payment_method,
        notes: form.notes,
        status: 'pending',
      })

      clearCart()
      router.push(`/order-success?id=${order.id}`)
    } catch (err) {
      console.error('Order failed:', err)
      setStatus('error')
      setErrorMsg('Failed to place order. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-navy py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white gold-underline">Checkout</h1>
          <p className="text-cream-dark/70 mt-6">Fill in your details to complete the order</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Customer Details Form (left/main) ────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact Information */}
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-5">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="customer_name" value={form.customer_name}
                      onChange={handleChange} required
                      placeholder="Your full name"
                      className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel" name="customer_phone" value={form.customer_phone}
                      onChange={handleChange} required
                      placeholder="+977 98XXXXXXXX"
                      className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email" name="customer_email" value={form.customer_email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-5">
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="address" value={form.address}
                      onChange={handleChange} required
                      placeholder="Street, area, landmark"
                      className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="city" value={form.city}
                      onChange={handleChange} required
                      placeholder="e.g. Kathmandu, Pokhara"
                      className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-5">
                  Payment Method
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 rounded-sm border-2 cursor-pointer transition-colors ${
                        form.payment_method === method.value
                          ? 'border-gold bg-gold/5'
                          : 'border-cream-dark hover:border-navy/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={form.payment_method === method.value}
                        onChange={handleChange}
                        className="accent-gold"
                      />
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-sm font-medium text-navy">{method.label}</span>
                    </label>
                  ))}
                </div>

                {/* Bank transfer details shown conditionally */}
                {form.payment_method === 'bank_transfer' && (
                  <div className="mt-4 bg-cream p-4 rounded-sm text-sm text-navy/70">
                    <p className="font-semibold text-navy mb-1">Bank Details:</p>
                    <p>Bank: Himalayan Bank</p>
                    <p>Account Name: RK Suppliers</p>
                    <p>Account No: 0012345678901</p>
                    <p className="mt-2 text-xs text-navy/50">Please send payment screenshot via WhatsApp after ordering.</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-5">
                  Order Notes <span className="text-navy/30 font-normal text-base">(optional)</span>
                </h2>
                <textarea
                  name="notes" value={form.notes} onChange={handleChange}
                  rows={3}
                  placeholder="Any special instructions, preferred delivery time, etc."
                  className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30 focus:outline-none focus:border-gold resize-none"
                />
              </div>
            </div>

            {/* ── Order Summary (right column) ──────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-sm shadow-sm p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-navy mb-5">Your Order</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1 mr-2">
                        <p className="text-navy font-medium leading-tight">{item.name}</p>
                        <p className="text-navy/40 text-xs">{item.qty} pcs × Rs. {Number(item.price).toLocaleString()}</p>
                      </div>
                      <span className="text-navy font-semibold flex-shrink-0">
                        Rs. {(Number(item.price) * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-dark pt-4 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-navy/60 text-sm">Items ({totalItems} pcs)</span>
                    <span className="text-navy font-medium">Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-navy/60 text-sm">Delivery</span>
                    <span className="text-green-600 text-sm font-medium">Calculated on pickup</span>
                  </div>
                </div>

                <div className="border-t border-cream-dark pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-navy">Order Total</span>
                    <span className="font-display text-2xl font-bold text-gold">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Error message */}
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-sm mb-4">
                    {errorMsg}
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-primary py-4 text-base disabled:opacity-60"
                >
                  {status === 'loading' ? 'Placing Order...' : 'Place Order'}
                </button>

                <Link href="/cart" className="block text-center text-navy/50 text-sm mt-3 hover:text-gold transition-colors">
                  ← Back to Cart
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
