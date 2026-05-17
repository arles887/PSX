'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import stripeClient from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: billing, error } = await supabase.from('billing').select('stripe_customer_id').eq('user_id', user.id).single()
  if (error || !billing?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer found.' }, { status: 404 })
  }

  const session = await stripeClient.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
