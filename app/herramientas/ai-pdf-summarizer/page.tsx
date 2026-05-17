'use client'

import { useState, useEffect } from 'react'
import { createClient as createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { PSXLogo } from '@/components/psx-logo'
import { useAuth } from '@/lib/auth-context'
import { Resource, ToolUsage } from '@/lib/types'

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PDFSummarizerPage() {
  const { user, profile, isLoading } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [history, setHistory] = useState<ToolUsage[]>([])
  const [savedResource, setSavedResource] = useState<Resource | null>(null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const [historyRes, resourcesRes] = await Promise.all([
        fetch('/api/tool-usages').then((res) => res.json()),
        fetch('/api/resources').then((res) => res.json()),
      ])

      if (historyRes.success) setHistory(historyRes.data)
      if (resourcesRes.success) setResources(resourcesRes.data)
    }

    fetchData()
  }, [user])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
  }

  const uploadAndSummarize = async () => {
    if (!file || !user) return

    setError(null)
    setLoading(true)
    setSummary(null)
    setSavedResource(null)

    try {
      const filePath = `pdfs/${Date.now()}_${file.name}`
      const { data, error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      setUploadedPath(data.path)
      const body = { path: data.path, bucket: 'uploads', filename: file.name }
      const res = await fetch('/api/tools/pdf-summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Error al resumir el documento')
      } else {
        setSummary(json.data.summary)
      }
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  const saveSummaryAsResource = async () => {
    if (!summary || !file || !user || !uploadedPath) return

    const publicUrlResponse = supabase.storage.from('uploads').getPublicUrl(uploadedPath)
    const fileUrl = publicUrlResponse.data?.publicUrl || ''

    const payload = {
      title: `Resumen de ${file.name}`,
      description: `Resumen generado para el documento ${file.name}`,
      content: summary,
      file_url: fileUrl,
      file_size: file.size,
      file_type: file.type,
      keywords: ['pdf', 'resumen', 'ia'],
    }

    const res = await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()

    if (!json.success) {
      setError(json.error || 'No se pudo guardar el recurso')
      return
    }

    setSavedResource(json.data)
    setResources((prev) => [json.data, ...prev])
  }

  const addBookmark = async (resourceId: string) => {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource_id: resourceId, resource_type: 'resource' }),
    })
    const json = await res.json()
    if (!json.success) {
      setError(json.error || 'No se pudo guardar el marcador')
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <PSXLogo size={84} />
        <h1 className="text-3xl font-bold mt-6">AI PDF Summarizer</h1>
        <p className="text-muted-foreground mt-2">Sube un PDF y obtén resúmenes profesionales guardables como recursos.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Procesar documento</h2>
              <p className="text-muted-foreground">Crea un resumen con AI y guarda el resultado como recurso para tu biblioteca.</p>
            </div>

            {profile ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left text-sm text-foreground">
                <p className="font-medium">Plan actual: {profile.subscription_tier.toUpperCase()}</p>
                <p className="text-muted-foreground mt-1">Free: 3 resúmenes diarios, Pro: 50 diarios, Enterprise: 500 diarios.</p>
              </div>
            ) : null}

            {!user ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-left">
                <p className="font-semibold text-destructive">Debes iniciar sesión para usar esta herramienta.</p>
                <p className="text-sm text-muted-foreground">La protección de suscripción y el historial de usuario requieren autenticación.</p>
              </div>
            ) : (
              <>
                <input type="file" accept="application/pdf" onChange={handleFile} className="block w-full text-sm text-foreground" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={uploadAndSummarize} disabled={!file || loading}>
                    {loading ? 'Procesando...' : 'Subir y Resumir'}
                  </Button>
                  <Button onClick={saveSummaryAsResource} disabled={!summary}>
                    Guardar resumen como recurso
                  </Button>
                </div>
                {error && <div className="text-destructive mt-4">{error}</div>}
              </>
            )}

            {summary && (
              <div className="rounded-3xl border border-border p-6 bg-background/70">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Resumen generado</h3>
                  {savedResource ? (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs text-success">Recurso guardado</span>
                  ) : null}
                </div>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7">{summary}</div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">Historial de resúmenes</h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay historial todavía. Cada resumen se guarda automáticamente.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-4 text-left">
                    <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="text-sm line-clamp-3">{String(item.output_data?.summary ?? item.output_data)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recursos guardados</h3>
              <span className="text-xs text-muted-foreground">Últimos 5</span>
            </div>
            {resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">Guarda un resumen para crear un recurso que puedas referenciar.</p>
            ) : (
              <div className="space-y-3">
                {resources.slice(0, 5).map((resource) => (
                  <div key={resource.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
                      </div>
                      <button
                        onClick={() => addBookmark(resource.id)}
                        className="rounded-full border border-border px-3 py-1 text-xs text-primary"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
