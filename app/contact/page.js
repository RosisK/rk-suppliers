'use client'
// app/contact/ContactClient.js - The Contact Page
// Has a contact form that saves messages to PocketBase.

import { use } from 'react'
import { useState } from 'react'
import { submitContact } from '@/lib/pocketbase'

export default function ContactPage({ searchParams }) {
  // const searchParams = useSearchParams()
  const params = use(searchParams)

  // Pre-fill message if coming from a product page
  const productName = params.product
  const defaultMessage = productName
    ? `Hi, I'm interested in ordering "${productName}" in bulk. Please share more details.`
    : ''

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage,
  })
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  // Update form fields as the user types
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Submit the form
  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')

    try {
      await submitContact(form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      console.error('Failed to submit:', err)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-navy py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white gold-underline">Contact Us</h1>
          <p className="text-cream-dark/70 mt-6 max-w-xl">
            Have a question or want to place an order? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-navy mb-8 gold-underline">
              Get in Touch
            </h2>

            <div className="space-y-6 mt-10">
              {[
                { icon: '📍', label: 'Address', value: 'Kathmandu, Nepal' },
                { icon: '📞', label: 'Phone', value: '+977-9801558719', href: 'tel:+977-9801558719' },
                { icon: '✉️', label: 'Email', value: 'info@rksuppliers.com', href: 'mailto:info@rksuppliers.com' },
                { icon: '🕐', label: 'Hours', value: 'Sunday - Friday: 9:00 AM - 6:00 PM' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span>{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-navy/50 text-xs uppercase tracking-wide mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-navy font-medium hover:text-gold transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-navy font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Note */}
            <div className="mt-10 bg-gold/10 border-l-4 border-gold p-5 rounded-sm">
              <p className="text-navy font-semibold mb-1">Bulk Orders & Samples</p>
              <p className="text-navy/60 text-sm">
                We welcome bulk orders of all sizes. For sample requests, please mention it in your message.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-sm shadow-sm p-8">
            <h2 className="font-display text-2xl font-bold text-navy mb-6">
              Send a Message
            </h2>

            {/* Success Message */}
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-sm mb-6 text-sm">
                ✅ Your message was sent! We'll get back to you soon.
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm mb-6 text-sm">
                ❌ Something went wrong. Please try again or call us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30
                             focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30
                             focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+977 98XXXXXXXX"
                  className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30
                             focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us what you're looking for, quantities needed, etc."
                  className="w-full border border-cream-dark px-4 py-2.5 rounded-sm text-navy placeholder-navy/30
                             focus:outline-none focus:border-gold transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-primary py-3.5 text-base disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
