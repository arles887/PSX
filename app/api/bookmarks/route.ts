'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('bookmarks').select('*, tool:tools(*)').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { tool_id, resource_id, resource_type } = body
  if (!tool_id && !resource_id) return NextResponse.json({ success: false, error: 'Missing resource' }, { status: 400 })

  const payload: any = { user_id: user.id }
  if (tool_id) payload.tool_id = tool_id
  if (resource_id) payload.resource_id = resource_id
  if (resource_type) payload.resource_type = resource_type

  const { data, error } = await supabase.from('bookmarks').insert([payload]).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
