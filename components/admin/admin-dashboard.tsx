"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddAnnouncementDialog } from "@/components/admin/add-announcement-dialog"
import { EditAnnouncementDialog } from "@/components/admin/edit-announcement-dialog"
import { ParticipantsDialog } from "@/components/admin/participants-dialog"
import { ActivityRequestsDialog } from "@/components/admin/activity-requests-dialog"
import { SocialGroupsManager } from "@/components/admin/social-groups-manager"
import { ProductsManager } from "@/components/admin/products-manager"
import { MarketApplications } from "@/components/admin/market-applications"
import { ParticipationRequestsManager } from "@/components/admin/participation-requests-manager"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import { Calendar, Users, Edit, Trash2, Megaphone, UsersRound, Package, Send, QrCode, ArrowRight, MessageSquare, Store, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface Announcement {
  id: string
  title: string
  description: string
  image_url?: string
  created_at: string
  katilimcilar?: Array<{
    id: string
    user_name: string
    user_email: string
  }>
}

export function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("announcements")
  const supabase = useMemo(() => createClient(), [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("duyurular")
        .select(`
          *,
          katilimcilar (
            id,
            user_name,
            user_email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setAnnouncements(data || [])
    } catch (error) {
      errorHandler.logError('Error fetching announcements', error)
      toast({
        title: "Hata",
        description: "Duyurular yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) return

    try {
      const { error } = await supabase.from("duyurular").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Duyuru silindi.",
      })

      fetchAnnouncements()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Duyuru silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  if (authLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
        <p className="text-gray-600">Admin paneline erişmek için giriş yapmanız gerekiyor.</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h2>
        <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        <p className="text-gray-500 mt-2 text-sm">Sadece admin kullanıcılar bu panele erişebilir.</p>
      </div>
    )
  }

  const tabItems = [
    { value: "announcements", label: "Duyurular", icon: Megaphone },
    { value: "participation-requests", label: "Katılım Talepleri", icon: CreditCard },
    { value: "social-groups", label: "Sosyal Gruplar", icon: UsersRound },
    { value: "products", label: "Ürünler", icon: Package },
    { value: "market-applications", label: "Yılbaşı Pazarı", icon: Store },
    { value: "vouchers", label: "Kuponlar", icon: QrCode },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Paneli</h1>
            <p className="text-slate-300 text-lg">
              Cafe aktivitelerini, sosyal grupları ve içerikleri yönetin.
            </p>
          </div>
          <ActivityRequestsDialog
            trigger={
              <Button className="bg-white text-slate-900 hover:bg-slate-100 border-none font-medium shadow-sm transition-all hover:shadow-md">
                <MessageSquare className="w-4 h-4 mr-2" />
                Aktivite Talepleri
              </Button>
            }
          />
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 blur-3xl transform rotate-12 translate-x-10" />
        <div className="absolute bottom-0 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        {/* Modern Pill Tabs */}
        <div className="sticky top-4 z-30 bg-gray-50/80 backdrop-blur-md py-2 -mx-4 px-4">
          <TabsList className="w-full justify-start h-auto p-1 bg-white/80 border border-gray-200 rounded-full shadow-sm overflow-x-auto">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex items-center gap-2 px-6 py-3 rounded-full data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="announcements" className="mt-0 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                Duyurular & Etkinlikler
              </h2>
              <AddAnnouncementDialog onSuccess={fetchAnnouncements} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white group">
                  {announcement.image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={announcement.image_url || "/placeholder.svg"}
                        alt={announcement.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(announcement.created_at).toLocaleDateString("tr-TR")}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader className={announcement.image_url ? "pt-4" : "pt-6"}>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {announcement.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-2 text-sm mb-4">
                      {announcement.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{announcement.katilimcilar?.length || 0}</span>
                      <span className="ml-1">katılımcı</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0 pb-6">
                    <ParticipantsDialog
                      announcement={announcement}
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1 rounded-full hover:bg-blue-50 hover:text-blue-600 border-gray-200">
                          <Users className="w-4 h-4 mr-1" />
                          Katılımcılar
                        </Button>
                      }
                    />
                    <div className="flex gap-1">
                      <EditAnnouncementDialog
                        announcement={announcement}
                        onSuccess={fetchAnnouncements}
                        trigger={
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-yellow-50 hover:text-yellow-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                        className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {announcements.length === 0 && !loading && (
              <div className="text-center py-16 px-4 rounded-3xl bg-gray-50 border border-dashed border-gray-200">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Megaphone className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Henüz duyuru yok</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Topluluğunuzu bilgilendirmek için ilk duyurunuzu veya etkinliğinizi oluşturun.
                </p>
                <AddAnnouncementDialog onSuccess={fetchAnnouncements} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="participation-requests" className="mt-0">
            <ParticipationRequestsManager />
          </TabsContent>

          <TabsContent value="social-groups" className="mt-0">
            <SocialGroupsManager />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="market-applications" className="mt-0">
            <MarketApplications />
          </TabsContent>

          <TabsContent value="vouchers" className="mt-0 space-y-6">
            <Card className="border-none shadow-lg rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-purple-600" />
                  Kupon İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link href="/admin/send-voucher" passHref className="block h-full">
                    <div className="h-full p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Send className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Hediye Kuponu Gönder</h3>
                      <p className="text-gray-500 text-sm mb-4">Kullanıcılara özel hediye kahve veya indirim kuponları tanımlayın.</p>
                      <Button className="w-full rounded-full group-hover:bg-purple-600">
                        Kupon Gönder <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Link>

                  <Link href="/admin/redeem-voucher" passHref className="block h-full">
                    <div className="h-full p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <QrCode className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Kupon Okut</h3>
                      <p className="text-gray-500 text-sm mb-4">Müşterilerin QR kodlarını tarayarak kuponlarını kullanın.</p>
                      <Button variant="outline" className="w-full rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                        Kamera Aç <QrCode className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  )
}
