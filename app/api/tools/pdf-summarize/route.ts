'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPdf } from '@/lib/pdf'
import { runOpenAICompletion } from '@/lib/openai'
import { enforceSubscriptionLimit } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { path, bucket = 'uploads', filename } = body
  if (!path) return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
  if (profileError) {
    return NextResponse.json({ success: false, error: 'Unable to fetch user profile' }, { status: 500 })
  }

  const tier = profile?.subscription_tier || 'free'
  const limitCheck = await enforceSubscriptionLimit(supabase, user.id, tier)
  if (!limitCheck.allowed) {
    return NextResponse.json({ success: false, error: limitCheck.message }, { status: 402 })
  }

  const { data: download, error: downloadError } = await supabase.storage.from(bucket).download(path)
  if (downloadError || !download) {
    return NextResponse.json({ success: false, error: downloadError?.message || 'Cannot download file' }, { status: 500 })
  }

  const arrayBuffer = await download.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // extract text
  let text = ''
  try {
    text = await extractTextFromPdf(buffer)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'PDF parsing failed: ' + (err?.message ?? String(err)) }, { status: 500 })
  }

  // call OpenAI to summarize
  const prompt = `Resume el siguiente documento PDF en español en un resumen conciso y secciones con encabezados. Mantén un tono profesional y añade bullets con puntos clave. \n\nDOCUMENTO:\n${text.slice(0, 150000)}`

  let ai
  try {
    ai = await runOpenAICompletion(prompt, { max_tokens: 800 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'OpenAI error: ' + (err?.message ?? String(err)) }, { status: 500 })
  }

  const summary = ai?.choices?.[0]?.message?.content || JSON.stringify(ai)

  // save usage
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tool_usages').insert([{ user_id: user?.id ?? null, tool_id: null, input_data: { filename, path }, output_data: { summary }, processing_time_ms: null, status: 'completed' }])
  } catch (err) {
    // ignore
  }

  return NextResponse.json({ success: true, data: { summary } })
}
