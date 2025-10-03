import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AnnouncementParticipationButton } from "../../../components/announcement-participation-button"

type Params = { params: Promise<{ id: string }> }

async function getAnnouncement(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("duyurular")
    .select(
      `*,
       katilimcilar (
         id,
         user_name,
         user_email
       )`
    )
    .eq("id", id)
    .single()

  if (error) {
    return null
  }
  return data as {
    id: string
    title: string
    description: string
    image_url?: string | null
    created_at: string
    katilimcilar?: Array<{
      id: string
      user_name: string
      user_email: string
    }>
  } | null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const announcement = await getAnnouncement(id)
  if (!announcement) return { title: "Duyuru Bulunamadı" }
  return {
    title: announcement.title,
    description: announcement.description?.slice(0, 140),
  }
}

export default async function AnnouncementDetailPage({ params }: Params) {
  const { id } = await params
  const announcement = await getAnnouncement(id)
  if (!announcement) return notFound()

  const createdDate = new Date(announcement.created_at)
  const participantCount = announcement.katilimcilar?.length || 0

  return (
    <div className="min-h-screen">
      <PageHero
        title={
          <>
            {announcement.title}
          </>
        }
        subtitle={announcement.description?.slice(0, 160) || "Etkinlik detaylarını görüntüleyin ve katılımınızı belirtin."}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Duyurular", href: "/duyurular" },
          { label: announcement.title },
        ]}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image / Media */}
          <div className="lg:col-span-2">
            {announcement.image_url ? (
              <div
                className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                style={{ aspectRatio: "4 / 3", maxHeight: "32rem" }}
              >
                <Image
                  src={announcement.image_url}
                  alt={announcement.title}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            ) : (
              <div
                className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500"
                style={{ aspectRatio: "4 / 3", maxHeight: "32rem" }}
              >
                Görsel bulunmuyor
              </div>
            )}

            <Card className="mt-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {createdDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </Badge>
                  <span className="inline-flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-1" /> {participantCount} kişi katılıyor
                  </span>
                </div>

                <p className="leading-7 text-gray-800 whitespace-pre-line">{announcement.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-4">
              <AnnouncementParticipationButton announcementId={announcement.id} />

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Katılımcılar</h3>
                  {participantCount === 0 ? (
                    <p className="text-sm text-gray-500">Henüz katılımcı yok. İlk siz katılın!</p>
                  ) : (
                    <ul className="space-y-2 max-h-64 overflow-auto pr-2">
                      {announcement.katilimcilar?.map((p) => (
                        <li key={p.id} className="text-sm text-gray-700">
                          • {p.user_name || p.user_email}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <div className="text-sm text-gray-500">
                <span>Bir sorun mu var? </span>
                <Link href="/iletisim" className="text-[#0015ff] hover:underline">
                  Bizimle iletişime geçin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
