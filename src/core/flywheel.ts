import { getSupabase, upsertValidation } from './supabase.js'

export async function updateConfidence(slug: string, dimension: string, delta: number): Promise<void> {
  const { data } = await getSupabase()
    .from('product_validations')
    .select('confidence, review_count')
    .eq('slug', slug)
    .single()

  const current = data?.confidence ?? 0
  const newConfidence = Math.min(1.0, Math.max(0, current + delta))
  const reviewCount = (data?.review_count ?? 0) + 1

  await upsertValidation(slug, {
    confidence: newConfidence,
    review_count: reviewCount,
    [`${dimension}`]: true,
  })
}

export async function getFlywheelMetrics(): Promise<{
  totalProducts: number
  trustedProducts: number
  pendingReview: number
  avgConfidence: number
  weeklyGrowth: number
  weeklyPromotions: number
}> {
  const sb = getSupabase()

  const [totalRes, trustedRes, pendingRes, avgRes, growthRes, promoRes] = await Promise.all([
    sb.from('product_validations').select('slug', { count: 'exact', head: true }),
    sb.from('product_validations').select('slug', { count: 'exact', head: true }).gte('confidence', 0.8),
    sb.from('product_validations').select('slug', { count: 'exact', head: true }).lt('confidence', 0.8),
    sb.from('product_validations').select('confidence'),
    sb.from('product_validations').select('slug', { count: 'exact', head: true })
      .gte('discovered_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    sb.from('product_validations').select('slug', { count: 'exact', head: true })
      .gte('confidence', 0.8)
      .gte('last_reviewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const confidences = avgRes.data?.map((r: any) => r.confidence) ?? []
  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
    : 0

  return {
    totalProducts: totalRes.count ?? 0,
    trustedProducts: trustedRes.count ?? 0,
    pendingReview: pendingRes.count ?? 0,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    weeklyGrowth: growthRes.count ?? 0,
    weeklyPromotions: promoRes.count ?? 0,
  }
}
