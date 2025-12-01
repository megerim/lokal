"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { ReactNode, useRef } from "react"

interface PageHeroProps {
  title: string | ReactNode
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  className?: string
  accentColor?: string
  showPattern?: boolean
  cta?: {
    label: string
    href: string
    variant?: "primary" | "secondary"
  }
  size?: "sm" | "md" | "lg"
}

export function PageHero({
  title,
  subtitle,
  breadcrumbs,
  className = "",
  accentColor = "#0015ff",
  showPattern = true,
  cta,
  size = "md",
}: PageHeroProps) {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])
  const y = useTransform(scrollY, [0, 300], [0, -30])

  const sizeClasses = {
    sm: "py-16 md:py-20",
    md: "py-20 md:py-28",
    lg: "py-28 md:py-36",
  }

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background with modern gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        {showPattern && (
          <>
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(${accentColor}20 1px, transparent 1px), linear-gradient(90deg, ${accentColor}20 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />

            {/* Animated gradient orbs */}
            <motion.div
              className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.15, 1],
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1.1, 1, 1.1],
                x: [0, -15, 0],
                y: [0, 15, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Decorative floating elements */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/30"
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/3 left-1/5 w-3 h-3 rounded-full bg-primary/20"
              animate={{
                y: [10, -10, 10],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/5 w-1.5 h-1.5 rounded-full bg-primary/40"
              animate={{
                y: [-8, 8, -8],
                x: [-5, 5, -5],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <motion.div
        style={{ y }}
        className={`relative z-10 container mx-auto px-4 ${sizeClasses[size]}`}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav
            className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </motion.nav>
        )}

        {/* Title with gradient text */}
        <motion.div
          className="max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {typeof title === "string" ? (
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h1>
          ) : (
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              {title}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTA Button */}
          {cta && (
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link
                  href={cta.href}
                  className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl ${
                    cta.variant === "secondary"
                      ? "bg-background text-foreground border border-border hover:bg-muted"
                      : "text-white"
                  }`}
                  style={{
                    backgroundColor: cta.variant !== "secondary" ? accentColor : undefined,
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  {cta.label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.section>
  )
}