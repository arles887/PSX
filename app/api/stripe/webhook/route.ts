import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import stripeClient from '@/lib/stripe'

// Create admin client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      // attach or update billing record
      const customerId = String(session.customer)
      const subscriptionId = String(session.subscription ?? '')
      const email = (session.customer_details as any)?.email

      // find user by email in profiles
      if (email) {
        const { data: profiles } = await supabaseAdmin.from('profiles').select('id').eq('email', email).limit(1)
        const userId = profiles?.[0]?.id
        if (userId) {
          await supabaseAdmin.from('billing').upsert([{ user_id: userId, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId, status: 'active' }], { onConflict: 'user_id' })
          await supabaseAdmin.from('profiles').update({ subscription_tier: 'pro' }).eq('id', userId)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
