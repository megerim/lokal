"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Package, Coffee, Wine, Palette, Sparkles, MoreHorizontal, ChevronDown, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Category {
  value: string
  label: string
  icon: React.ReactNode
}

const categories: Category[] = [
  { value: "all", label: "Tümü", icon: <Package className="h-4 w-4" /> },
  { value: "cup", label: "Fincanlar", icon: <Coffee className="h-4 w-4" /> },
  { value: "glass", label: "Bardaklar", icon: <Wine className="h-4 w-4" /> },
  { value: "ceramic", label: "Seramikler", icon: <Palette className="h-4 w-4" /> },
  { value: "accessory", label: "Aksesuarlar", icon: <Sparkles className="h-4 w-4" /> },
  { value: "other", label: "Diğer", icon: <MoreHorizontal className="h-4 w-4" /> },
]

interface CategorySidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categoryCounts: Record<string, number>
  totalCount: number
}

export function CategorySidebar({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  totalCount,
}: CategorySidebarProps) {
  const [open, setOpen] = useState(false)
  const selectedCategoryData = categories.find(c => c.value === selectedCategory) || categories[0]

  return (
    <>
      {/* Mobile Dropdown - Sticky */}
      <div className="lg:hidden sticky top-16 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{selectedCategoryData.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedCategory === "all" ? totalCount : (categoryCounts[selectedCategory] || 0)})
                </span>
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {categories.map((category) => {
              const count = category.value === "all" 
                ? totalCount 
                : (categoryCounts[category.value] || 0)
              const isActive = selectedCategory === category.value

              return (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => {
                    onCategoryChange(category.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between cursor-pointer",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {category.icon}
                    <span>{category.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Kategoriler
              </h3>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {categories.map((category) => {
                  const count = category.value === "all" 
                    ? totalCount 
                    : (categoryCounts[category.value] || 0)
                  const isActive = selectedCategory === category.value

                  return (
                    <li key={category.value}>
                      <button
                        onClick={() => onCategoryChange(category.value)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                          "hover:bg-muted/80",
                          isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn(
                            "p-1.5 rounded-md",
                            isActive ? "bg-primary-foreground/20" : "bg-muted"
                          )}>
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.label}</span>
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          isActive 
                            ? "bg-primary-foreground/20 text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {count}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
