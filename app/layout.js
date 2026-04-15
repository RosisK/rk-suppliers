// app/layout.js
// This is the root layout - it wraps every page on the site.
// Navbar and Footer live here so they appear on all pages.

import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/lib/cartContext'

export const metadata = {
  title: 'RK Suppliers - Bag Wholesale',
  description: 'Premium quality bags at wholesale prices. Backpacks, totes, handbags, and more. Serving retailers across the region.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
