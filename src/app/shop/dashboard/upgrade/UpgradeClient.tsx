'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    key: 'free',
    name: '無料掲載',
    prices: { monthly: 0, annual: 0 },
    priceIds: { monthly: null, annual: null },
    badge: undefined as string | undefined,
    color: '#6b7280',
    bg: '#f3f4f6',
    features: [
      '店舗名・カテゴリ表示',
      '営業時間・定休日表示',
      'マップ上にピン表示',
    ],
    locked: [
      'PR文・キャッチコピー',
      'タグ表示',
      '画像掲載',
      '優先表示',
    ],
  },
  {
    key: 'standard',
    name: 'スタンダード',
    prices: { monthly: 3000, annual: 30000 },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STD_MONTHLY,
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STD_ANNUAL,
    },
    badge: undefined as string | undefined,
    color: '#1d4ed8',
    bg: '#dbeafe',
    features: [
      '無料プランのすべて',
      'PR文・キャッチコピー掲載',
      'タグ表示（最大3件）',
    ],
    locked: [
      '画像掲載',
      '優先表示（検索上位）',
    ],
  },
  {
    key: 'premium',
    name: 'プレミアム',
    prices: { monthly: 10000, annual: 99600 },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRE_MONTHLY,
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRE_ANNUAL,
    },
    color: '#92400e',
    bg: '#fef3c7',
    badge: 'おすすめ',
    features: [
      'スタンダードのすべて',
      '画像掲載（メイン写真）',
      '優先表示（検索上位）',
      '専用サポート対応',
    ],
    locked: [],
  },
] as const

interface Props {
  currentPlan: string
}

export default function UpgradeClient({ currentPlan }: Props) {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpgrade(planKey: string, priceId: string | undefined) {
    if (!priceId) {
      setError('このプランの決済準備ができていません。')
      return
    }
    setLoading(planKey)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan: planKey, billing }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'エラーが発生しました。')
        return
      }

      if (data.url) {
        router.push(data.url)
      }
    } catch {
      setError('通信エラーが発生しました。')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* 月払い/年払いトグル */}
      <div className="flex justify-center mt-4 mb-2">
        <div className="inline-flex bg-white rounded-full p-1 shadow-sm border border-[#e8c860]/30">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
              billing === 'monthly' ? 'bg-[#c4a870] text-[#1c1006]' : 'text-[#6b7280] hover:text-[#1c1006]'
            }`}
          >
            月払い
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors relative ${
              billing === 'annual' ? 'bg-[#c4a870] text-[#1c1006]' : 'text-[#6b7280] hover:text-[#1c1006]'
            }`}
          >
            年払い
            <span className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold">
              17%OFF
            </span>
          </button>
        </div>
      </div>
      
      {billing === 'annual' && (
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: '#f0fdf4', color: '#166534' }}>
            スタンダードで年間¥6,000節約
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map(plan => {
          const isCurrent = plan.key === currentPlan
          const isDowngrade = ['free'].includes(plan.key) && currentPlan !== 'free'
          const isDisabled = isCurrent || isDowngrade || loading !== null

          return (
            <div key={plan.key}
              className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
              style={isCurrent ? { outline: '2px solid #c4a870' } : {}}>

              {/* ヘッダー */}
              <div className="px-5 py-4" style={{ background: 'rgba(139,94,60,0.04)', borderBottom: '1px solid #f0e8d8' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: plan.bg, color: plan.color }}>
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#7a4e20', color: '#fef3c7' }}>
                      {plan.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#f0fdf4', color: '#166534' }}>
                      現在のプラン
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold mt-2" style={{ color: '#1c1006' }}>
                  {plan.prices[billing] === 0 ? '無料' : `¥${(billing === 'annual' ? plan.prices.annual / 12 : plan.prices.monthly).toLocaleString()}`}
                  {plan.prices[billing] > 0 && <span className="text-sm font-normal" style={{ color: '#6b7280' }}> /月</span>}
                </p>
                {billing === 'annual' && plan.prices.annual > 0 && (
                  <p className="text-xs mt-1 font-medium" style={{ color: '#9ca3af' }}>年額 ¥{plan.prices.annual.toLocaleString()}</p>
                )}
              </div>

              {/* 機能一覧 */}
              <div className="px-5 py-4 flex-1 space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                    <span className="mt-0.5 shrink-0" style={{ color: '#22c55e' }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
                {plan.locked.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm" style={{ color: '#d1d5db' }}>
                    <span className="mt-0.5 shrink-0">✗</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* ボタン */}
              <div className="px-5 pb-5">
                {isCurrent ? (
                  <div className="w-full py-2 rounded-xl text-sm text-center font-medium"
                    style={{ background: '#f0fdf4', color: '#166534' }}>
                    利用中
                  </div>
                ) : isDowngrade ? (
                  <div className="w-full py-2 rounded-xl text-sm text-center"
                    style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                    ダウングレード不可
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key, plan.priceIds[billing] ?? undefined)}
                    disabled={isDisabled}
                    className="w-full py-2 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
                    style={{ background: '#c4a870', color: '#1c1006' }}>
                    {loading === plan.key ? '処理中…' : 
                      (plan.prices[billing] > 0 ? 
                        (billing === 'annual' ? `年払いで申し込む（¥${plan.prices.annual.toLocaleString()}/年）` : `月払いで申し込む（¥${plan.prices.monthly.toLocaleString()}/月）`) 
                        : '申し込む')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center mt-6" style={{ color: '#9ca3af' }}>
        お支払いは Stripe の安全な決済ページで処理されます。いつでもキャンセル可能です。
      </p>
    </div>
  )
}
