import { createNoIndexMetadata } from '@/lib/seo'

export const metadata = createNoIndexMetadata({
  title: 'Admin Dashboard',
  description: 'Private RK Suppliers administration area.',
  path: '/admin',
})

export default function AdminLayout({ children }) {
  return children
}
