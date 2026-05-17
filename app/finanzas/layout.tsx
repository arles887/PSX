import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centro de Finanzas | PSX',
  description: 'Gestiona tus ingresos, gastos y analiza el rendimiento financiero de tus proyectos AI con PSX.',
  openGraph: {
    title: 'Centro de Finanzas | PSX',
    description: 'Gestiona tus ingresos, gastos y analiza el rendimiento financiero de tus proyectos AI.',
    type: 'website',
    images: ['/psx-favicon.svg'],
  },
}

export default function FinanzasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
