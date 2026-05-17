'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Mail, Lock, User, Loader2, Sparkles, Check } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const passwordRequirements = [
    { label: 'Minimo 8 caracteres', valid: password.length >= 8 },
    { label: 'Al menos una mayuscula', valid: /[A-Z]/.test(password) },
    { label: 'Al menos un numero', valid: /[0-9]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordRequirements.every(req => req.valid)) {
      setError('La contrasena no cumple con los requisitos')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Ocurrio un error. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl md:text-3xl font-sentient mb-4">
            Registro <span className="text-primary">Exitoso!</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm mb-8">
            Hemos enviado un email de confirmacion a <strong className="text-foreground">{email}</strong>. 
            Por favor verifica tu correo para activar tu cuenta.
          </p>
          <Link href="/auth/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Ir a Iniciar Sesion
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-sentient">
            Crea tu cuenta en <span className="text-primary">PSX.ai</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            Accede a todas las herramientas gratis
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                required
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crea una contrasena"
                required
                className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Requirements */}
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.valid ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {req.valid && <Check className="w-3 h-3" />}
                  </div>
                  <span className={req.valid ? 'text-success' : 'text-muted-foreground'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" required className="rounded border-border mt-1" id="terms" />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              Acepto los{' '}
              <Link href="/terminos" className="text-primary hover:underline">
                Terminos de Servicio
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" className="text-primary hover:underline">
                Politica de Privacidad
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 h-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta Gratis'
            )}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Inicia sesion
          </Link>
        </p>

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center mb-4 font-mono">
            Con tu cuenta gratuita obtienes:
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              'Acceso a todas las herramientas',
              'Guardar favoritos',
              'Historial de uso',
              '100 llamadas API/mes',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
