"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Edit, Upload, X } from "lucide-react"
import Image from "next/image"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

interface EditProductDialogProps {
  product: Product
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function EditProductDialog({ product, onSuccess, trigger }: EditProductDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(product.image_url || "")
  
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    category: product.category,
    is_available: product.is_available,
    display_order: product.display_order.toString()
  })

  useEffect(() => {
    if (open) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        is_available: product.is_available,
        display_order: product.display_order.toString()
      })
      setImageUrl(product.image_url || "")
    }
  }, [open, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("products")
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          is_available: formData.is_available,
          display_order: parseInt(formData.display_order),
          image_url: imageUrl || null,
        })
        .eq("id", product.id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi.",
      })
      
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast({
        title: "Hata",
        description: error?.message || "Ürün güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ürünü Düzenle</DialogTitle>
          <DialogDescription>
            Ürün bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Ürün Adı</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: El Yapımı Seramik Kupa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Açıklama</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ürün hakkında detaylı açıklama..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Fiyat (TL)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cup">Fincan</SelectItem>
                  <SelectItem value="glass">Bardak</SelectItem>
                  <SelectItem value="ceramic">Seramik</SelectItem>
                  <SelectItem value="accessory">Aksesuar</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-display_order">Sıralama</Label>
              <Input
                id="edit-display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
              <Label htmlFor="edit-is_available">Stokta Mevcut</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ürün Görseli</Label>
            {imageUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image
                  src={imageUrl}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-4">
                <UploadButton<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.ufsUrl) {
                      setImageUrl(res[0].ufsUrl)
                      toast({
                        title: "Başarılı",
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
                  appearance={{
                    button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed bg-primary text-primary-foreground text-sm px-3 py-2 rounded-md hover:bg-primary/90",
                    container: "flex flex-col items-center gap-2",
                    allowedContent: "text-xs text-muted-foreground",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}