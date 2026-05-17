'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('resources').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, content, file_url, file_size, file_type, keywords } = body
  if (!title || !content) return NextResponse.json({ success: false, error: 'Missing title or content' }, { status: 400 })

  let slug = slugify(title)
  const existing = await supabase.from('resources').select('id').eq('slug', slug).maybeSingle()
  if (existing.data) {
    slug = `${slug}-${Date.now()}`
  }

  const { data, error } = await supabase.from('resources').insert([{ owner_id: user.id, title, slug, description, content, file_url, file_size, file_type, keywords }]).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
