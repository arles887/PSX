import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  compatibility: 'strict',
})

export async function POST(req: NextRequest) {
  try {
    const { text, length, style } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Se requiere el texto a resumir' },
        { status: 400 }
      )
    }

    const lengthInstructions = {
      'muy-corto': '1-2 oraciones breves',
      'corto': '3-5 oraciones',
      'medio': 'un parrafo de 4-6 oraciones',
      'detallado': '2-3 parrafos manteniendo puntos importantes',
    }

    const styleInstructions = {
      'puntos': 'Presenta el resumen como una lista de puntos clave con viñetas (-)',
      'narrativo': 'Escribe el resumen como un texto fluido y narrativo',
      'ejecutivo': 'Escribe un resumen ejecutivo profesional con las conclusiones principales',
    }

    const systemPrompt = `Eres un experto en sintesis y resumen de textos en espanol. Tu tarea es crear resumenes claros y precisos.
- Longitud del resumen: ${lengthInstructions[length as keyof typeof lengthInstructions] || 'un parrafo'}
- Estilo: ${styleInstructions[style as keyof typeof styleInstructions] || 'narrativo'}
- Mantiene las ideas principales y la informacion esencial
- Usa un lenguaje claro y conciso
- No añadas informacion que no este en el texto original
- Responde siempre en espanol`

    const { text: summary } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Resume el siguiente texto:\n\n${text}`,
      maxTokens: 500,
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error summarizing text:', error)
    return NextResponse.json(
      { error: 'Error al resumir texto. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
