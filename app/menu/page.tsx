"use client"

import { useState, useMemo, useEffect } from "react"
import { MenuHero } from "@/components/menu/menu-hero"
import { MenuGrid } from "@/components/menu/menu-grid"
import { MenuCategories } from "@/components/menu/menu-categories"
import { MenuCategoriesSheet } from "@/components/menu/menu-categories-sheet"
import { menuData, categories } from "@/lib/menu-data"
import { motion, AnimatePresence } from "motion/react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-context"

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isSticky, setIsSticky] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.4 // Approximate hero height
      setIsSticky(window.scrollY > heroHeight)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredItems = useMemo(() => {
    let items = menuData

    if (selectedCategory !== "all") {
      items = items.filter(item => item.category === selectedCategory)
    }

    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter out experiences if user is not logged in
    if (!user) {
      items = items.filter(item => item.category !== "experiences")
    }

    return items
  }, [selectedCategory, searchTerm, user])

  const filteredCategories = useMemo(() => {
    if (!user) {
      return categories.filter(c => c.id !== "experiences")
    }
    return categories
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <MenuHero />

      {/* Sticky Mobile Header */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "lg:hidden fixed top-16 left-0 right-0 z-40",
              "bg-background/95 backdrop-blur-md border-b shadow-sm"
            )}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex gap-3 items-center">
                <MenuCategoriesSheet
                  categories={filteredCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  itemCounts={menuData.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)}
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Menüde ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={cn(
          "container mx-auto px-4 py-4 md:py-6 max-w-7xl",
          isSticky && "lg:pt-4 pt-20" // Add padding top on mobile when sticky is active
        )}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:block lg:w-64 lg:sticky lg:top-24 lg:h-fit">
            <MenuCategories
              categories={filteredCategories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              itemCounts={menuData.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + 1
                return acc
              }, {} as Record<string, number>)}
            />
          </aside>

          <main className="flex-1">
            {/* Mobile Filter & Search - Shown when not sticky */}
            <div className="lg:hidden mb-6">
              <div className="flex gap-3">
                <MenuCategoriesSheet
                  categories={filteredCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  itemCounts={menuData.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)}
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Menüde ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Desktop Search - Hidden on Mobile */}
            <div className="hidden lg:block mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Menüde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <MenuGrid items={filteredItems} />

            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Üzgünüz, aradığınız kriterlere uygun bir yemek bulunamadı.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Farklı bir kategori veya arama terimi deneyebilirsiniz.
                </p>
              </motion.div>
            )}
          </main>
        </div>
      </motion.div>
    </div>
  )
}