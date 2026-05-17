import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursos Guardados | PSX',
  description: 'Gestiona tus recursos guardados, descargas y contenido premium en el panel de PSX.',
  openGraph: {
    title: 'Recursos Guardados | PSX',
    description: 'Gestiona tus recursos guardados y contenido premium con filtros avanzados y SEO optimizado.',
    type: 'website',
    images: ['/psx-favicon.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Guardados | PSX',
    description: 'Gestiona tus recursos guardados y contenido premium con filtros avanzados.',
  },
}

export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
