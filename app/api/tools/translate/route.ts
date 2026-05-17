import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  compatibility: 'strict',
})

const languageNames: Record<string, string> = {
  es: 'Espanol',
  en: 'Ingles',
  fr: 'Frances',
  de: 'Aleman',
  it: 'Italiano',
  pt: 'Portugues',
  zh: 'Chino',
  ja: 'Japones',
  ko: 'Coreano',
  ru: 'Ruso',
  ar: 'Arabe',
}

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Se requiere el texto a traducir' },
        { status: 400 }
      )
    }

    const sourceLanguage = languageNames[sourceLang] || sourceLang
    const targetLanguage = languageNames[targetLang] || targetLang

    const systemPrompt = `Eres un traductor profesional experto. Tu tarea es traducir texto de ${sourceLanguage} a ${targetLanguage}.
- Mantiene el significado, tono y estilo del texto original
- Usa expresiones naturales en el idioma de destino
- Preserva el formato del texto (parrafos, listas, etc.)
- No añadas explicaciones ni comentarios, solo devuelve la traduccion
- Si hay terminos tecnicos o nombres propios, mantenlos apropiadamente`

    const { text: translation } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Traduce el siguiente texto:\n\n${text}`,
      maxTokens: 2000,
    })

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error translating text:', error)
    return NextResponse.json(
      { error: 'Error al traducir. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
