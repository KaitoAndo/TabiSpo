import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Stripe署名検証のため body をそのまま受け取る
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return Response.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Service Role で Supabase を操作（RLS バイパス）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const shopId = session.metadata?.shop_id
      const plan = session.metadata?.plan as 'standard' | 'premium' | undefined

      if (shopId && plan) {
        await supabase
          .from('shops')
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', shopId)

        // spots も同期
        const { data: shop } = await supabase
          .from('shops')
          .select('spot_id')
          .eq('id', shopId)
          .single()

        if (shop?.spot_id) {
          await supabase
            .from('spots')
            .update({ plan })
            .eq('id', shop.spot_id)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status

      if (status === 'active') break // checkout.session.completed で処理済み

      // サブスク停止・キャンセル時は free に戻す
      if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
        const { data: shop } = await supabase
          .from('shops')
          .select('id, spot_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (shop) {
          await supabase
            .from('shops')
            .update({ plan: 'free', stripe_subscription_id: null })
            .eq('id', shop.id)

          if (shop.spot_id) {
            await supabase
              .from('spots')
              .update({ plan: 'free' })
              .eq('id', shop.spot_id)
          }
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      const { data: shop } = await supabase
        .from('shops')
        .select('id, spot_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (shop) {
        await supabase
          .from('shops')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('id', shop.id)

        if (shop.spot_id) {
          await supabase
            .from('spots')
            .update({ plan: 'free' })
            .eq('id', shop.spot_id)
        }
      }
      break
    }

    default:
      break
  }

  return Response.json({ received: true })
}
