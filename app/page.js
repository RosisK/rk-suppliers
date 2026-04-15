import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/lib/supabase'
import { absoluteUrl, createPageMetadata, siteConfig } from '@/lib/seo'

const CATEGORIES = [
  { name: 'Backpacks', emoji: '🎒', desc: 'School, travel and laptop bags' },
  { name: 'Handbags', emoji: '👜', desc: 'Ladies fashion and everyday bags' },
  { name: 'Tote Bags', emoji: '🛍️', desc: 'Canvas and shopping totes' },
  { name: 'Travel Bags', emoji: '🧳', desc: 'Duffel, trolley and luggage' },
  { name: 'Wallets', emoji: '👛', desc: 'Slim, bifold and card holders' },
  { name: 'Kids Bags', emoji: '🎒', desc: 'Colourful and fun kids range' },
]

const STATS = [
  { value: '5+', label: 'Years in Business' },
  { value: '500+', label: 'Products' },
  { value: '1000+', label: 'Happy Clients' },
  { value: '50+', label: 'Bag Categories' },
]

export const revalidate = 1800

export const metadata = createPageMetadata({
  title: 'Wholesale Bags in Nepal',
  description:
    'Buy backpacks, handbags, tote bags, travel bags, wallets, and kids bags at wholesale prices from RK Suppliers.',
  path: '/',
  keywords: [
    'wholesale bags nepal',
    'bag supplier nepal',
    'backpack wholesaler',
    'handbag wholesale',
    'bulk bag supplier',
  ],
})

export default async function HomePage() {
  let featuredProducts = []

  try {
    const products = await getProducts()
    featuredProducts = products.slice(0, 6)
  } catch (err) {
    console.error('Could not load products:', err)
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    description: siteConfig.description,
  }

  const itemListSchema =
    featuredProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: featuredProducts.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/products/${product.id}`),
            name: product.name,
          })),
        }
      : null

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema),
          }}
        />
      )}

      <section className="bg-navy min-h-[90vh] flex items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #c9a96e 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #c9a96e 0%, transparent 50%)`,
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              Nepal&apos;s Trusted Bag Wholesaler
            </div>

            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Quality Bags, <span className="text-gold">Wholesale</span> Prices
            </h1>

            <p className="text-cream-dark/70 text-lg leading-relaxed mb-10">
              From backpacks to handbags, we supply bulk orders to retailers,
              resellers, and businesses across Nepal. Get the best prices on
              premium quality bags.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary text-center text-base py-4 px-8">
                Browse Products
              </Link>
              <Link href="/contact" className="btn-outline text-center text-base py-4 px-8">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-navy/20">
            {STATS.map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center">
                <p className="font-display text-3xl font-bold text-navy">{stat.value}</p>
                <p className="text-navy/70 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy gold-underline-center">
              Shop by Category
            </h2>
            <p className="text-navy/60 mt-6 max-w-xl mx-auto">
              We stock a wide range of bag types to suit every retail need.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-sm p-6 shadow-sm hover:shadow-md hover:border-gold border border-transparent transition-all duration-200"
              >
                <span className="text-4xl block mb-3">{cat.emoji}</span>
                <h3 className="font-semibold text-navy group-hover:text-gold transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-navy/50 mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy gold-underline">
                Featured Products
              </h2>
              <p className="text-navy/60 mt-6">Our most popular wholesale items</p>
            </div>
            <Link
              href="/products"
              className="text-gold hover:text-gold-dark font-medium text-sm hidden sm:block"
            >
              View All -&gt;
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-cream rounded-sm">
              <span className="text-6xl block mb-4">👜</span>
              <p className="text-navy/60 text-lg font-medium">No products yet</p>
              <p className="text-navy/40 text-sm mt-2">
                Add products in the <Link href="/admin" className="text-gold underline">Admin panel</Link>
              </p>
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link href="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white gold-underline-center">
              Why Choose RK Suppliers?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: 'Quality',
                title: 'Quality Guaranteed',
                desc: 'Every bag goes through quality checks before shipment. We only supply products we would use ourselves.',
              },
              {
                icon: 'Bulk',
                title: 'Bulk Order Ready',
                desc: 'Low minimum order quantities with flexible bulk pricing. The more you buy, the better the price.',
              },
              {
                icon: 'Fast',
                title: 'Fast Delivery',
                desc: 'Quick dispatch. We understand your business depends on timely delivery.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center px-4">
                <span className="text-lg font-semibold text-gold block mb-5">{item.icon}</span>
                <h3 className="font-display text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-cream-dark/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gold">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
            Ready to Place a Wholesale Order?
          </h2>
          <p className="text-navy/70 text-lg mb-8">
            Contact us today for pricing, samples, and bulk order details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-navy text-white font-semibold px-8 py-4 rounded-sm hover:bg-navy-light transition-colors">
              Contact Us Now
            </Link>
            <Link href="/products" className="border-2 border-navy text-navy font-semibold px-8 py-4 rounded-sm hover:bg-navy hover:text-white transition-colors">
              Browse Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
