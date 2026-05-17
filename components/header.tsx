'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard,
  Sparkles,
  Calculator,
  BookOpen,
  Download,
  Settings,
  DollarSign
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { PSXLogo } from "./psx-logo"
import { PSXLoader } from "./psx-loader"

const navItems = [
  { href: "/", label: "Inicio", icon: Sparkles },
  { href: "/herramientas", label: "Herramientas", icon: Sparkles },
  { href: "/finanzas", label: "Finanzas", icon: Calculator },
  { href: "/recursos", label: "Recursos", icon: Download },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/blog", label: "Blog", icon: BookOpen },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const { user, profile, signOut, isLoading } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="fixed z-50 top-0 left-0 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <PSXLoader />
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <PSXLogo size={40} />
            <span className="font-sentient text-xl md:text-2xl font-light tracking-tight">
              PSX<span className="text-primary">.ai</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <div className="hidden md:flex items-center gap-2">
                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuario'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Mi Dashboard
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesion
                  </Button>
                </Link>
                <Link href="/auth/registro">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-border/50">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar herramientas, articulos, recursos..."
                className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
            
            <div className="border-t border-border my-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-destructive hover:bg-muted/50 transition-all w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <User className="w-5 h-5" />
                    Iniciar Sesion
                  </Link>
                  <Link
                    href="/auth/registro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-primary hover:bg-primary/10 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    Registrarse Gratis
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
