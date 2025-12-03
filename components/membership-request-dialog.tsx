"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-context"
import { Users, Send } from "lucide-react"
import type { SocialGroup } from "@/lib/types"

interface MembershipRequestDialogProps {
  group: SocialGroup
  onSuccess?: () => void
}

export function MembershipRequestDialog({ group, onSuccess }: MembershipRequestDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Hata",
        description: "Üyelik talebinde bulunmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from("membership_requests")
        .select("id, status")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single()

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast({
            title: "Bilgi",
            description: "Bu grup için zaten bekleyen bir talebiniz var.",
            variant: "default",
          })
          setOpen(false)
          return
        } else if (existingRequest.status === 'approved') {
          toast({
            title: "Bilgi",
            description: "Zaten bu grubun üyesisiniz.",
            variant: "default",
          })
          setOpen(false)
          return
        }
      }

      // Get user profile data
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single()

      // Submit membership request
      const { error } = await supabase.from("membership_requests").insert({
        group_id: group.id,
        user_id: user.id,
        user_name: userProfile?.full_name || user.email?.split('@')[0] || 'Unknown',
        user_email: user.email || '',
        request_message: message,
      })

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Üyelik talebiniz gönderildi. Yönetici onayından sonra gruba katılabilirsiniz.",
      })

      setOpen(false)
      setMessage("")
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error submitting membership request:", error)
      toast({
        title: "Hata",
        description: "Üyelik talebi gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Katılma Talebi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Gruba Katılma Talebi</DialogTitle>
            <DialogDescription>
              <strong>{group.name}</strong> grubuna katılmak için talepte bulunun.
              Yönetici onayından sonra gruba üye olarak ekleneceksiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Mesajınız (Opsiyonel)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kendinizi tanıtın ve neden bu gruba katılmak istediğinizi belirtin..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Bu mesaj grup yöneticisine iletilecektir.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                "Gönderiliyor..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Talep Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}