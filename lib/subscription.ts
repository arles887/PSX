import { SupabaseClient } from '@supabase/supabase-js'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export function getSubscriptionLimits(tier: SubscriptionTier) {
  switch (tier) {
    case 'pro':
      return { daily: 50, monthly: 1200 }
    case 'enterprise':
      return { daily: 500, monthly: 10000 }
    default:
      return { daily: 3, monthly: 60 }
  }
}

export async function enforceSubscriptionLimit(supabase: SupabaseClient, userId: string, tier: SubscriptionTier) {
  const limits = getSubscriptionLimits(tier)
  const dayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  const monthAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()

  const dailyResult = await supabase.from('tool_usages').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', dayAgo)
  const monthlyResult = await supabase.from('tool_usages').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', monthAgo)

  if (dailyResult.error || monthlyResult.error) {
    throw new Error('Failed to evaluate subscription limits')
  }

  const dailyCount = dailyResult.count ?? 0
  const monthlyCount = monthlyResult.count ?? 0

  if (limits.daily !== null && dailyCount >= limits.daily) {
    return { allowed: false, message: `Has alcanzado el límite diario de ${limits.daily} resúmenes. Actualiza a PRO para procesar más documentos.` }
  }

  if (limits.monthly !== null && monthlyCount >= limits.monthly) {
    return { allowed: false, message: `Has alcanzado el límite mensual de ${limits.monthly} resúmenes. Actualiza a PRO para continuar.` }
  }

  return { allowed: true }
}
