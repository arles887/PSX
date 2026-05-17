'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('slug, updated_at').order('updated_at', { ascending: false }).limit(1000)
  const { data: tools } = await supabase.from('tools').select('slug, updated_at').order('updated_at', { ascending: false }).limit(1000)

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://psx.ai'

  const urls = [
    `${base}/`,
    ...((posts || []).map((p: any) => `${base}/blog/${p.slug}`)),
    ...((tools || []).map((t: any) => `${base}/herramientas/${t.slug}`)),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}
