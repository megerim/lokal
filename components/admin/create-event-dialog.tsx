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
import type { Activity } from "@/lib/types"

interface CreateEventDialogProps {
  onSuccess: () => void
}

interface EventFormData {
  title: string
  description: string
  image_url: string
  date: string
  time: string
  location: string
}

export function CreateEventDialog({ onSuccess }: CreateEventDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    image_url: "",
    date: "",
    time: "",
    location: "",
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
      if (!formData.title.trim() || !formData.description.trim() || !formData.date.trim() || !formData.time.trim() || !formData.location.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen başlık ve açıklama alanlarını doldurun.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString()
      const { data, error } = await supabase.from("activities").insert([
        {
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
          created_by: user.id,
          date_time: dateTime,
          location: formData.location,
          activity_type: null,
          duration_hours: null,
          max_participants: null,
          managed_by: null,
          request_id: null,
          group_id: null,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Başarılı!",
        description: "Etkinlik oluşturuldu.",
      })

      setFormData({ title: "", description: "", image_url: "", date: "", time: "", location: "" })
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error('Detailed Supabase Error:', JSON.stringify(error, null, 2));
      errorHandler.logError('Error creating event', error)
      toast({
        title: "Hata",
        description: `Etkinlik oluşturulurken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
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
          <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
          <DialogDescription>Yeni bir etkinlik oluşturun. Tüm alanları doldurun.</DialogDescription>
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
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Etkinlik konumu"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tarih</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Saat</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
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
            {loading ? "Oluşturuluyor..." : "Etkinlik Oluştur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
