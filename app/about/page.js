// app/about/page.js - The About Us Page

import Link from 'next/link'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'About RK Suppliers',
  description:
    'Learn about RK Suppliers, our wholesale bag business, and how we serve retailers and resellers across Nepal.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-navy py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white gold-underline">About Us</h1>
          <p className="text-cream-dark/70 mt-6 max-w-xl">
            Learn about RK Suppliers and our commitment to quality wholesale bags.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <h2 className="font-display text-3xl font-bold text-navy mb-6 gold-underline">
                Our Story
              </h2>
              <div className="space-y-4 text-navy/70 leading-relaxed mt-8">
                <p>
                  Founded over a half a decade ago, RK Suppliers started as a small family business with
                  one simple goal: to make quality bags accessible to retailers across Nepal at
                  the best wholesale prices.
                </p>
                <p>
                  Over the years, we've grown into one of the region's most trusted bag wholesalers,
                  supplying hundreds of retailers, market vendors, and online resellers with a
                  wide range of bags - from everyday backpacks to premium handbags.
                </p>
                <p>
                  We believe that every business owner deserves access to quality products at
                  fair prices. That's why we work directly with manufacturers to cut out the
                  middlemen and pass the savings on to you.
                </p>
              </div>

              <Link href="/contact" className="btn-primary mt-8 inline-block">
                Get in Touch
              </Link>
            </div>

            {/* Visual Placeholder / Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '2020', label: 'Est. Year', bg: 'bg-navy', text: 'text-gold' },
                { value: '1000+', label: 'Clients Served', bg: 'bg-gold', text: 'text-navy' },
                { value: '500+', label: 'Products in Stock', bg: 'bg-gold', text: 'text-navy' },
                { value: '6+', label: 'Years of Trust', bg: 'bg-navy', text: 'text-gold' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${item.bg} rounded-sm p-8 flex flex-col items-center justify-center aspect-square`}
                >
                  <p className={`font-display text-4xl font-bold ${item.text}`}>{item.value}</p>
                  <p className={`text-sm mt-2 ${item.text} opacity-70 text-center`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-navy text-center gold-underline-center mb-16">
            Our Values
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤝', title: 'Trustworthy', desc: 'We build long-term relationships with our clients through honesty and transparency.' },
              { icon: '✅', title: 'Quality First', desc: 'Every product is inspected before dispatch. No compromises on quality.' },
              { icon: '💰', title: 'Fair Pricing', desc: 'Direct from manufacturers to you - no unnecessary markups.' },
              { icon: '⚡', title: 'Fast Service', desc: 'Quick order processing and reliable delivery.' },
            ].map((val) => (
              <div key={val.title} className="bg-cream rounded-sm p-6 text-center">
                <span className="text-4xl block mb-4">{val.icon}</span>
                <h3 className="font-semibold text-navy text-lg mb-2">{val.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-navy mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-navy/70 mb-8">
            Let's talk about your wholesale needs. We're happy to discuss pricing, samples, and bulk orders.
          </p>
          <Link href="/contact" className="bg-navy text-white font-semibold px-8 py-4 rounded-sm hover:bg-navy-light transition-colors inline-block">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
