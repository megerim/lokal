import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Yılbaşı Pazarı 2025 | Lokal Cafe",
    description: "28-29 Aralık 2025 tarihlerinde Lokal Cafe'de düzenlenen Yılbaşı Pazarı'na katılın! El yapımı ürünler, tasarım hediyelikler, Noel baba, oyunlar ve daha fazlası sizi bekliyor. Süleymanpaşa, Tekirdağ.",
    keywords: ["yılbaşı pazarı", "lokal cafe", "tekirdağ", "süleymanpaşa", "el yapımı ürünler", "noel", "yeni yıl", "stant başvurusu", "2025"],
    openGraph: {
        title: "Yılbaşı Pazarı 2025 | Lokal Cafe",
        description: "28-29 Aralık 2025 tarihlerinde Lokal Cafe'de düzenlenen Yılbaşı Pazarı'na katılın! El yapımı ürünler, tasarım hediyelikler ve daha fazlası.",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Yılbaşı Pazarı 2025 | Lokal Cafe",
        description: "28-29 Aralık 2025 tarihlerinde Lokal Cafe'de düzenlenen Yılbaşı Pazarı'na katılın!",
    },
}

export default function YilbasiPazariLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
