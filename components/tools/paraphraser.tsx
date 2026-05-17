'use client'

import { useState } from 'react'
import { Tool } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParaphraserToolProps {
  tool: Tool
}

const modes = [
  { value: 'standard', label: 'Estandar', description: 'Reescritura equilibrada' },
  { value: 'fluent', label: 'Fluido', description: 'Mas natural y legible' },
  { value: 'formal', label: 'Formal', description: 'Tono profesional' },
  { value: 'creative', label: 'Creativo', description: 'Mas expresivo' },
  { value: 'simple', label: 'Simple', description: 'Facil de entender' },
]

export function ParaphraserTool({ tool }: ParaphraserToolProps) {
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState('standard')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      setError('Por favor ingresa el texto a parafrasear')
      return
    }

    if (inputText.trim().length < 20) {
      setError('El texto debe tener al menos 20 caracteres')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/tools/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, mode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al parafrasear')
      }

      setResult(data.paraphrase)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al parafrasear')
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
          <RefreshCw className="w-5 h-5 text-primary" />
          Texto Original
        </h2>

        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe o pega el texto que deseas parafrasear..."
            rows={8}
            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          />

          {/* Mode Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Modo</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-all text-left",
                    mode === m.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-medium">{m.label}</div>
                  <div className={cn(
                    "text-xs",
                    mode === m.value ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {m.description}
                  </div>
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
            onClick={handleParaphrase}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parafraseando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Parafrasear
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
                onClick={handleParaphrase}
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
          <div className="min-h-[300px] p-4 bg-muted/30 rounded-xl">
            <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {result}
            </p>
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center text-muted-foreground text-center p-4 bg-muted/30 rounded-xl">
            <div>
              <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>El texto parafraseado aparecera aqui</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
