"use client"

import { useState, useEffect } from "react"
import { LandingHero } from "@/components/landing-hero"
import Lokal from "@/components/lokal"
import dynamic from "next/dynamic"

const FeatureSection = dynamic(() => import("@/components/feature-section").then((mod) => mod.FeatureSection))
const Gallery4 = dynamic(() => import("@/components/blocks/gallery").then((mod) => mod.Gallery4))

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // Check if splash has been shown this session
    const hasShownSplash = sessionStorage.getItem("hasShownSplash")

    if (!hasShownSplash) {
      setShowSplash(true)
      sessionStorage.setItem("hasShownSplash", "true")

      // Show splash screen for 2 seconds
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  if (showSplash) {
    return <Lokal />
  }

  return (
    <div className="min-h-screen">
      <LandingHero />
      <Gallery4
        title="Ne sunuyoruz?"
        description="Aktivitelerimiz ve deneyimlerimizden bir seçki. Atölyelere ve kulüplerimize katılarak yeni hobiler edinin."
        items={[
          {
            id: "punch-atolyesi",
            title: "Punch Atölyesi",
            description: "Punch tekniğini öğrenerek kendi tasarımını oluştur.",
            href: "/duyurular",
            image: "/swipe1.jpeg",
          },
          {
            id: "mum-atolyesi",
            title: "Mum Atölyesi",
            description: "Doğal malzemelerle kendi kokulu mumunu yap.",
            href: "/duyurular",
            image: "/mum.jpeg",
          },
          {
            id: "dokulu-tablo-atolyesi",
            title: "Dokulu Tablo Atölyesi",
            description: "Farklı materyallerle dokulu sanat çalışmaları.",
            href: "/duyurular",
            image: "/tablo.jpeg",
          },
          {
            id: "seramik-atolyesi",
            title: "Seramik Atölyesi",
            description: "Çamurla şekillendir, fırınla ve kendi eserini üret.",
            href: "/duyurular",
            image: "/hero7.jpeg",
          },
          {
            id: "kitap-kulubu",
            title: "Kitap Kulübü",
            description: "Aylık seçkiler, tartışmalar ve yeni keşifler.",
            href: "/duyurular",
            image: "/hero8.jpeg",
          },
          {
            id: "sinema-kulubu",
            title: "Sinema Kulübü",
            description: "Gösterimler sonrası keyifli sohbetler ve analizler.",
            href: "/duyurular",
            image: "/placeholder.jpg",
          },
        ]}
      />
      <FeatureSection />

    </div>
  )
}
