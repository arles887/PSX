import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PSX Pricing - Pro y Premium',
  description: 'Elige el plan PSX para acceder a suscripciones Pro y Premium con AI ilimitada, recursos y soporte prioritario.',
  openGraph: {
    title: 'PSX Pricing - Pro y Premium',
    description: 'Elige el plan PSX para acceder a suscripciones Pro y Premium con AI ilimitada, recursos y soporte prioritario.',
    type: 'website',
    images: ['/psx-favicon.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PSX Pricing - Pro y Premium',
    description: 'Elige el plan PSX para acceder a suscripciones Pro y Premium con AI ilimitada.',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
