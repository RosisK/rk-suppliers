'use client'
// components/Navbar.js
// Updated with cart icon showing live item count.

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cartContext'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems } = useCart()

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
              <span className="text-navy font-display font-bold text-sm">RK</span>
            </div>
            <div>
              <span className="text-white font-display font-semibold text-lg">RK Suppliers</span>
              <p className="text-gold text-xs leading-none">Bag Wholesale</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-gold'
                    : 'text-cream-dark hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Cart Icon with badge */}
            <Link href="/cart" className="relative text-cream-dark hover:text-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <Link href="/contact" className="btn-primary text-sm py-2 px-4">
              Get a Quote
            </Link>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/cart" className="relative text-cream-dark">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="text-cream-dark p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-light border-t border-navy-lighter">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium py-2 transition-colors ${
                  pathname === link.href ? 'text-gold' : 'text-cream-dark hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="btn-primary text-sm py-2 block text-center mt-2"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
