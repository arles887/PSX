'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Tool } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  ArrowLeft, 
  Bookmark, 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  Loader2,
  Zap,
  Crown,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Tool-specific components
import { TextGeneratorTool } from '@/components/tools/text-generator'
import { TextSummarizerTool } from '@/components/tools/text-summarizer'
import { TranslatorTool } from '@/components/tools/translator'
import { ParaphraserTool } from '@/components/tools/paraphraser'
import { SpellCheckerTool } from '@/components/tools/spell-checker'
import { ChatbotTool } from '@/components/tools/chatbot'

const toolComponents: Record<string, React.ComponentType<{ tool: Tool }>> = {
  'generador-texto-ia': TextGeneratorTool,
  'resumidor-texto': TextSummarizerTool,
  'traductor-ia': TranslatorTool,
  'parafraseador': ParaphraserTool,
  'corrector-ortografico': SpellCheckerTool,
  'chatbot-ia': ChatbotTool,
}

export default function ToolPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, profile } = useAuth()
  const supabase = createClient()
  
  const [tool, setTool] = useState<Tool | null>(null)
  const [relatedTools, setRelatedTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchTool = async () => {
      setIsLoading(true)
      
      const { data: toolData } = await supabase
        .from('tools')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      
      if (toolData) {
        setTool(toolData)
        
        // Fetch related tools
        if (toolData.category_id) {
          const { data: relatedData } = await supabase
            .from('tools')
            .select('*, category:categories(*)')
            .eq('category_id', toolData.category_id)
            .eq('is_active', true)
            .neq('id', toolData.id)
            .limit(4)
          
          if (relatedData) setRelatedTools(relatedData)
        }

        // Check if bookmarked/liked
        if (user) {
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('tool_id', toolData.id)
            .single()
          
          setIsBookmarked(!!bookmarkData)

          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('tool_id', toolData.id)
            .single()
          
          setIsLiked(!!likeData)
        }

        // Increment usage count
        await supabase
          .from('tools')
          .update({ usage_count: (toolData.usage_count || 0) + 1 })
          .eq('id', toolData.id)
      }
      
      setIsLoading(false)
    }

    fetchTool()
  }, [slug, user])

  const handleBookmark = async () => {
    if (!user || !tool) {
      router.push('/auth/login')
      return
    }

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', tool.id)
      setIsBookmarked(false)
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, tool_id: tool.id })
      setIsBookmarked(true)
    }
  }

  const handleLike = async () => {
    if (!user || !tool) {
      router.push('/auth/login')
      return
    }

    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', tool.id)
      await supabase
        .from('tools')
        .update({ likes_count: Math.max(0, (tool.likes_count || 0) - 1) })
        .eq('id', tool.id)
      setIsLiked(false)
      setTool({ ...tool, likes_count: Math.max(0, (tool.likes_count || 0) - 1) })
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: user.id, tool_id: tool.id })
      await supabase
        .from('tools')
        .update({ likes_count: (tool.likes_count || 0) + 1 })
        .eq('id', tool.id)
      setIsLiked(true)
      setTool({ ...tool, likes_count: (tool.likes_count || 0) + 1 })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: tool?.name,
        text: tool?.description,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-8" />
          <div className="h-12 bg-muted rounded w-3/4 mb-4" />
          <div className="h-6 bg-muted rounded w-1/2 mb-8" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
        <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Herramienta no encontrada</h1>
        <p className="text-muted-foreground mb-6">
          La herramienta que buscas no existe o ha sido desactivada.
        </p>
        <Link href="/herramientas">
          <Button>Ver todas las herramientas</Button>
        </Link>
      </div>
    )
  }

  // Check if premium tool requires subscription
  const requiresPremium = tool.is_premium && profile?.subscription_tier === 'free'
  const ToolComponent = toolComponents[tool.slug]

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Back Button */}
      <Link 
        href="/herramientas"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a herramientas
      </Link>

      {/* Tool Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-sentient">{tool.name}</h1>
              {tool.is_featured && (
                <Star className="w-5 h-5 text-primary fill-primary" />
              )}
              {tool.is_premium && (
                <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full font-mono flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  PRO
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{tool.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {tool.usage_count.toLocaleString()} usos
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {tool.likes_count} likes
              </span>
              {tool.category && (
                <span className="px-2 py-0.5 bg-muted rounded-full">
                  {tool.category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={cn(isBookmarked && "text-primary")}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-primary")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(isLiked && "text-destructive")}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-destructive")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Premium Gate */}
      {requiresPremium ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Herramienta Premium</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Esta herramienta requiere una suscripcion PRO. Actualiza tu plan para acceder a todas las funciones.
          </p>
          <Link href="/pricing">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Ver Planes PRO
            </Button>
          </Link>
        </div>
      ) : ToolComponent ? (
        <ToolComponent tool={tool} />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Herramienta en Desarrollo</h2>
          <p className="text-muted-foreground">
            Esta herramienta estara disponible proximamente.
          </p>
        </div>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl md:text-2xl font-sentient mb-6">
            Herramientas <span className="text-primary">Relacionadas</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.id}
                href={`/herramientas/${relatedTool.slug}`}
                className="group p-5 bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-xl transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                  {relatedTool.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {relatedTool.short_description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
