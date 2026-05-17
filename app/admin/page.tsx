'use server'

import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const [{ data: tools }, { data: categories }, { data: users }] = await Promise.all([
    supabase.from('tools').select('id').then(r => r),
    supabase.from('categories').select('id').then(r => r),
    supabase.from('profiles').select('id').then(r => r).catch(() => ({ data: [] })),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Panel central de datos para herramientas, categorías, usuarios y suscripciones.</p>
        </div>
        <a href="/admin/subscriptions" className="inline-flex items-center gap-2 rounded-3xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20">
          Ver suscripciones
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-card rounded-2xl">
          <div className="text-sm text-muted-foreground">Tools</div>
          <div className="text-2xl font-bold mt-2">{tools?.length ?? 0}</div>
        </div>
        <div className="p-6 bg-card rounded-2xl">
          <div className="text-sm text-muted-foreground">Categories</div>
          <div className="text-2xl font-bold mt-2">{categories?.length ?? 0}</div>
        </div>
        <div className="p-6 bg-card rounded-2xl">
          <div className="text-sm text-muted-foreground">Users</div>
          <div className="text-2xl font-bold mt-2">{users?.length ?? 0}</div>
        </div>
      </div>
    </div>
  )
}
