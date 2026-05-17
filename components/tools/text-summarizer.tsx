'use client'

import { useState } from 'react'
import { Tool } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Check, AlignLeft, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextSummarizerToolProps {
  tool: Tool
}

const summaryLengths = [
  { value: 'muy-corto', label: 'Muy Corto', description: '1-2 oraciones' },
  { value: 'corto', label: 'Corto', description: '3-5 oraciones' },
  { value: 'medio', label: 'Medio', description: 'Un parrafo' },
  { value: 'detallado', label: 'Detallado', description: 'Varios parrafos' },
]

const summaryStyles = [
  { value: 'puntos', label: 'Puntos Clave' },
  { value: 'narrativo', label: 'Narrativo' },
  { value: 'ejecutivo', label: 'Ejecutivo' },
]

export function TextSummarizerTool({ tool }: TextSummarizerToolProps) {
  const [inputText, setInputText] = useState('')
  const [length, setLength] = useState('corto')
  const [style, setStyle] = useState('puntos')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('Por favor ingresa el texto a resumir')
      return
    }

    if (inputText.trim().length < 50) {
      setError('El texto debe tener al menos 50 caracteres')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/tools/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, length, style }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al resumir texto')
      }

      setResult(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resumir texto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length
  const charCount = inputText.length

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlignLeft className="w-5 h-5 text-primary" />
          Texto Original
        </h2>

        <div className="space-y-4">
          {/* Text Input */}
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pega aqui el texto que deseas resumir..."
              rows={10}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{wordCount} palabras</span>
              <span>{charCount} caracteres</span>
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Longitud del resumen
            </label>
            <div className="grid grid-cols-2 gap-2">
              {summaryLengths.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLength(l.value)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-all text-left",
                    length === l.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-medium">{l.label}</div>
                  <div className={cn(
                    "text-xs",
                    length === l.value ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {l.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Estilo
            </label>
            <div className="flex gap-2">
              {summaryStyles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm rounded-lg border transition-all",
                    style === s.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleSummarize}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resumiendo...
              </>
            ) : (
              <>
                <AlignLeft className="w-4 h-4 mr-2" />
                Resumir Texto
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resumen</h2>
          {result && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSummarize}
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

        {result ? (
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {result}
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              Reduccion: {Math.round((1 - result.length / inputText.length) * 100)}%
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-center">
            <div>
              <AlignLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>El resumen aparecera aqui</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
