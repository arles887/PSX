import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  compatibility: 'strict',
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, tone, type, length } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Se requiere un prompt' },
        { status: 400 }
      )
    }

    const lengthInstructions = {
      corto: '100-150 palabras',
      medio: '200-300 palabras',
      largo: '400-500 palabras',
    }

    const systemPrompt = `Eres un escritor profesional en espanol. Genera contenido de alta calidad siguiendo estas instrucciones:
- Tipo de contenido: ${type}
- Tono: ${tone}
- Longitud aproximada: ${lengthInstructions[length as keyof typeof lengthInstructions] || '200-300 palabras'}
- Escribe siempre en espanol
- El contenido debe ser original, atractivo y bien estructurado
- No incluyas introducciones innecesarias como "Aqui tienes..." o "El siguiente texto..."
- Ve directo al contenido solicitado`

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Genera contenido sobre: ${prompt}`,
      maxTokens: 1000,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Error generating text:', error)
    return NextResponse.json(
      { error: 'Error al generar texto. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
