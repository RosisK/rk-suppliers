import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductPurchasePanel from '@/components/ProductPurchasePanel'
import { getProduct, getImageUrl } from '@/lib/supabase'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function loadProduct(id) {
  try {
    return await getProduct(id)
  } catch (err) {
    return null
  }
}

function getAvailability(product) {
  if (product.stock === undefined || product.stock === '') {
    return 'https://schema.org/InStock'
  }

  return Number(product.stock) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const product = await loadProduct(resolvedParams.id)

  if (!product) {
    return createPageMetadata({
      title: 'Product Not Found',
      description: 'The requested RK Suppliers product could not be found.',
      path: `/products/${resolvedParams.id}`,
      noIndex: true,
    })
  }

  const imageUrl = getImageUrl(product)
  const description =
    product.description ||
    `Order ${product.name} in bulk from RK Suppliers with wholesale pricing and minimum order details.`

  return createPageMetadata({
    title: product.name,
    description,
    path: `/products/${product.id}`,
    type: 'website',
    keywords: [product.name, product.category, 'wholesale bags'].filter(Boolean),
    images: imageUrl
      ? [
          {
            url: imageUrl,
            alt: product.name,
          },
        ]
      : undefined,
  })
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params
  const product = await loadProduct(resolvedParams.id)

  if (!product) {
    notFound()
  }

  const imageUrl = getImageUrl(product)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Wholesale ${product.name} from RK Suppliers.`,
    category: product.category,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: Number(product.price),
      url: absoluteUrl(`/products/${product.id}`),
      availability: getAvailability(product),
      seller: {
        '@type': 'Organization',
        name: 'RK Suppliers',
      },
    },
  }

  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-sm text-navy/50 mb-8 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span>{'>'}</span>
          <Link href="/products" className="hover:text-gold">Products</Link>
          <span>{'>'}</span>
          <span className="text-navy">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-sm shadow-sm p-6 sm:p-10">
          <div className="relative w-full h-80 sm:h-96 bg-cream rounded-sm overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">👜</span>
              </div>
            )}
          </div>

          <ProductPurchasePanel product={product} />
        </div>
      </div>
    </div>
  )
}
