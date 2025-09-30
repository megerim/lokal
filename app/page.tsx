"use client"

import { useState, useEffect } from "react"
import { LandingHero } from "@/components/landing-hero"
import { FeatureSection } from "@/components/feature-section"
import Lokal from "@/components/lokal"
import { Gallery4 } from "@/components/blocks/gallery"

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
            href: "/duyurularler",
            image: "/swipe1.jpeg",
          },
          {
            id: "mum-atolyesi",
            title: "Mum Atölyesi",
            description: "Doğal malzemelerle kendi kokulu mumunu yap.",
            href: "/duyurularler",
            image: "/swipe2.jpeg",
          },
          {
            id: "dokulu-tablo-atolyesi",
            title: "Dokulu Tablo Atölyesi",
            description: "Farklı materyallerle dokulu sanat çalışmaları.",
            href: "/duyurularler",
            image: "/tablo.jpeg",
          },
          {
            id: "seramik-atolyesi",
            title: "Seramik Atölyesi",
            description: "Çamurla şekillendir, fırınla ve kendi eserini üret.",
            href: "/duyurularler",
            image: "/hero7.jpeg",
          },
          {
            id: "kitap-kulubu",
            title: "Kitap Kulübü",
            description: "Aylık seçkiler, tartışmalar ve yeni keşifler.",
            href: "/duyurularler",
            image: "/hero8.jpeg",
          },
          {
            id: "sinema-kulubu",
            title: "Sinema Kulübü",
            description: "Gösterimler sonrası keyifli sohbetler ve analizler.",
            href: "/duyurularler",
            image: "/placeholder.jpg",
          },
        ]}
      />
      <FeatureSection />
      
    </div>
  )
}
