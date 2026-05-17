'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Tool, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Sparkles, 
  Star, 
  Zap, 
  Filter,
  Grid3X3,
  List,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  FileText: Sparkles,
  AlignLeft: Sparkles,
  Languages: Sparkles,
  Image: Sparkles,
  CheckCircle: Sparkles,
  RefreshCw: Sparkles,
  Code: Sparkles,
  MessageSquare: Sparkles,
  Calculator: Sparkles,
  TrendingUp: Sparkles,
  DollarSign: Sparkles,
  Home: Sparkles,
  PiggyBank: Sparkles,
  BarChart: Sparkles,
  Lightbulb: Sparkles,
  ListTodo: Sparkles,
  Search: Sparkles,
  Hash: Sparkles,
}

export default function HerramientasPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (categoriesData) setCategories(categoriesData)

      // Fetch tools
      let query = supabase
        .from('tools')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('usage_count', { ascending: false })
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      if (showPremiumOnly) {
        query = query.eq('is_premium', true)
      }

      const { data: toolsData } = await query

      if (toolsData) {
        let filtered = toolsData
        if (searchQuery) {
          filtered = toolsData.filter(tool => 
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        }
        setTools(filtered)
      }
      
      setIsLoading(false)
    }

    fetchData()
  }, [selectedCategory, showPremiumOnly, searchQuery])

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
          <Sparkles className="w-4 h-4" />
          Herramientas de IA
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-sentient">
          Todas las <span className="text-primary">Herramientas</span>
        </h1>
        <p className="text-muted-foreground font-mono text-sm md:text-base mt-4">
          Explora nuestra coleccion de herramientas de inteligencia artificial
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar herramientas..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "flex-shrink-0",
              selectedCategory === null && "bg-primary text-primary-foreground"
            )}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex-shrink-0",
                selectedCategory === category.id && "bg-primary text-primary-foreground"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* View Mode & Premium Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant={showPremiumOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
            className={cn(
              "gap-2",
              showPremiumOnly && "bg-accent/20 text-accent border-accent/30"
            )}
          >
            <Crown className="w-4 h-4" />
            PRO
          </Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground font-mono mb-6">
        {tools.length} herramienta{tools.length !== 1 ? 's' : ''} encontrada{tools.length !== 1 ? 's' : ''}
      </div>

      {/* Tools Grid/List */}
      {isLoading ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-4"
        )}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
              <div className="h-5 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-1" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron herramientas</h3>
          <p className="text-muted-foreground text-sm">
            Intenta con otros filtros o terminos de busqueda
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = iconMap[tool.icon || 'Sparkles'] || Sparkles
            return (
              <Link
                key={tool.id}
                href={`/herramientas/${tool.slug}`}
                className="group relative p-6 bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-2xl transition-all duration-300"
              >
                {tool.is_featured && (
                  <div className="absolute top-4 right-4">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
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
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {tool.short_description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {tool.usage_count.toLocaleString()} usos
                  </span>
                  {tool.category && (
                    <span className="px-2 py-0.5 bg-muted rounded-full">
                      {tool.category.name}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tools.map((tool) => {
            const Icon = iconMap[tool.icon || 'Sparkles'] || Sparkles
            return (
              <Link
                key={tool.id}
                href={`/herramientas/${tool.slug}`}
                className="group flex items-center gap-6 p-6 bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    {tool.is_featured && (
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    )}
                    {tool.is_premium && (
                      <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full font-mono">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {tool.usage_count.toLocaleString()} usos
                    </span>
                    {tool.category && (
                      <span className="px-2 py-0.5 bg-muted rounded-full">
                        {tool.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  Usar
                </Button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
