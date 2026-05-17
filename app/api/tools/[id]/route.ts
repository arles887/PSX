'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateToolSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  icon: z.string().nullable().optional(),
  is_premium: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params
  const { data, error } = await supabase.from('tools').select('*, category:categories(*)').eq('id', id).single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params
  const body = await req.json()
  const parsed = UpdateToolSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('tools').update(parsed.data).eq('id', id).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('tools').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Deleted' })
}
