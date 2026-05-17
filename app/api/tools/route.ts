'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateToolSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  icon: z.string().optional(),
  is_premium: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const url = new URL(req.url)
  const q = url.searchParams.get('q')
  const category = url.searchParams.get('category')
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  let query = supabase.from('tools').select('*, category:categories(*)').eq('is_active', true)

  if (category) query = query.eq('category_id', category)
  if (q) {
    query = query.ilike('name', `%${q}%`).or(`short_description.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data, error } = await query.order('is_featured', { ascending: false }).order('usage_count', { ascending: false }).range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const parsed = CreateToolSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid payload', details: parsed.error.format() }, { status: 400 })

  // auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  // insert tool
  const { data, error } = await supabase.from('tools').insert([{ ...parsed.data }]).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
