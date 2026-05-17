'use client'

import { useState } from 'react'
import { Tool } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Check, Languages, ArrowRightLeft, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TranslatorToolProps {
  tool: Tool
}

const languages = [
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'en', name: 'Ingles', flag: '🇺🇸' },
  { code: 'fr', name: 'Frances', flag: '🇫🇷' },
  { code: 'de', name: 'Aleman', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugues', flag: '🇧🇷' },
  { code: 'zh', name: 'Chino', flag: '🇨🇳' },
  { code: 'ja', name: 'Japones', flag: '🇯🇵' },
  { code: 'ko', name: 'Coreano', flag: '🇰🇷' },
  { code: 'ru', name: 'Ruso', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦' },
]

export function TranslatorTool({ tool }: TranslatorToolProps) {
  const [inputText, setInputText] = useState('')
  const [sourceLang, setSourceLang] = useState('es')
  const [targetLang, setTargetLang] = useState('en')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Por favor ingresa el texto a traducir')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/tools/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          sourceLang, 
          targetLang 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al traducir')
      }

      setResult(data.translation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al traducir')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setInputText(result)
    setResult(inputText)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Source Language */}
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-2 block">Idioma de origen</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLanguages}
            className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors mt-6 md:mt-0"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          {/* Target Language */}
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-2 block">Idioma de destino</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Translation Areas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Texto Original
          </h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe o pega el texto a traducir..."
            rows={8}
            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-muted-foreground">
              {inputText.length} caracteres
            </span>
            <Button
              onClick={handleTranslate}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traduciendo...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4 mr-2" />
                  Traducir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Traduccion</h2>
            {result && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTranslate}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mb-4">
              {error}
            </div>
          )}

          {result ? (
            <div className="min-h-[200px] p-4 bg-muted/30 rounded-xl">
              <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                {result}
              </p>
            </div>
          ) : (
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-center p-4 bg-muted/30 rounded-xl">
              <div>
                <Languages className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>La traduccion aparecera aqui</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
