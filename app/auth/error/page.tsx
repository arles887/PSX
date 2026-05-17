'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl md:text-3xl font-sentient mb-4">
          Error de <span className="text-destructive">Autenticacion</span>
        </h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">
          Hubo un problema al procesar tu solicitud de autenticacion. 
          Esto puede ocurrir si el enlace ha expirado o ya fue utilizado.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Login
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
