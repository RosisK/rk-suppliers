import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Checkout',
  description: 'Private checkout page for RK Suppliers orders.',
  path: '/checkout',
})

export default function CheckoutLayout({ children }) {
  return children
}
