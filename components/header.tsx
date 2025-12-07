"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, ChevronDown, Instagram, MessageCircle, Shield, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useState } from "react"

export function Header() {
  const { user, signOut, loading, isAdmin } = useAuth()
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const navItems = [
    { name: "Giriş", href: "/" },
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "Etkinlikler", href: "/duyurular" },
    { name: "Yılbaşı Pazarı", href: "/yilbasi-pazari" },
    { name: "Menü", href: "/menu" },
    { name: "Ürünler", href: "/urunler" },
    { name: "Deneyimler", href: "/sosyal-gruplar" },
    ...(user ? [{ name: "Panel", href: "/dashboard" }] : []),
  ]

  const SocialIcons = () => (
    <div className="flex items-center gap-1 md:gap-2 mr-1 md:mr-3">
      <Link
        href="https://instagram.com/lokal.tekirdag"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 md:p-2 rounded-full hover:bg-muted transition-colors duration-200"
        aria-label="Instagram'da takip edin"
      >
        <Instagram className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      </Link>
    </div>
  )

  return (
    <header
      className="sticky top-0 z-50 w-full border-b-2 bg-background/95 items-center justify-center backdrop-blur supports-[backdrop-filter]:bg-background/60 border-[#0015ff]"
      role="banner"
    >
      <div className="w-full flex h-16 items-center justify-center">
        <div className="hidden md:flex md:items-center md:w-full md:max-w-6xl md:mx-auto">
          {/* Logo - Left */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="font-bold font-quicksand text-4xl bg-gradient-to-r from-[#0015ff] to-[#2563eb] bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                lokal
              </span>
            </Link>
          </div>

          {/* Navigation - Center */}
          <div className="flex items-center">
            <nav className="flex items-center space-x-8 text-sm font-medium" role="navigation" aria-label="Ana navigasyon">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isActive={activeItem === item.name || pathname === item.href}
                  onMouseEnter={() => setActiveItem(item.name)}
                  onMouseLeave={() => setActiveItem(null)}
                />
              ))}
            </nav>
          </div>

          {/* User Menu - Right */}
          <div className="flex items-center justify-end flex-1">
            <SocialIcons />
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative h-9 px-3 rounded-full border-muted-foreground/20 hover:bg-muted transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline-block text-sm font-medium">
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "Kullanıcı"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "Kullanıcı"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Panel
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Yönetim
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
                className="rounded-full bg-gradient-to-r from-[#0015ff] to-[#2563eb] hover:from-[#0015ff]/90 hover:to-[#2563eb]/90 transition-all duration-300"
              >
                <Link href="/auth">Giriş Yap</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center w-full relative px-2">
          <div className="flex items-center">
            <MobileNav />
          </div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="font-bold font-quicksand text-5xl bg-gradient-to-r from-[#0015ff] to-[#2563eb] bg-clip-text text-transparent">
                lokal
              </span>
            </Link>
          </div>

          <div className="flex items-center ml-auto">
            <SocialIcons />
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative h-9 px-3 rounded-full border-muted-foreground/20 hover:bg-muted transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "Kullanıcı"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Panel
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Yönetim
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
                className="rounded-full bg-gradient-to-r from-[#0015ff] to-[#2563eb] hover:from-[#0015ff]/90 hover:to-[#2563eb]/90 transition-all duration-300"
              >
                <Link href="/auth">Giriş Yap</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

interface NavItemProps {
  item: { name: string; href: string };
  pathname: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavItem = ({ item, pathname, isActive, onMouseEnter, onMouseLeave }: NavItemProps) => {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative px-2 py-1.5 transition-all duration-200 hover:text-foreground",
        pathname === item.href ? "text-foreground" : "text-muted-foreground",
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {item.name}
      {isActive && (
        <div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0015ff] to-[#2563eb] rounded-full transition-all duration-200"
        />
      )}
    </Link>
  );
};
