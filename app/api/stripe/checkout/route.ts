import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import stripeClient from '@/lib/stripe'

const priceMap: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM,
}

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const priceId = priceMap[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Plan inválido o precio no configurado.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Autenticación requerida.' }, { status: 401 })
  }

  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`

  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: user.id,
      plan,
    },
  })

  if (!session.url) {
    return NextResponse.json({ error: 'No se pudo crear la sesión de Stripe.' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
