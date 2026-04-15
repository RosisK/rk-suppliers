const DEFAULT_SITE_URL = 'http://localhost:3000'

function normalizeSiteUrl(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export const siteConfig = {
  name: 'RK Suppliers',
  title: 'Wholesale Bags in Nepal',
  description:
    'RK Suppliers supplies backpacks, handbags, tote bags, travel bags, wallets, and kids bags at wholesale prices across Nepal.',
  siteUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL
  ),
  phone: '+977-9801558719',
  email: 'info@rksuppliers.com',
}

export function absoluteUrl(path = '/') {
  return new URL(path, `${siteConfig.siteUrl}/`).toString()
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  keywords,
  noIndex = false,
  type = 'website',
  images,
}) {
  const canonical = absoluteUrl(path)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: 'en_US',
      type,
      images,
    },
    twitter: {
      card: images?.length ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images?.map((image) => image.url),
    },
  }
}

export function createNoIndexMetadata({ title, description, path }) {
  return createPageMetadata({
    title,
    description,
    path,
    noIndex: true,
  })
}
