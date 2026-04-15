import ProductsPageClient from '@/components/ProductsPageClient'
import { getProducts } from '@/lib/supabase'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

function normalizeCategory(value) {
  if (!value) return 'All'
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const activeCategory = normalizeCategory(params?.category)
  const isAllProducts = activeCategory === 'All'
  const title = isAllProducts ? 'Wholesale Product Catalogue' : `${activeCategory} Wholesale Bags`
  const description = isAllProducts
    ? 'Browse the RK Suppliers wholesale catalogue of backpacks, handbags, tote bags, travel bags, wallets, and kids bags.'
    : `Browse wholesale ${activeCategory.toLowerCase()} from RK Suppliers with bulk pricing and minimum order details.`
  const path = isAllProducts
    ? '/products'
    : `/products?category=${encodeURIComponent(activeCategory)}`

  return createPageMetadata({
    title,
    description,
    path,
    keywords: ['wholesale bags', activeCategory.toLowerCase(), 'bag catalogue'],
  })
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams
  const activeCategory = normalizeCategory(params?.category)
  const categoryFilter = activeCategory === 'All' ? '' : activeCategory

  let products = []

  try {
    products = await getProducts(categoryFilter)
  } catch (err) {
    console.error('Error loading products:', err)
  }

  return <ProductsPageClient products={products} activeCategory={activeCategory} />
}
