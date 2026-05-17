'use client'

import { useState } from 'react'
import { Tool } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Check, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpellCheckerToolProps {
  tool: Tool
}

interface Correction {
  original: string
  corrected: string
  type: 'spelling' | 'grammar' | 'punctuation'
  explanation: string
}

export function SpellCheckerTool({ tool }: SpellCheckerToolProps) {
  const [inputText, setInputText] = useState('')
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [correctedText, setCorrectedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    if (!inputText.trim()) {
      setError('Por favor ingresa el texto a corregir')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/tools/spell-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar ortografia')
      }

      setCorrections(data.corrections || [])
      setCorrectedText(data.correctedText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(correctedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyCorrection = (correction: Correction) => {
    setInputText(inputText.replace(correction.original, correction.corrected))
  }

  const typeLabels = {
    spelling: { label: 'Ortografia', color: 'text-destructive bg-destructive/10' },
    grammar: { label: 'Gramatica', color: 'text-amber-500 bg-amber-500/10' },
    punctuation: { label: 'Puntuacion', color: 'text-blue-500 bg-blue-500/10' },
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Texto a Corregir
        </h2>

        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe o pega el texto que deseas corregir..."
            rows={10}
            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          />

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleCheck}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verificar Ortografia
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resultados</h2>
          {correctedText && (
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {corrections.length > 0 ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="font-medium">
                  {corrections.length} {corrections.length === 1 ? 'correccion' : 'correcciones'} encontrada{corrections.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Corrections List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {corrections.map((correction, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-mono",
                        typeLabels[correction.type].color
                      )}>
                        {typeLabels[correction.type].label}
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="line-through text-destructive/80">
                          {correction.original}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-success font-medium">
                          {correction.corrected}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {correction.explanation}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyCorrection(correction)}
                      className="text-xs"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Corrected Text */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Texto Corregido</h3>
              <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                <p className="whitespace-pre-wrap text-foreground/90">
                  {correctedText}
                </p>
              </div>
            </div>
          </div>
        ) : correctedText ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-lg font-medium text-success">Sin errores encontrados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tu texto no tiene errores ortograficos o gramaticales.
            </p>
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center text-muted-foreground text-center">
            <div>
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Las correcciones apareceran aqui</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
