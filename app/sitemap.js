import { getProducts } from '@/lib/supabase'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap() {
  const now = new Date()
  const staticRoutes = ['/', '/products', '/about', '/contact'].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }))

  try {
    const products = await getProducts()

    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: absoluteUrl(`/products/${product.id}`),
        lastModified: product.updated ? new Date(product.updated) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })),
    ]
  } catch (err) {
    return staticRoutes
  }
}
