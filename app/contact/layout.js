import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Contact RK Suppliers',
  description:
    'Contact RK Suppliers for wholesale bag pricing, samples, bulk orders, and product availability.',
  path: '/contact',
})

export default function ContactLayout({ children }) {
  return children
}
