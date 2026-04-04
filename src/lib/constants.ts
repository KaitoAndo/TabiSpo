export const CATEGORIES = ['すべて','観光','飲食','スイーツ','体験','お土産','酒蔵','温泉・宿'] as const
export const AREAS = ['すべて','表参道','奥参道','琴平駅前'] as const
export const MAP_CENTER = { lng: 133.82220, lat: 34.18470 } as const
export const MAP_ZOOM = 16.2
export const TILE_URL = 'https://tiles.openfreemap.org/styles/liberty'

export const PLANS = {
  free:     { name: '無料掲載', price: 0 },
  standard: { name: 'スタンダード', price: 3000 },
  premium:  { name: 'プレミアム', price: 10000 },
} as const
