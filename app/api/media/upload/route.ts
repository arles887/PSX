'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToCloudinary } from '@/lib/uploads'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { filename, file } = body
  if (!filename || !file) return NextResponse.json({ success: false, error: 'Missing file' }, { status: 400 })

  try {
    // stubbed: implement actual upload logic
    await uploadToCloudinary(null as any, filename)
    // Insert media record
    const { data, error } = await supabase.from('media').insert([{ owner_id: user.id, url: `/uploads/${filename}`, mime_type: 'application/octet-stream' }]).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
