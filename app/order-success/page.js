
import Link from 'next/link'

export default function OrderSuccessPage({ searchParams }) {
  // const searchParams = useSearchParams()
  const orderId = searchParams.id

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-3">
          Order Placed!
        </h1>

        <p className="text-navy/60 text-lg mb-2">
          Thank you for your order with RK Suppliers.
        </p>

        {orderId && (
          <p className="text-sm text-navy/40 mb-6">
            Order ID: <span className="font-mono text-navy/60">{orderId}</span>
          </p>
        )}

        <div className="bg-white rounded-sm shadow-sm p-6 text-left mb-8">
          <h2 className="font-semibold text-navy mb-4">What happens next?</h2>
          <ol className="space-y-3">
            {[
              { step: '1', text: 'We review your order and confirm stock availability.' },
              { step: '2', text: 'Our team will call you on the phone number you provided.' },
              { step: '3', text: 'Payment is confirmed and your order is packed.' },
              { step: '4', text: 'Your bags are delivered to your address.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-3 text-sm text-navy/70">
                <span className="w-6 h-6 bg-gold text-navy rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  {item.step}
                </span>
                {item.text}
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-gold/10 border border-gold/30 rounded-sm p-4 mb-8 text-sm text-navy/70">
          Questions? Call us at{' '}
          <a href="tel:+977-9801558719" className="text-gold font-semibold hover:underline">
            +977-9801558719
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}