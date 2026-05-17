import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  compatibility: 'strict',
})

export async function POST(req: NextRequest) {
  try {
    const { text, mode } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Se requiere el texto a parafrasear' },
        { status: 400 }
      )
    }

    const modeInstructions: Record<string, string> = {
      standard: 'Reescribe el texto manteniendo el significado pero usando diferentes palabras y estructura',
      fluent: 'Reescribe el texto para que suene mas natural y fluido, mejorando la legibilidad',
      formal: 'Reescribe el texto con un tono profesional y formal, adecuado para contextos empresariales',
      creative: 'Reescribe el texto de forma mas expresiva y creativa, manteniendo la idea central',
      simple: 'Reescribe el texto de forma mas simple y facil de entender, usando vocabulario basico',
    }

    const systemPrompt = `Eres un experto en redaccion y parafraseo en espanol.
${modeInstructions[mode] || modeInstructions.standard}
- Mantiene el significado original del texto
- No omitas informacion importante
- Responde solo con el texto parafraseado, sin explicaciones
- El resultado debe tener una longitud similar al original`

    const { text: paraphrase } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Parafrasea el siguiente texto:\n\n${text}`,
      maxTokens: 1000,
    })

    return NextResponse.json({ paraphrase })
  } catch (error) {
    console.error('Error paraphrasing text:', error)
    return NextResponse.json(
      { error: 'Error al parafrasear. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
