"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { UploadButton } from "@/lib/uploadthing"
import { Plus } from "lucide-react"
import { errorHandler } from "@/lib/error-handler"
import type { Announcement } from "@/lib/types"

interface AddAnnouncementDialogProps {
  onSuccess: () => void
}

interface AnnouncementFormData {
  title: string
  description: string
  image_url: string
}

export function AddAnnouncementDialog({ onSuccess }: AddAnnouncementDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    description: "",
    image_url: "",
  })
  const supabase = useMemo(() => createClient(), [])

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

    setLoading(true)

    try {
      const { data, error } = await supabase.from("duyurular").insert([
        {
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
          created_by: user.id,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Başarılı!",
        description: "Duyuru eklendi.",
      })

      setFormData({ title: "", description: "", image_url: "" })
      setOpen(false)
      onSuccess()
    } catch (error) {
      errorHandler.logError('Error creating announcement', error)
      toast({
        title: "Hata",
        description: `Duyuru eklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0015ff] hover:bg-[#0015ff]/90">
          <Plus className="w-4 h-4 mr-2" />
          Etkinlik Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Duyuru Ekle</DialogTitle>
          <DialogDescription>Yeni bir etkinlik duyurusu oluşturun.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Etkinlik başlığı"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Etkinlik detayları"
              rows={4}
              required
            />
          </div>
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
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ekleniyor..." : "Duyuru Ekle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
