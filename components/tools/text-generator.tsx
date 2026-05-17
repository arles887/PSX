'use client'

import { useState } from 'react'
import { Tool } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextGeneratorToolProps {
  tool: Tool
}

const tones = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'creativo', label: 'Creativo' },
  { value: 'persuasivo', label: 'Persuasivo' },
]

const types = [
  { value: 'articulo', label: 'Articulo' },
  { value: 'descripcion', label: 'Descripcion de Producto' },
  { value: 'email', label: 'Email' },
  { value: 'post', label: 'Post para Redes' },
  { value: 'historia', label: 'Historia/Narrativa' },
]

export function TextGeneratorTool({ tool }: TextGeneratorToolProps) {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('profesional')
  const [type, setType] = useState('articulo')
  const [length, setLength] = useState('medio')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Por favor ingresa un tema o descripcion')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/tools/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone, type, length }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar texto')
      }

      setResult(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar texto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Configuracion
        </h2>

        <div className="space-y-4">
          {/* Prompt */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tema o descripcion *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe el tema sobre el que quieres generar texto..."
              rows={4}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tipo de contenido
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-all",
                    type === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tono
            </label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-all",
                    tone === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Longitud
            </label>
            <div className="flex gap-2">
              {[
                { value: 'corto', label: 'Corto' },
                { value: 'medio', label: 'Medio' },
                { value: 'largo', label: 'Largo' },
              ].map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLength(l.value)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm rounded-lg border transition-all",
                    length === l.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  {l.label}
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
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Texto
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resultado</h2>
          {result && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
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
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-center">
            <div>
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>El texto generado aparecera aqui</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
