'use server'

export async function parseGoogleMapUrl(urlStr: string) {
  try {
    let finalUrl = urlStr

    // 短縮URLの場合はリダイレクト先を取得
    if (urlStr.includes('goo.gl') || urlStr.includes('maps.app.goo.gl')) {
      const res = await fetch(urlStr, { redirect: 'follow' })
      finalUrl = res.url
    }

    // @34.123,133.123 形式の抽出
    const match = finalUrl.match(/@([-\d.]+),([-\d.]+)/)
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]), finalUrl }
    }

    // !3d34.123!4d133.123 形式 (共有リンク内によくある)
    const shareMatch = finalUrl.match(/!3d([-\d.]+)!4d([-\d.]+)/)
    if (shareMatch) {
      return { lat: parseFloat(shareMatch[1]), lng: parseFloat(shareMatch[2]), finalUrl }
    }

    // queryパラメータ (q=34.123,133.123)
    const urlObj = new URL(finalUrl)
    const qParams = urlObj.searchParams.get('q') || urlObj.searchParams.get('ll')
    if (qParams) {
      const [lat, lng] = qParams.split(',')
      if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        return { lat: parseFloat(lat), lng: parseFloat(lng), finalUrl }
      }
    }

    return { error: 'URLから位置情報を取得できませんでした。ブラウザのURLバーにあるリンク（@緯度,経度がつくもの）をお試しください。' }
  } catch (err: any) {
    return { error: 'URLの解析に失敗しました: ' + err.message }
  }
}
