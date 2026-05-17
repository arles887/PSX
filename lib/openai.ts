export async function runOpenAICompletion(prompt: string, opts?: { model?: string, max_tokens?: number }) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts?.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: opts?.max_tokens || 512,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error: ${text}`)
  }

  const json = await res.json()
  return json
}
