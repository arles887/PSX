'use server'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import stripeClient from '@/lib/stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ success: false, error: 'Webhook secret not configured' }, { status: 500 })

  const buf = await req.arrayBuffer()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripeClient.webhooks.constructEvent(Buffer.from(buf), sig, secret)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      // attach or update billing record
      const customerId = String(session.customer)
      const subscriptionId = String(session.subscription ?? '')
      const email = (session.customer_details as any)?.email

      // find user by email in profiles
      if (email) {
        const { data: profiles } = await supabase.from('profiles').select('id').eq('email', email).limit(1)
        const userId = profiles?.[0]?.id
        if (userId) {
          await supabase.from('billing').upsert([{ user_id: userId, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId, status: 'active' }], { onConflict: 'user_id' })
          await supabase.from('profiles').update({ subscription_tier: 'pro' }).eq('id', userId)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
