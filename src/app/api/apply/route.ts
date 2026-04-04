import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.json()
  const { shopName, category, contactName, email, phone, plan, pr, note } = body

  // バリデーション
  const errors: Record<string, string> = {}
  if (!shopName?.trim())    errors.shopName    = '店舗名は必須です'
  if (!category?.trim())    errors.category    = 'カテゴリは必須です'
  if (!contactName?.trim()) errors.contactName = '担当者名は必須です'
  if (!email?.trim())       errors.email       = 'メールアドレスは必須です'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'メールアドレスの形式が正しくありません'
  if (!plan?.trim())        errors.plan        = '希望プランは必須です'

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 422 })
  }

  // Service Role で Supabase に仮登録
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: dbError } = await supabase.from('spots').insert({
    name:      shopName.trim(),
    category,
    pr:        pr?.trim() ?? '',
    sub:       '',
    hours:     '',
    closed:    '',
    lat:       34.18470,
    lng:       133.82220,
    area:      '',
    plan,
    tag:       null,
    is_active: false,
  })

  if (dbError) {
    console.error('DB insert error:', dbError)
    return Response.json({ error: 'データベースへの登録に失敗しました' }, { status: 500 })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const planLabels: Record<string, string> = { free: '無料掲載', standard: 'スタンダード（¥3,000/月）', premium: 'プレミアム（¥10,000/月）' }
  const planLabel  = planLabels[plan] ?? plan

  // 申込者への受付完了メール
  const applicantHtml = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

        <!-- ヘッダー -->
        <tr><td style="background:linear-gradient(135deg,#1c1006,#3c220c);padding:0">
          <div style="height:4px;background:linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)"></div>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:24px 28px">
              <p style="margin:0;font-size:20px">⛩️</p>
              <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#c4a870;letter-spacing:0.04em">こんぴらタウンMAP</p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(196,168,112,0.7)">掲載申込 受付完了のお知らせ</p>
            </td>
          </tr></table>
        </td></tr>

        <!-- 本文 -->
        <tr><td style="padding:28px 28px 8px">
          <p style="margin:0 0 12px;font-size:15px;color:#374151">${contactName} 様</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7">
            この度は「こんぴらタウンMAP」への掲載をお申し込みいただき、誠にありがとうございます。<br>
            下記の内容で申込を受け付けました。担当者よりご連絡いたします。
          </p>

          <!-- 申込内容 -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #f0e8d8;border-radius:12px;overflow:hidden;margin-bottom:20px">
            <tr style="background:#faf6f0">
              <td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#8b5e3c;letter-spacing:0.06em">
                申込内容
              </td>
            </tr>
            ${row('店舗名', shopName)}
            ${row('カテゴリ', category)}
            ${row('担当者名', contactName)}
            ${row('メールアドレス', email)}
            ${phone ? row('電話番号', phone) : ''}
            ${row('希望プラン', planLabel)}
            ${pr ? row('PR文', pr) : ''}
            ${note ? row('備考', note) : ''}
          </table>

          <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;line-height:1.6">
            ※ 審査完了後、ログイン情報をご登録のメールアドレスにお送りします。<br>
            ※ 通常3営業日以内にご連絡いたします。
          </p>
        </td></tr>

        <!-- フッター -->
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #f0e8d8">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            こんぴらタウンMAP 運営事務局<br>
            <a href="${appUrl}" style="color:#8b5e3c">${appUrl}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  // 管理者への通知メール
  const adminHtml = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <tr><td style="background:linear-gradient(135deg,#1c1006,#3c220c);padding:0">
          <div style="height:4px;background:linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)"></div>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:20px 28px">
              <p style="margin:0;font-size:16px;font-weight:700;color:#c4a870">【新規申込通知】こんぴらタウンMAP</p>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:24px 28px">
          <p style="margin:0 0 16px;font-size:14px;color:#374151">新規掲載申込が届きました。管理画面から確認・対応をお願いします。</p>
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #f0e8d8;border-radius:12px;overflow:hidden;margin-bottom:16px">
            <tr style="background:#faf6f0">
              <td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#8b5e3c">申込内容</td>
            </tr>
            ${row('店舗名', shopName)}
            ${row('カテゴリ', category)}
            ${row('担当者名', contactName)}
            ${row('メール', email)}
            ${phone ? row('電話番号', phone) : ''}
            ${row('希望プラン', planLabel)}
            ${pr ? row('PR文', pr) : ''}
            ${note ? row('備考', note) : ''}
          </table>
          <a href="${appUrl}/admin/dashboard"
            style="display:inline-block;padding:10px 20px;background:#c4a870;color:#1c1006;font-weight:700;font-size:13px;border-radius:8px;text-decoration:none">
            管理画面を開く →
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  // メール送信（失敗してもエラーにしない）
  try {
    await Promise.all([
      resend.emails.send({
        from:    'こんぴらタウンMAP <onboarding@resend.dev>',
        to:      email,
        subject: '【こんぴらタウンMAP】掲載申込を受け付けました',
        html:    applicantHtml,
      }),
      resend.emails.send({
        from:    'こんぴらタウンMAP <onboarding@resend.dev>',
        to:      adminEmail,
        subject: `【新規申込】${shopName}（${planLabel}）`,
        html:    adminHtml,
      }),
    ])
  } catch (mailErr) {
    console.error('Resend error:', mailErr)
  }

  return Response.json({ ok: true })
}

function row(label: string, value: string) {
  return `
    <tr style="border-top:1px solid #f0e8d8">
      <td style="padding:9px 16px;font-size:12px;color:#9ca3af;white-space:nowrap;width:110px">${label}</td>
      <td style="padding:9px 16px;font-size:13px;color:#374151">${value}</td>
    </tr>`
}
