import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Order Success',
  description: 'Private order confirmation page for RK Suppliers.',
  path: '/order-success',
})

export default function OrderSuccessLayout({ children }) {
  return children
}
