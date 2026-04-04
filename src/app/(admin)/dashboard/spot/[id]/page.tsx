'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, AREAS } from '@/lib/constants'
import type { Spot, SpotCategory } from '@/types/spot'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB   = 2
const MAX_PR_LEN    = 200
const MAX_NAME_LEN  = 50

// ── Toast ─────────────────────────────────────────────────
type ToastType = 'success' | 'error'
function Toast({ msg, type, onDone }: { msg: string; type: ToastType; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl z-50 whitespace-nowrap"
      style={{
        background: type === 'success' ? '#166534' : '#991b1b',
        color: '#fff',
        animation: 'fadeInUp .2s ease',
      }}
    >
      {type === 'success' ? '✓ ' : '✗ '}{msg}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function SpotEditPage() {
  const router = useRouter()
  const { id }  = useParams<{ id: string }>()

  const [form,     setForm]     = useState<Partial<Spot>>({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [imgFile,  setImgFile]  = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [toast,    setToast]    = useState<{ msg: string; type: ToastType } | null>(null)
  const [imgError, setImgError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── 初期データ取得 ──────────────────────────────────────
  useEffect(() => {
    createClient()
      .from('spots')
      .select('*')
      .eq('id', id)
      .single<Spot>()
      .then(({ data }) => {
        if (data) {
          setForm(data)
          if (data.image_url) setPreview(data.image_url)
        }
        setLoading(false)
      })
  }, [id])

  function set<K extends keyof Spot>(key: K, value: Spot[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ── 画像選択 ────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImgError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImgError('jpg・png・webp のみ対応しています')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImgError(`ファイルサイズは ${MAX_SIZE_MB}MB 以内にしてください`)
      return
    }

    setImgFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // ── 画像アップロード ────────────────────────────────────
  const uploadImage = useCallback(async (supabase: ReturnType<typeof createClient>) => {
    if (!imgFile) return form.image_url ?? null

    const ext  = imgFile.name.split('.').pop() ?? 'jpg'
    const path = `${id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('spots')
      .upload(path, imgFile, { upsert: true, contentType: imgFile.type })

    if (error) throw new Error('画像のアップロードに失敗しました: ' + error.message)

    const { data } = supabase.storage.from('spots').getPublicUrl(path)
    return data.publicUrl
  }, [imgFile, id, form.image_url])

  // ── バリデーション ──────────────────────────────────────
  function validate() {
    if (!form.name?.trim())           return '店舗名は必須です'
    if (form.name.length > MAX_NAME_LEN) return `店舗名は${MAX_NAME_LEN}文字以内にしてください`
    if (!form.hours?.trim())          return '営業時間は必須です'
    if ((form.pr?.length ?? 0) > MAX_PR_LEN) return `PR文は${MAX_PR_LEN}文字以内にしてください`
    return null
  }

  // ── 保存 ────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setToast({ msg: err, type: 'error' }); return }

    setSaving(true)
    try {
      const supabase  = createClient()
      const image_url = await uploadImage(supabase)

      const { error } = await supabase
        .from('spots')
        .update({
          name:      form.name,
          category:  form.category,
          sub:       form.sub       || null,
          pr:        form.pr        || null,
          hours:     form.hours,
          closed:    form.closed    || null,
          area:      form.area      || null,
          tag:       form.tag       || null,
          image_url: image_url      || null,
          is_active: form.is_active ?? true,
        })
        .eq('id', id)

      if (error) throw new Error(error.message)

      setToast({ msg: '保存しました！', type: 'success' })
      setImgFile(null)
      setTimeout(() => router.push('/dashboard'), 1600)
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : '保存に失敗しました', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── ローディング ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#f5f0e8' }}>
        <p className="text-sm animate-pulse" style={{ color: '#8b5e3c' }}>読み込み中…</p>
      </div>
    )
  }

  const prLen = form.pr?.length ?? 0

  return (
    <div className="min-h-dvh pb-24" style={{ background: '#f5f0e8' }}>
      {/* ゴールドライン */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #7a4e20, #e8c860, #c4a240, #e8c860, #7a4e20)',
      }} />

      {/* ヘッダー */}
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #1c1006 0%, #3c220c 100%)' }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium"
          style={{ color: '#c4a870' }}
        >
          ← 戻る
        </button>
        <h1 className="text-sm font-bold" style={{ color: '#fff' }}>
          スポット情報の編集
        </h1>
      </header>

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ── 画像アップロード ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <SectionTitle>スポット画像</SectionTitle>
          <div className="p-4 space-y-3">
            {/* プレビュー */}
            <div
              className="relative w-full rounded-xl overflow-hidden cursor-pointer"
              style={{ height: 160, background: '#f0e8d8' }}
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <Image
                  src={preview}
                  alt="プレビュー"
                  fill
                  className="object-cover"
                  unoptimized={preview.startsWith('blob:')}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl">📷</span>
                  <p className="text-xs" style={{ color: '#8b5e3c' }}>
                    タップして画像を選択
                  </p>
                </div>
              )}
              {/* オーバーレイ */}
              {preview && (
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(28,16,6,0.5)' }}
                >
                  <span className="text-white text-sm font-semibold">画像を変更</span>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {imgError && (
              <p className="text-xs text-red-500">{imgError}</p>
            )}
            {imgFile && (
              <p className="text-xs" style={{ color: '#6b7280' }}>
                選択中: {imgFile.name}（{(imgFile.size / 1024 / 1024).toFixed(1)} MB）
              </p>
            )}
            <p className="text-[10px]" style={{ color: '#9ca3af' }}>
              jpg・png・webp / 最大 {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>

        {/* ── 基本情報 ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <SectionTitle>基本情報</SectionTitle>
          <div className="p-4 space-y-4">
            <Field label={`店舗・スポット名 * （${form.name?.length ?? 0}/${MAX_NAME_LEN}）`}>
              <input
                required
                maxLength={MAX_NAME_LEN}
                value={form.name ?? ''}
                onChange={e => set('name', e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="カテゴリ *">
              <select
                value={form.category ?? ''}
                onChange={e => set('category', e.target.value as SpotCategory)}
                className={inputCls}
              >
                {CATEGORIES.filter(c => c !== 'すべて').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="サブタイトル（例: 讃岐うどん・テイクアウト）">
              <input
                value={form.sub ?? ''}
                onChange={e => set('sub', e.target.value)}
                className={inputCls}
                placeholder="簡潔な説明文"
              />
            </Field>

            <Field label={`PR文（${prLen}/${MAX_PR_LEN}文字）— premium プランで表示`}>
              <textarea
                rows={4}
                maxLength={MAX_PR_LEN}
                value={form.pr ?? ''}
                onChange={e => set('pr', e.target.value)}
                className={inputCls}
                placeholder="お店の魅力を伝えるPR文を入力..."
              />
              {prLen > MAX_PR_LEN * 0.9 && (
                <p className="text-[10px] mt-0.5 text-right"
                  style={{ color: prLen >= MAX_PR_LEN ? '#dc2626' : '#f59e0b' }}>
                  残り {MAX_PR_LEN - prLen} 文字
                </p>
              )}
            </Field>
          </div>
        </div>

        {/* ── 営業情報 ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <SectionTitle>営業情報</SectionTitle>
          <div className="p-4 space-y-4">
            <Field label="営業時間 *">
              <input
                required
                value={form.hours ?? ''}
                onChange={e => set('hours', e.target.value)}
                className={inputCls}
                placeholder="例: 9:00〜18:00"
              />
            </Field>

            <Field label="定休日">
              <input
                value={form.closed ?? ''}
                onChange={e => set('closed', e.target.value)}
                className={inputCls}
                placeholder="例: 水曜・祝日"
              />
            </Field>

            <Field label="エリア">
              <select
                value={form.area ?? ''}
                onChange={e => set('area', e.target.value)}
                className={inputCls}
              >
                <option value="">選択してください</option>
                {AREAS.filter(a => a !== 'すべて').map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>

            <Field label="タグ（任意 / 例: 人気・新店・期間限定）">
              <input
                value={form.tag ?? ''}
                onChange={e => set('tag', e.target.value || null as unknown as string)}
                className={inputCls}
                placeholder="タグを入力"
              />
            </Field>

            <Field label="公開設定">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={e => set('is_active', e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: '#8b5e3c' }}
                />
                <span className="text-sm" style={{ color: '#374151' }}>
                  マップに公開する
                </span>
              </label>
            </Field>
          </div>
        </div>

      </form>

      {/* ── 固定フッター（保存ボタン） ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-3"
        style={{
          background: 'rgba(245,240,232,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e8d8c0',
        }}
      >
        <button
          type="submit"
          form="spot-form"
          disabled={saving}
          onClick={handleSave}
          className="w-full max-w-lg mx-auto block py-3.5 rounded-2xl text-sm font-bold transition-opacity disabled:opacity-60"
          style={{ background: '#8b5e3c', color: '#fff' }}
        >
          {saving ? '保存中…' : '変更を保存する'}
        </button>
      </div>

      {/* ── トースト ── */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}

// ── サブコンポーネント ──────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-2.5 text-xs font-semibold"
      style={{
        background: 'rgba(139,94,60,0.06)',
        color: '#8b5e3c',
        borderBottom: '1px solid #f0e8d8',
      }}
    >
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
