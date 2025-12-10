"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
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

interface EditAnnouncementDialogProps {
  announcement: {
    id: string
    title: string
    description: string
    image_url?: string
  }
  onSuccess: () => void
  trigger: React.ReactNode
}

export function EditAnnouncementDialog({ announcement, onSuccess, trigger }: EditAnnouncementDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: announcement.title,
    description: announcement.description,
    image_url: announcement.image_url || "",
  })
  const supabase = useMemo(() => createClient(), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("duyurular")
        .update({
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
        })
        .eq("id", announcement.id)

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "Duyuru güncellendi.",
      })

      setOpen(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Duyuru güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Duyuru Düzenle</DialogTitle>
          <DialogDescription>Duyuru bilgilerini güncelleyin.</DialogDescription>
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
            <Label>Görsel</Label>
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
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
