'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const url = new URL(req.url)
  const q = url.searchParams.get('q')
  const limit = parseInt(url.searchParams.get('limit') || '12', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  let query = supabase.from('posts').select('*, author:profiles(id, full_name)').eq('status', 'published')
  if (q) query = query.ilike('title', `%${q}%`).or(`excerpt.ilike.%${q}%,content.ilike.%${q}%`)

  const { data, error } = await query.order('published_at', { ascending: false }).range(offset, offset + limit - 1)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { title, slug, content, excerpt, cover_image, category_id, status } = body
  if (!title || !slug) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabase.from('posts').insert([{ title, slug, content, excerpt, cover_image, category_id, status, author_id: user.id }]).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
