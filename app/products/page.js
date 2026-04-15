import ProductsPageClient from '@/components/ProductsPageClient'
import { getProducts } from '@/lib/supabase'
import { createPageMetadata } from '@/lib/seo'

export const revalidate = 900

export const metadata = createPageMetadata({
  title: 'Wholesale Product Catalogue',
  description:
    'Browse the RK Suppliers wholesale catalogue of backpacks, handbags, tote bags, travel bags, wallets, and kids bags.',
  path: '/products',
  keywords: ['wholesale bags', 'bag catalogue', 'bag wholesaler nepal'],
})

export default async function ProductsPage() {

  let products = []

  try {
    products = await getProducts()
  } catch (err) {
    console.error('Error loading products:', err)
  }

  return <ProductsPageClient products={products} />
}
