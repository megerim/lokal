"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddSocialGroupDialog } from "@/components/admin/add-social-group-dialog"
import { EditSocialGroupDialog } from "@/components/admin/edit-social-group-dialog"
import { GroupMembersDialog } from "@/components/admin/group-members-dialog"
import { useToast } from "@/hooks/use-toast"
import { Users, Calendar, MapPin, Clock, Trash2, Edit, ToggleLeft, ToggleRight } from "lucide-react"
import Image from "next/image"

interface SocialGroup {
  id: string
  name: string
  description: string
  category?: string
  recurring_day?: string
  time?: string
  location?: string
  max_members?: number
  image_url?: string
  is_active: boolean
  created_at: string
  group_members?: Array<{
    id: string
    user_name: string
    user_email: string
  }>
  pending_requests?: { count: number }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  movie: "Film",
  yoga: "Yoga",
  book_club: "Kitap Kulübü",
  art: "Sanat",
  music: "Müzik",
  sports: "Spor",
  cooking: "Yemek",
  technology: "Teknoloji",
  language: "Dil",
  other: "Diğer",
}

const DAY_LABELS: Record<string, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
}

export function SocialGroupsManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [groups, setGroups] = useState<SocialGroup[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("social_groups")
        .select(`
          *,
          group_members (
            id,
            user_name,
            user_email
          ),
          pending_requests:membership_requests(count)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      setGroups(data || [])
    } catch (error) {
      console.error("Error fetching social groups:", error)
      toast({
        title: "Hata",
        description: "Sosyal gruplar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" grubunu silmek istediğinizden emin misiniz?`)) return

    try {
      const { error } = await supabase.from("social_groups").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Sosyal grup silindi.",
      })

      fetchGroups()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Grup silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("social_groups")
        .update({ is_active: !currentStatus })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: `Grup ${!currentStatus ? "aktif" : "pasif"} hale getirildi.`,
      })

      fetchGroups()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Grup durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
        <p className="text-gray-600">Sosyal grupları yönetmek için giriş yapmanız gerekiyor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sosyal Gruplar</h2>
          <p className="text-gray-600">Cafe'deki sosyal aktivite gruplarını yönetin</p>
        </div>
        <AddSocialGroupDialog onSuccess={fetchGroups} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className={`overflow-hidden ${!group.is_active ? "opacity-60" : ""}`}>
            {group.image_url && (
              <div className="relative h-32 w-full">
                <Image
                  src={group.image_url || "/placeholder.svg"}
                  alt={group.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{group.name}</CardTitle>
                <div className="flex flex-col gap-1">
                  {group.category && (
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[group.category] || group.category}
                    </Badge>
                  )}
                  <Badge variant={group.is_active ? "default" : "secondary"} className="text-xs">
                    {group.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 line-clamp-2 text-sm">{group.description}</p>

              <div className="space-y-1 text-sm text-gray-500">
                {group.recurring_day && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{DAY_LABELS[group.recurring_day]}</span>
                    {group.time && (
                      <>
                        <Clock className="w-4 h-4 ml-2 mr-1" />
                        <span>{group.time}</span>
                      </>
                    )}
                  </div>
                )}
                {group.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{group.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>
                    {group.group_members?.length || 0} üye
                    {group.max_members && ` / ${group.max_members} maksimum`}
                  </span>
                </div>
                {group.pending_requests && group.pending_requests[0]?.count > 0 && (
                  <div className="flex items-center text-orange-600 font-medium">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{group.pending_requests[0].count} bekleyen talep</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <GroupMembersDialog
                group={group}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="w-4 h-4 mr-1" />
                    Üyeler
                  </Button>
                }
              />
              <EditSocialGroupDialog
                group={group}
                onSuccess={fetchGroups}
                trigger={
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleActive(group.id, group.is_active)}
                title={group.is_active ? "Pasif yap" : "Aktif yap"}
              >
                {group.is_active ? (
                  <ToggleRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(group.id, group.name)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Henüz sosyal grup yok</h3>
          <p className="text-gray-600">İlk sosyal grubu eklemek için yukarıdaki butonu kullanın.</p>
        </div>
      )}
    </div>
  )
}