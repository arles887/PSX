import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-15',
})

export async function createCheckoutSession({ priceId, successUrl, cancelUrl, metadata = {} }: { priceId: string, successUrl: string, cancelUrl: string, metadata?: Record<string, string> }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
  return session
}

export default stripe
