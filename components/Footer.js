// components/Footer.js
// The footer shown at the bottom of every page.

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy text-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
                <span className="text-navy font-display font-bold text-sm">RK</span>
              </div>
              <div>
                <span className="text-white font-display font-semibold text-lg">RK Suppliers</span>
                <p className="text-gold text-xs leading-none">Bag Wholesale</p>
              </div>
            </div>
            <p className="text-sm text-cream-dark/70 leading-relaxed">
              Your trusted partner for quality wholesale bags. Serving retailers, resellers, and businesses across the region.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 gold-underline">Quick Links</h3>
            <ul className="space-y-2 mt-6">
              {[
                { href: '/', label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/admin', label: 'Admin' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-dark/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 gold-underline">Contact Us</h3>
            <ul className="space-y-3 mt-6">
              <li className="flex items-start gap-3 text-sm text-cream-dark/70">
                <span className="text-gold mt-0.5">📍</span>
                <span>Damak, Nepal</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-cream-dark/70">
                <span className="text-gold mt-0.5">📞</span>
                <a href="tel:+977-9801558719" className="hover:text-gold transition-colors">
                  +977-9801558719
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-cream-dark/70">
                <span className="text-gold mt-0.5">✉️</span>
                <a href="mailto:aebbishnu@gmail.com" className="hover:text-gold transition-colors">
                  aebbishnu@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-cream-dark/70">
                <span className="text-gold mt-0.5">🕐</span>
                <span>Sat-Thu: 9am - 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-lighter mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-cream-dark/40">
            © {new Date().getFullYear()} RK Suppliers. All rights reserved.
          </p>
          <p className="text-xs text-cream-dark/40">
            Wholesale Bags · Bulk Orders Welcome
          </p>
        </div>
      </div>
    </footer>
  )
}
