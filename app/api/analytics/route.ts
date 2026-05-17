'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { event_type, metadata } = body
  if (!event_type) return NextResponse.json({ success: false, error: 'Missing event_type' }, { status: 400 })

  const { data, error } = await supabase.from('analytics_events').insert([{ event_type, metadata }]).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
