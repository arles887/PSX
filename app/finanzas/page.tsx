'use client'

import { useState, useEffect } from 'react'
import { PSXLogo } from '@/components/psx-logo'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', category: 'Ventas', amount: 2500, description: 'Venta de servicios AI', date: '2026-05-15' },
  { id: '2', type: 'expense', category: 'Suscripciones', amount: 99, description: 'OpenAI API', date: '2026-05-14' },
  { id: '3', type: 'income', category: 'Freelance', amount: 1200, description: 'Proyecto cliente', date: '2026-05-12' },
  { id: '4', type: 'expense', category: 'Software', amount: 49, description: 'Figma Pro', date: '2026-05-10' },
  { id: '5', type: 'expense', category: 'Marketing', amount: 300, description: 'Ads Google', date: '2026-05-08' },
  { id: '6', type: 'income', category: 'Suscripciones', amount: 890, description: 'Membresías PSX', date: '2026-05-05' },
]

const stats = [
  { label: 'Ingresos del Mes', value: '$4,590', change: '+12.5%', positive: true, icon: TrendingUp },
  { label: 'Gastos del Mes', value: '$448', change: '-8.2%', positive: true, icon: TrendingDown },
  { label: 'Balance Actual', value: '$4,142', change: '+15.3%', positive: true, icon: Wallet },
  { label: 'Ahorros', value: '$12,450', change: '+5.1%', positive: true, icon: PiggyBank },
]

export default function FinanzasPage() {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [supabase] = useState(() => createClient())

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <PSXLogo size={80} />
        <h1 className="text-4xl font-semibold mt-5">Centro de Finanzas</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Gestiona tus ingresos, gastos y analiza el rendimiento financiero de tus proyectos AI.
        </p>
      </div>

      {!user ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <p className="font-semibold">Inicia sesion para acceder a tu panel de finanzas.</p>
          <Button className="mt-4" asChild>
            <a href="/auth/login">Iniciar Sesion</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div 
                  key={stat.label} 
                  className="rounded-[2rem] border border-border bg-card p-6 shadow-xl shadow-primary/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <button className="flex items-center gap-4 rounded-[2rem] border border-border bg-card p-6 hover:border-primary/50 transition-colors group">
              <div className="p-4 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Plus className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Agregar Ingreso</p>
                <p className="text-sm text-muted-foreground">Registra una nueva entrada</p>
              </div>
            </button>
            <button className="flex items-center gap-4 rounded-[2rem] border border-border bg-card p-6 hover:border-primary/50 transition-colors group">
              <div className="p-4 rounded-2xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <CreditCard className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Agregar Gasto</p>
                <p className="text-sm text-muted-foreground">Registra un nuevo gasto</p>
              </div>
            </button>
            <button className="flex items-center gap-4 rounded-[2rem] border border-border bg-card p-6 hover:border-primary/50 transition-colors group">
              <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Ver Reportes</p>
                <p className="text-sm text-muted-foreground">Analisis detallado</p>
              </div>
            </button>
          </div>

          {/* Transactions */}
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl shadow-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Transacciones Recientes</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilter('income')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'income' ? 'bg-green-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
                >
                  Ingresos
                </button>
                <button 
                  onClick={() => setFilter('expense')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'expense' ? 'bg-red-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
                >
                  Gastos
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-background/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category} - {new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-green-500/20 bg-green-500/5 p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Ingresos</p>
              <p className="text-3xl font-bold text-green-500">${totalIncome.toLocaleString()}</p>
            </div>
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Gastos</p>
              <p className="text-3xl font-bold text-red-500">${totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
