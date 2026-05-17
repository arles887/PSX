'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GL } from "./gl"
import { PSXLogo } from "./psx-logo"
import { Button } from "./ui/button"
import { 
  Search, 
  Sparkles, 
  Calculator, 
  FileText, 
  Languages, 
  TrendingUp,
  ArrowRight,
  Zap
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Tool, TrendingKeyword } from "@/lib/types"

const quickLinks = [
  { label: "Generador de Texto", href: "/herramientas/generador-texto-ia", icon: FileText },
  { label: "Traductor IA", href: "/herramientas/traductor-ia", icon: Languages },
  { label: "Calculadora Prestamos", href: "/finanzas/calculadora-prestamos", icon: Calculator },
  { label: "Interes Compuesto", href: "/finanzas/calculadora-interes-compuesto", icon: TrendingUp },
]

export function Hero() {
  const [hovering, setHovering] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([])
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<Tool[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Fetch trending keywords
    const fetchTrending = async () => {
      const { data } = await supabase
        .from('trending_keywords')
        .select('*')
        .order('search_count', { ascending: false })
        .limit(6)
      
      if (data) setTrendingKeywords(data)
    }

    // Fetch featured tools
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('tools')
        .select('*, category:categories(*)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(4)
      
      if (data) setFeaturedTools(data)
    }

    fetchTrending()
    fetchFeatured()
  }, [])

  useEffect(() => {
    const searchTools = async () => {
      if (searchQuery.length < 2) {
        setSearchSuggestions([])
        return
      }

      const { data } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,keywords.cs.{${searchQuery}}`)
        .limit(5)
      
      if (data) setSearchSuggestions(data)
    }

    const debounce = setTimeout(searchTools, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    router.push(`/buscar?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      <GL hovering={hovering} />

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="mx-auto mb-6 w-fit">
            <PSXLogo size={140} />
          </div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-8">
            <Sparkles className="w-4 h-4" />
            Plataforma de Herramientas IA
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sentient leading-tight">
            Potencia tu <br className="hidden sm:block" />
            <span className="text-primary">productividad</span> con IA
          </h1>

          {/* Subtitle */}
          <p className="font-mono text-base md:text-lg text-foreground/60 mt-6 max-w-2xl mx-auto text-balance">
            Herramientas de inteligencia artificial, calculadoras financieras 
            y recursos educativos. Todo gratis y facil de usar.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar herramientas, calculadoras, recursos..."
                className="w-full pl-14 pr-32 py-4 md:py-5 bg-card/80 backdrop-blur-sm border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                <span className="hidden sm:inline">Buscar</span>
                <Search className="w-4 h-4 sm:hidden" />
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                {searchSuggestions.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/herramientas/${tool.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.short_description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Trending Keywords */}
          {trendingKeywords.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">Trending:</span>
              {trendingKeywords.map((keyword) => (
                <button
                  key={keyword.id}
                  onClick={() => handleKeywordClick(keyword.keyword)}
                  className="px-3 py-1 text-sm bg-muted/50 hover:bg-muted rounded-full text-foreground/80 hover:text-foreground transition-colors"
                >
                  {keyword.keyword}
                </button>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col items-center gap-2 p-4 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all duration-300"
                >
                  <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-mono text-foreground/80 group-hover:text-foreground transition-colors text-center">
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Featured Tools Section */}
        {featuredTools.length > 0 && (
          <div className="mt-20 md:mt-28">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-sentient">
                  Herramientas <span className="text-primary">Destacadas</span>
                </h2>
                <p className="text-muted-foreground font-mono text-sm mt-2">
                  Las mas utilizadas por nuestra comunidad
                </p>
              </div>
              <Link href="/herramientas">
                <Button variant="ghost" className="gap-2 group">
                  Ver todas
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/herramientas/${tool.slug}`}
                  className="group relative p-6 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-2xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    {tool.is_premium && (
                      <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full font-mono">
                        PRO
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tool.short_description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {tool.usage_count.toLocaleString()} usos
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "20+", label: "Herramientas IA" },
            { value: "10K+", label: "Usuarios Activos" },
            { value: "100%", label: "Gratis" },
            { value: "24/7", label: "Disponible" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-sentient text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-mono mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
