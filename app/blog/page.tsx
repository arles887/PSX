'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PSXLogo } from '@/components/psx-logo'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ArrowRight,
  Search,
  Sparkles
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  tags: string[]
  image_url: string
  published_at: string
  read_time: number
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'El Futuro de la IA Generativa en 2026',
    slug: 'futuro-ia-generativa-2026',
    excerpt: 'Exploramos las tendencias mas importantes en inteligencia artificial generativa y como impactaran en los proximos anos.',
    content: '',
    author: 'PSX Team',
    category: 'Tendencias',
    tags: ['IA', 'Futuro', 'Tecnologia'],
    image_url: '/blog/ai-future.jpg',
    published_at: '2026-05-15',
    read_time: 8
  },
  {
    id: '2',
    title: 'Como Optimizar tu Flujo de Trabajo con Herramientas AI',
    slug: 'optimizar-flujo-trabajo-ai',
    excerpt: 'Descubre las mejores practicas para integrar herramientas de IA en tu dia a dia y aumentar tu productividad.',
    content: '',
    author: 'Maria Garcia',
    category: 'Productividad',
    tags: ['Productividad', 'Herramientas', 'Workflow'],
    image_url: '/blog/workflow.jpg',
    published_at: '2026-05-12',
    read_time: 6
  },
  {
    id: '3',
    title: 'GPT-5 vs Claude 4: Comparativa Completa',
    slug: 'gpt5-vs-claude4-comparativa',
    excerpt: 'Analizamos en profundidad las capacidades, ventajas y casos de uso de los dos modelos de lenguaje mas avanzados.',
    content: '',
    author: 'Carlos Rodriguez',
    category: 'Comparativas',
    tags: ['GPT-5', 'Claude', 'LLM'],
    image_url: '/blog/comparison.jpg',
    published_at: '2026-05-10',
    read_time: 12
  },
  {
    id: '4',
    title: 'Guia Completa: Creacion de Imagenes con Midjourney v7',
    slug: 'guia-midjourney-v7',
    excerpt: 'Todo lo que necesitas saber para dominar la ultima version de Midjourney y crear arte digital impresionante.',
    content: '',
    author: 'Ana Martinez',
    category: 'Tutoriales',
    tags: ['Midjourney', 'Arte', 'Tutorial'],
    image_url: '/blog/midjourney.jpg',
    published_at: '2026-05-08',
    read_time: 15
  },
  {
    id: '5',
    title: 'Automatizacion de Marketing con IA: Casos de Exito',
    slug: 'automatizacion-marketing-ia',
    excerpt: 'Empresas que han transformado sus estrategias de marketing usando inteligencia artificial y los resultados obtenidos.',
    content: '',
    author: 'PSX Team',
    category: 'Marketing',
    tags: ['Marketing', 'Automatizacion', 'Casos'],
    image_url: '/blog/marketing.jpg',
    published_at: '2026-05-05',
    read_time: 10
  },
  {
    id: '6',
    title: 'Etica en IA: Consideraciones para Desarrolladores',
    slug: 'etica-ia-desarrolladores',
    excerpt: 'Reflexiones importantes sobre la responsabilidad etica al desarrollar y utilizar sistemas de inteligencia artificial.',
    content: '',
    author: 'Dr. Luis Fernandez',
    category: 'Opinion',
    tags: ['Etica', 'Desarrollo', 'Responsabilidad'],
    image_url: '/blog/ethics.jpg',
    published_at: '2026-05-01',
    read_time: 9
  }
]

const categories = ['Todos', 'Tendencias', 'Productividad', 'Comparativas', 'Tutoriales', 'Marketing', 'Opinion']

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [supabase] = useState(() => createClient())

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPost = filteredPosts[0]
  const otherPosts = filteredPosts.slice(1)

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <PSXLogo size={80} />
        <h1 className="text-4xl font-semibold mt-5">Blog PSX</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Noticias, tutoriales y tendencias sobre inteligencia artificial y herramientas de productividad.
        </p>
      </div>

      {/* Search and Categories */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-5 max-w-2xl mx-auto">
          <Search className="h-5 w-5 text-primary" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar articulos..."
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No se encontraron articulos con estos criterios.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured Post */}
          {featuredPost && (
            <article className="rounded-[2rem] border border-border bg-card overflow-hidden shadow-xl shadow-primary/5">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-primary/50" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.read_time} min
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-semibold mb-4">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                      <span className="mx-2">-</span>
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.published_at).toLocaleDateString()}
                    </div>
                    <Link 
                      href={`/blog/${featuredPost.slug}`}
                      className="flex items-center gap-2 text-primary font-medium hover:underline"
                    >
                      Leer mas <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Other Posts Grid */}
          {otherPosts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((post) => (
                <article 
                  key={post.id}
                  className="rounded-[2rem] border border-border bg-card overflow-hidden shadow-xl shadow-primary/5 hover:border-primary/30 transition-colors group"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Tag className="w-10 h-10 text-primary/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time} min
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mt-16 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 text-center">
        <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Suscribete al Newsletter</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Recibe las ultimas noticias sobre IA y herramientas directamente en tu correo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="tu@email.com"
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Suscribirse
          </button>
        </div>
      </div>
    </div>
  )
}
