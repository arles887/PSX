'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const validStatuses = ['active', 'canceled', 'past_due', 'unpaid']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
  }

  const body = await req.json()
  const status = String(body.status || '').toLowerCase()
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: 'Estado inválido' }, { status: 400 })
  }

  const { data, error } = await supabase.from('billing').update({ status }).eq('id', params.id).select().single()
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
