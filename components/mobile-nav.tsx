"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRightIcon as ArrowRightUp, Menu } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function MobileNav() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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

  const socialLinks = [
    { name: "Instagram", href: "https://instagram.com/lokal.tekirdag" },
    { name: "WhatsApp", href: "https://wa.me/905334370266" },
  ]

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-center text-2xl font-bold text-[#0015ff]">Lokal</SheetTitle>
        </SheetHeader>
        <nav className="mt-8">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "block text-xl font-medium hover:text-[#0015ff] transition-colors",
                    pathname === item.href ? "text-[#0015ff]" : "text-foreground",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {!user ? (
              <li>
                <Link
                  href="/auth"
                  onClick={handleLinkClick}
                  className="block text-xl font-medium hover:text-[#0015ff] transition-colors"
                >
                  Giriş Yap
                </Link>
              </li>
            ) : (
              <li>
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut()
                    handleLinkClick()
                  }}
                  className="text-xl font-medium hover:text-[#0015ff] p-0 h-auto"
                >
                  Çıkış Yap
                </Button>
              </li>
            )}
          </ul>
        </nav>
        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex justify-between">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center text-sm text-muted-foreground hover:text-[#0015ff] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
                <ArrowRightUp className="ml-1 h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
