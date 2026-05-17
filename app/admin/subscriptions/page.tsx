'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PSXLogo } from '@/components/psx-logo'
import { Shield, Users, CreditCard, CheckCircle2, XCircle } from 'lucide-react'

interface BillingRecord {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: string | null
  status: string | null
  current_period_end: string | null
  created_at: string
  profile: {
    email: string | null
    full_name: string | null
    subscription_tier: string | null
  } | null
}

export default function AdminSubscriptionsPage() {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/subscriptions')
      const json = await res.json()
      if (json.success) {
        setRecords(json.data)
      } else {
        setError(json.error || 'No se pudo cargar suscripciones')
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setMessage(null)
    const res = await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const json = await res.json()
    if (!json.success) {
      setError(json.error || 'Error al actualizar estado')
      return
    }
    setRecords((prev) => prev.map((record) => (record.id === id ? json.data : record)))
    setMessage('Estado actualizado correctamente')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <PSXLogo size={64} />
          <h1 className="text-3xl font-semibold mt-4">Admin de Suscripciones</h1>
          <p className="text-muted-foreground mt-2">Gestiona los planes activos, estados y registros de pago de los usuarios.</p>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-sm text-muted-foreground">Registros totales: {records.length}</p>
          <Button onClick={() => window.location.reload()} size="sm">Actualizar</Button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">{error}</div>}
      {message && <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-success">{message}</div>}

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-28 rounded-3xl bg-card animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">No hay suscripciones registradas.</div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-[2rem] border border-border bg-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-primary font-semibold">
                    <Shield className="h-4 w-4" />
                    {record.tier?.toUpperCase() ?? 'SIN PLAN'}
                  </div>
                  <p className="text-lg font-semibold">{record.profile?.full_name || 'Usuario sin perfil'}</p>
                  <p className="text-sm text-muted-foreground">{record.profile?.email || 'Sin email'}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Estado Stripe: {record.status || 'desconocido'}</span>
                    <span>Renovación: {record.current_period_end ? new Date(record.current_period_end).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button onClick={() => updateStatus(record.id, 'active')} size="sm" className="bg-success text-background hover:bg-success/90">Activar</Button>
                  <Button onClick={() => updateStatus(record.id, 'canceled')} size="sm" className="bg-destructive text-background hover:bg-destructive/90">Cancelar</Button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border p-4 bg-background/80">
                  <p className="text-xs uppercase text-muted-foreground">Customer ID</p>
                  <p className="break-all text-sm">{record.stripe_customer_id || '-'}</p>
                </div>
                <div className="rounded-2xl border border-border p-4 bg-background/80">
                  <p className="text-xs uppercase text-muted-foreground">Subscription ID</p>
                  <p className="break-all text-sm">{record.stripe_subscription_id || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
