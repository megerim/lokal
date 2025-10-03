"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import { Calendar, Users, Clock, Building2, Phone, Mail, FileText, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

const eventTypes = [
  { value: "workshop", label: "Atölye Çalışması" },
  { value: "meeting", label: "Toplantı" },
  { value: "training", label: "Eğitim" },
  { value: "social", label: "Sosyal Etkinlik" },
  { value: "presentation", label: "Sunum" },
  { value: "birthday", label: "Doğum Günü" },
  { value: "other", label: "Diğer" },
]

const participantRanges = [
  { value: "1-5", label: "1-5 kişi" },
  { value: "6-10", label: "6-10 kişi" },
  { value: "11-20", label: "11-20 kişi" },
  { value: "21-50", label: "21-50 kişi" },
  { value: "50+", label: "50+ kişi" },
]

const durationOptions = [
  { value: "1", label: "1 saat" },
  { value: "2", label: "2 saat" },
  { value: "3", label: "3 saat" },
  { value: "4", label: "4 saat" },
  { value: "5+", label: "5+ saat" },
  { value: "full-day", label: "Tam gün" },
]

export function ActivityRequestForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    expectedParticipants: "",
    preferredDate: "",
    duration: "",
    budgetRange: "",
    organizationName: "",
    requesterName: "",
    requesterEmail: "",
    phoneNumber: "",
  })
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    
    if (match) {
      const parts = []
      if (match[1]) parts.push(match[1])
      if (match[2]) parts.push(match[2])
      if (match[3]) parts.push(match[3])
      return parts.join(" ")
    }
    
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData({ ...formData, phoneNumber: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(formData.requesterEmail)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from("etkinlik_talepleri").insert([
        {
          title: formData.title,
          description: formData.description,
          event_type: formData.eventType,
          expected_participants: formData.expectedParticipants,
          preferred_date: formData.preferredDate,
          duration: formData.duration,
          budget_range: formData.budgetRange,
          organization_name: formData.organizationName || null,
          requested_by: user?.id || null,
          requester_name: formData.requesterName,
          requester_email: formData.requesterEmail,
          phone_number: formData.phoneNumber,
          requester_ip: null, // This would be set server-side for security
        },
      ])

      if (error) throw error

      setShowSuccess(true)
      
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          title: "",
          description: "",
          eventType: "",
          expectedParticipants: "",
          preferredDate: "",
          duration: "",
          budgetRange: "",
          organizationName: "",
          requesterName: "",
          requesterEmail: "",
          phoneNumber: "",
        })
        setOpen(false)
      }, 3000)

      toast({
        title: "Başarılı!",
        description: "Aktivite talebiniz gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
      })
    } catch (error) {
      errorHandler.logError('Activity request error', error)
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
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
          size="lg"
          className="bg-[#0015ff] hover:bg-[#0015ff]/90 text-white px-6 md:px-8 lg:px-10 py-5 text-lg md:text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          Tıkla, talep oluştur!
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <AnimatePresence>
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Talebiniz Alındı!</h3>
              <p className="text-gray-600">En kısa sürede sizinle iletişime geçeceğiz.</p>
            </motion.div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Aktivite Talebi</DialogTitle>
                <DialogDescription>
                  Lokal'de yapmak istediğiniz aktivite hakkında detaylı bilgi verin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5" aria-label="Aktivite talebi formu">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Aktivite Başlığı *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="örn. Atölye, Toplantı"
                      required
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Etkinlik Türü *
                    </Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                      required
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Detaylı Açıklama *
                    <span className="text-xs text-gray-500">({formData.description.length}/500)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                    placeholder="Aktivite hakkında detaylı bilgi verin..."
                    rows={4}
                    required
                    className="border-gray-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedParticipants" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Katılımcı Sayısı *
                    </Label>
                    <Select
                      value={formData.expectedParticipants}
                      onValueChange={(value) => setFormData({ ...formData, expectedParticipants: value })}
                      required
                    >
                      <SelectTrigger id="expectedParticipants">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {participantRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Süre *
                    </Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                      required
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tercih Edilen Tarih
                    </Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Kurum/Şirket Adı
                      <span className="text-xs text-gray-500">(opsiyonel)</span>
                    </Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      placeholder="Kurumsal etkinlikler için"
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetRange" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Bütçe Aralığı
                      <span className="text-xs text-gray-500">(opsiyonel)</span>
                    </Label>
                    <Input
                      id="budgetRange"
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      placeholder="örn. 5000-10000 TL"
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">İletişim Bilgileri</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="requesterName" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Adınız Soyadınız *
                      </Label>
                      <Input
                        id="requesterName"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                        placeholder="Ad Soyad"
                        required
                        className="border-gray-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requesterEmail" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-posta *
                        </Label>
                        <Input
                          id="requesterEmail"
                          type="email"
                          value={formData.requesterEmail}
                          onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                          placeholder="email@örnek.com"
                          required
                          className="border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefon *
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="555 555 5555"
                          required
                          maxLength={13}
                          className="border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#0015ff] hover:bg-[#0015ff]/90"
                    disabled={loading}
                  >
                    {loading ? "Gönderiliyor..." : "Gönder"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}