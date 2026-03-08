import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY required for ProductRank operations')
    }
    _client = createClient(url, key)
  }
  return _client
}

// --- Signal Freshness ---

export async function upsertSignal(productSlug: string, signalName: string, value: number, source: string): Promise<void> {
  const { error } = await getSupabase()
    .from('signal_freshness')
    .upsert(
      { product_slug: productSlug, signal_name: signalName, value, source, collected_at: new Date().toISOString() },
      { onConflict: 'product_slug,signal_name' },
    )
  if (error) throw new Error(`Failed to upsert signal: ${error.message}`)
}

// --- Drift Events ---

export async function recordDriftEvent(
  productSlug: string,
  eventType: string,
  detail: string,
  successorSlug?: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from('drift_events')
    .insert({
      product_slug: productSlug,
      event_type: eventType,
      detail,
      detected_at: new Date().toISOString(),
      successor_slug: successorSlug ?? null,
    })
  if (error) throw new Error(`Failed to record drift event: ${error.message}`)
}

// --- Product Discovery Queue ---

export async function queueProductDiscovery(name: string, source: string, context: string): Promise<void> {
  const { error } = await getSupabase()
    .from('product_discovery_queue')
    .upsert(
      { name, source, context, queued_at: new Date().toISOString(), status: 'pending' },
      { onConflict: 'name' },
    )
  if (error) throw new Error(`Failed to queue discovery: ${error.message}`)
}

// --- Product Validations ---

export async function upsertValidation(slug: string, updates: Record<string, unknown>): Promise<void> {
  const { error } = await getSupabase()
    .from('product_validations')
    .upsert(
      { slug, ...updates, last_reviewed_at: new Date().toISOString() },
      { onConflict: 'slug' },
    )
  if (error) throw new Error(`Failed to upsert validation: ${error.message}`)
}

export async function getProductsNeedingReview(limit = 50): Promise<{ slug: string; confidence: number }[]> {
  const { data, error } = await getSupabase()
    .from('product_validations')
    .select('slug, confidence')
    .lt('confidence', 0.8)
    .order('confidence', { ascending: true })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch products: ${error.message}`)
  return data ?? []
}
