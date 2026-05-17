'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PSXLogo } from '@/components/psx-logo'
import { Sparkles, Crown, ShieldCheck } from 'lucide-react'

export const metadata = {
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

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    description: 'Suscripción mensual para creadores y equipos emergentes.',
    features: ['Hasta 50 resúmenes diarios', 'Acceso a herramientas PRO', 'Historial ilimitado', 'Soporte prioritario'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    description: 'Acceso completo a la plataforma, métricas avanzadas y mejores resultados AI.',
    features: ['Hasta 500 resúmenes diarios', 'Acceso total a funciones VIP', 'Dashboards avanzados', 'Portal de soporte VIP'],
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handlePurchase = async (planId: string) => {
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    const json = await res.json()
    if (!json.url) {
      setMessage(json.error || 'No se pudo crear la sesión de pago.')
      setLoading(false)
      return
    }
    window.location.href = json.url
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <PSXLogo size={92} />
        <p className="text-sm font-mono uppercase tracking-[0.4em] text-primary mt-6">PSX Suscripciones</p>
        <h1 className="text-4xl md:text-5xl font-sentient mt-4">El plan que impulsa tu AI al siguiente nivel</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Selecciona el plan Pro o Premium para desbloquear resúmenes más rápidos, más recursos y funciones exclusivas de la plataforma PSX.</p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl shadow-primary/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>
              <div className="rounded-3xl bg-primary/10 px-4 py-3 text-primary font-semibold">{plan.price}/mes</div>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-foreground/90">
                  <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button onClick={() => handlePurchase(plan.id)} disabled={loading} className="w-full">
              {loading ? 'Redirigiendo...' : `Pagar ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[2rem] border border-border bg-background/80 p-8 text-center">
        <div className="mx-auto inline-flex items-center justify-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary font-medium">
          <Sparkles className="h-4 w-4" />
          Disponible en todo el mundo con facturación segura Stripe.
        </div>
        {message && <p className="mt-4 text-sm text-destructive">{message}</p>}
      </div>
    </div>
  )
}
