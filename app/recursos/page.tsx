'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PSXLogo } from '@/components/psx-logo'
import { useAuth } from '@/lib/auth-context'
import { Resource } from '@/lib/types'
import { Search, Filter, Bookmark, Download } from 'lucide-react'

export const metadata = {
  title: 'Recursos Guardados | PSX',
  description: 'Gestiona tus recursos guardados, descargas y contenido premium en el panel de PSX.',
  openGraph: {
    title: 'Recursos Guardados | PSX',
    description: 'Gestiona tus recursos guardados y contenido premium con filtros avanzados y SEO optimizado.',
    type: 'website',
    images: ['/psx-favicon.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Guardados | PSX',
    description: 'Gestiona tus recursos guardados y contenido premium con filtros avanzados.',
  },
}

const sortOptions = [
  { value: 'latest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'downloads', label: 'Más descargados' },
]

export default function SavedResourcesPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [search, setSearch] = useState('')
  const [showPremium, setShowPremium] = useState(false)
  const [sort, setSort] = useState('latest')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadResources = async () => {
      setIsLoading(true)
      const res = await fetch('/api/resources')
      const json = await res.json()
      if (json.success) {
        setResources(json.data)
      } else {
        setError(json.error || 'No se pudieron cargar los recursos')
      }
      setIsLoading(false)
    }
    loadResources()
  }, [user])

  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        if (showPremium && !resource.is_premium) return false
        if (!search) return true
        const term = search.toLowerCase()
        return [resource.title, resource.description, resource.content]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      })
      .sort((a, b) => {
        if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        if (sort === 'downloads') return (b.download_count || 0) - (a.download_count || 0)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [resources, search, showPremium, sort])

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <PSXLogo size={80} />
        <h1 className="text-4xl font-semibold mt-5">Recursos Guardados</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Explora tu biblioteca personal de contenido guardado con filtros inteligentes y rendimiento SEO.</p>
      </div>

      {!user ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <p className="font-semibold">Inicia sesión para ver tus recursos guardados.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-5">
              <Search className="h-5 w-5 text-primary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en mis recursos..."
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setShowPremium((value) => !value)}
                className={`rounded-3xl border px-5 py-4 text-sm font-medium transition ${showPremium ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'}`}
              >
                <Filter className="mr-2 inline h-4 w-4" />
                Mostrar premium
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-3xl border border-border bg-card px-5 py-4 text-sm text-foreground outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="h-28 rounded-3xl bg-card animate-pulse" />
              ))
            ) : filteredResources.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">No se encontraron recursos con estos filtros.</div>
            ) : (
              filteredResources.map((resource) => (
                <article key={resource.id} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl shadow-primary/5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-primary font-semibold">
                        <Bookmark className="h-4 w-4" />
                        {resource.is_premium ? 'Premium' : 'Libre'}
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold">{resource.title}</h2>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                    </div>
                    <div className="grid gap-3 text-right">
                      <span className="rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">{new Date(resource.created_at).toLocaleDateString()}</span>
                      <span className="rounded-2xl bg-background/80 px-3 py-2 text-xs text-muted-foreground">Descargas {resource.download_count ?? 0}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={resource.file_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </a>
                    <span className="text-sm text-muted-foreground">{resource.keywords?.join(', ')}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
