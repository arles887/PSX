import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | PSX',
  description: 'Noticias, tutoriales y tendencias sobre inteligencia artificial y herramientas de productividad.',
  openGraph: {
    title: 'Blog | PSX',
    description: 'Noticias, tutoriales y tendencias sobre inteligencia artificial y herramientas de productividad.',
    type: 'website',
    images: ['/psx-favicon.svg'],
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
