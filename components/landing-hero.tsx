"use client"

import Link from "next/link"
import { LayoutGroup, motion } from "motion/react"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { useState, useEffect } from "react"
import { Snowflake, TreePine, CandyCane } from "lucide-react"

interface SnowflakeData {
  id: number
  left: string
  delay: number
  duration: number
  size: number
}

const exampleImages = [
  {
    url: "/christmas/1.webp",
    link: "#",
    author: "Lokal",
    title: "Yılbaşı Pazarı",
  },
  {
    url: "/christmas/2.webp",
    link: "#",
    title: "Yılbaşı Pazarı",
    author: "Lokal",
  },
  {
    url: "/christmas/3.webp",
    link: "#",
    author: "Lokal",
    title: "Yılbaşı Pazarı",
  },
  {
    url: "/christmas/4.webp",
    link: "#",
    author: "Lokal",
    title: "Yılbaşı Pazarı",
  },
  {
    url: "/christmas/5.webp",
    link: "#",
    author: "Lokal",
    title: "Yılbaşı Pazarı",
  },
]

function LandingHero() {
  const [snowflakes, setSnowflakes] = useState<SnowflakeData[]>([])

  // Generate snowflakes only on the client side to avoid hydration mismatch
  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      size: 12 + Math.random() * 12,
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <section className="w-full h-screen overflow-hidden flex flex-col items-center justify-center relative">
      {/* Snowfall Animation */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {snowflakes.map((flake) => (
          <motion.div
            key={flake.id}
            className="absolute text-blue-300/60"
            style={{
              left: flake.left,
            }}
            initial={{ top: -20, opacity: 0 }}
            animate={{
              top: "100%",
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: flake.duration,
              delay: flake.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Snowflake size={flake.size} />
          </motion.div>
        ))}
      </div>

      <Floating sensitivity={-0.5} className="h-full">
        <FloatingElement depth={0.5} className="top-[15%] left-[2%] md:top-[25%] md:left-[5%]">
          <motion.img
            src={exampleImages[0].url}
            alt={exampleImages[0].title}
            className="w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl border-2 border-green-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
        </FloatingElement>

        <FloatingElement depth={1} className="top-[0%] left-[8%] md:top-[6%] md:left-[11%]">
          <motion.img
            src={exampleImages[1].url}
            alt={exampleImages[1].title}
            className="w-40 h-28 sm:w-48 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-12 shadow-2xl rounded-xl border-2 border-green-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
        </FloatingElement>

        <FloatingElement depth={4} className="top-[65%] left-[1%] md:top-[70%] md:left-[8%]">
          <motion.img
            src={exampleImages[2].url}
            alt={exampleImages[2].title}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-60 md:h-60 lg:w-64 lg:h-64 object-cover -rotate-[4deg] hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rounded-xl border-2 border-green-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </FloatingElement>

        <FloatingElement depth={2} className="top-[8%] left-[75%] md:top-[2%] md:left-[83%]">
          <motion.img
            src={exampleImages[3].url}
            alt={exampleImages[3].title}
            className="w-28 h-32 sm:w-36 sm:h-40 md:w-60 md:h-52 lg:w-64 lg:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl border-2 border-green-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          />
        </FloatingElement>

        <FloatingElement depth={1} className="top-[65%] left-[75%] md:top-[60%] md:left-[83%]">
          <motion.img
            src={exampleImages[4].url}
            alt={exampleImages[4].title}
            className="w-36 h-36 sm:w-48 sm:h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[19deg] rounded-xl border-2 border-green-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          />
        </FloatingElement>
      </Floating>

      <div className="flex flex-col justify-center items-center w-[250px] sm:w-[300px] md:w-[500px] lg:w-[700px] pointer-events-auto">
        <motion.h1
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight font-bold tracking-tight space-y-1 md:space-y-4"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <span className="text-shadow-md">Bugüne </span>
          <LayoutGroup>
            <motion.span layout className="flex whitespace-pre">
              <motion.span
                layout
                className="flex whitespace-pre text-shadow-md"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                bir{" "}
              </motion.span>
              <TextRotate
                texts={["kahve", "atölye", "aktivite", "sohbet", "oyun", "tatlı", "mektup", "çay", "kutlama", "yılbaşı"]}
                mainClassName="overflow-hidden pr-3  py-0 pb-2 md:pb-4 rounded-xl"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={3000}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
              <span className="text-shadow-lg">yakışır.</span>
            </motion.span>
          </LayoutGroup>
        </motion.h1>
        <motion.p
          className="text-sm sm:text-lg md:text-xl lg:text-2xl text-center pt-4 sm:pt-8 md:pt-10 lg:pt-12 text-shadow-2xs"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          Yerel aktiviteler ve etkinlikler için buluşma noktanız.<br />Birlikte daha güzel.
        </motion.p>

        <div className="flex flex-col z-20 space-y-4 md:space-y-0 md:space-x-4  md:gap-4 md:flex-row justify-center items-center mt-10 sm:mt-16 md:mt-20 lg:mt-20 text-xs">
          <motion.button
            className="sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-white bg-red-600 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full shadow-2xl border-4 border-green-900"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay: 0.2,
              scale: { duration: 0.1 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", damping: 30, stiffness: 400 },
            }}
          >
            <Link href="/yilbasi-pazari" className="flex items-center gap-2">
              <TreePine className="w-5 h-5" /> Yılbaşı Pazarı <CandyCane className="w-5 h-5" />
            </Link>
          </motion.button>
        </div>
      </div>
    </section>
  )
}

export { LandingHero }
