import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Cart',
  description: 'Customer cart page for RK Suppliers.',
  path: '/cart',
})

export default function CartLayout({ children }) {
  return children
}
