import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { priceId, plan, billing = 'monthly' } = body as { priceId: string; plan: string; billing: string }

  if (!priceId || !plan) {
    return Response.json({ error: 'priceId and plan are required' }, { status: 400 })
  }

  // 既存の Stripe カスタマー ID を取得
  const { data: shop } = await supabase
    .from('shops')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = shop?.stripe_customer_id as string | undefined

  // カスタマーがなければ作成
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: shop?.email ?? user.email ?? undefined,
      metadata: { shop_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('shops')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/shop/dashboard?success=true`,
      cancel_url: `${appUrl}/shop/dashboard/upgrade?canceled=true`,
      metadata: { shop_id: user.id, plan, billing },
      subscription_data: {
        metadata: { shop_id: user.id, plan, billing },
      },
    })
    
    return Response.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return Response.json({ error: error.message || 'Stripe error' }, { status: 500 })
  }
}
