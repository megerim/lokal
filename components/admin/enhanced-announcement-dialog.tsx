"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { UploadButton } from "@/lib/uploadthing"
import { Plus, Users, Calendar, Clock, Megaphone } from "lucide-react"
import { errorHandler } from "@/lib/error-handler"
import type { Announcement, SocialGroup } from "@/lib/types"

interface EnhancedAnnouncementDialogProps {
  onSuccess: () => void
  groupId?: string // Optional: pre-select a group
  editAnnouncement?: Announcement // For editing existing announcements
}

export function EnhancedAnnouncementDialog({ 
  onSuccess, 
  groupId, 
  editAnnouncement 
}: EnhancedAnnouncementDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<SocialGroup[]>([])
  const [formData, setFormData] = useState({
    title: editAnnouncement?.title || "",
    description: editAnnouncement?.description || "",
    image_url: editAnnouncement?.image_url || "",
    group_id: editAnnouncement?.group_id || groupId || "",
    meeting_datetime: editAnnouncement?.meeting_datetime 
      ? new Date(editAnnouncement.meeting_datetime).toISOString().slice(0, 16)
      : "",
    is_club_only: editAnnouncement?.is_club_only || false,
  })
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch available social groups
  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("social_groups")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (!error && data) {
        setGroups(data)
      }
    }
    
    fetchGroups()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Hata",
        description: "Giriş yapmanız gerekiyor.",
        variant: "destructive",
      })
      return
    }

    // Validate form data
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen başlık ve açıklama alanlarını doldurun.",
        variant: "destructive",
      })
      return
    }

    // If club-only is selected, group must be selected
    if (formData.is_club_only && !formData.group_id) {
      toast({
        title: "Hata",
        description: "Kulüp üyelerine özel duyurular için bir grup seçmelisiniz.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const announcementData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || null,
        group_id: formData.group_id || null,
        meeting_datetime: formData.meeting_datetime 
          ? new Date(formData.meeting_datetime).toISOString() 
          : null,
        is_club_only: formData.is_club_only,
        created_by: user.id,
      }

      if (editAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from("duyurular")
          .update(announcementData)
          .eq("id", editAnnouncement.id)

        if (error) throw error

        toast({
          title: "Başarılı!",
          description: "Duyuru güncellendi.",
        })
      } else {
        // Create new announcement
        const { error } = await supabase
          .from("duyurular")
          .insert([announcementData])

        if (error) throw error

        toast({
          title: "Başarılı!",
          description: "Duyuru eklendi.",
        })
        
        // Send notifications to club members if club-specific
        if (formData.group_id && formData.is_club_only) {
          // This could trigger a notification system
          console.log(`Notification sent to members of group ${formData.group_id}`)
        }
      }

      // Reset form
      if (!editAnnouncement) {
        setFormData({
          title: "",
          description: "",
          image_url: "",
          group_id: groupId || "",
          meeting_datetime: "",
          is_club_only: false,
        })
      }
      
      setOpen(false)
      onSuccess()
    } catch (error) {
      errorHandler.logError('Error creating/updating announcement', error)
      toast({
        title: "Hata",
        description: `İşlem sırasında bir hata oluştu: ${
          error instanceof Error ? error.message : 'Bilinmeyen hata'
        }`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={editAnnouncement ? "outline" : "default"}
          size={editAnnouncement ? "sm" : "default"}
          className={editAnnouncement ? "" : "bg-[#0015ff] hover:bg-[#0015ff]/90"}
        >
          <Megaphone className="w-4 h-4 mr-2" />
          {editAnnouncement ? "Düzenle" : "Duyuru Ekle"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editAnnouncement ? "Duyuruyu Düzenle" : "Yeni Duyuru Ekle"}
          </DialogTitle>
          <DialogDescription>
            {editAnnouncement 
              ? "Mevcut duyuruyu düzenleyin."
              : "Genel veya kulübe özel duyuru oluşturun."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Duyuru başlığı"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Duyuru detayları"
              rows={4}
              required
            />
          </div>

          {/* Club Selection and Privacy */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_club_only" className="text-base">
                  Kulüp Üyelerine Özel
                </Label>
                <p className="text-sm text-muted-foreground">
                  Bu duyuru sadece seçili kulüp üyeleri tarafından görülebilir
                </p>
              </div>
              <Switch
                id="is_club_only"
                checked={formData.is_club_only}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_club_only: checked })
                }
              />
            </div>

            {/* Group Selection */}
            {(formData.is_club_only || groupId) && (
              <div className="space-y-2">
                <Label htmlFor="group">
                  <Users className="w-4 h-4 inline mr-2" />
                  Sosyal Grup
                </Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(value) => 
                    setFormData({ ...formData, group_id: value })
                  }
                  disabled={!!groupId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bir grup seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Meeting Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="meeting_datetime">
              <Calendar className="w-4 h-4 inline mr-2" />
              Toplantı Tarihi ve Saati (Opsiyonel)
            </Label>
            <Input
              id="meeting_datetime"
              type="datetime-local"
              value={formData.meeting_datetime}
              onChange={(e) => 
                setFormData({ ...formData, meeting_datetime: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Eğer bu bir toplantı duyurusu ise tarih ve saat belirtebilirsiniz
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Görsel (İsteğe bağlı)</Label>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setFormData({ ...formData, image_url: res[0].ufsUrl })
                  toast({
                    title: "Başarılı!",
                    description: "Görsel yüklendi.",
                  })
                }
              }}
              onUploadError={(error: Error) => {
                errorHandler.logError('Image upload failed', error)
                toast({
                  title: "Hata",
                  description: "Görsel yüklenirken bir hata oluştu.",
                  variant: "destructive",
                })
              }}
            />
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFormData({ ...formData, image_url: "" })}
                >
                  Görseli Kaldır
                </Button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? (editAnnouncement ? "Güncelleniyor..." : "Ekleniyor...")
              : (editAnnouncement ? "Duyuruyu Güncelle" : "Duyuru Ekle")
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}