"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  TreePine,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Gift
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { motion } from "framer-motion"

interface MarketApplication {
  id: string
  brand_name: string
  product_description: string
  instagram_handle?: string
  logo_url?: string
  participation_days?: string[]
  status: 'pending' | 'approved_waiting_payment' | 'payment_submitted' | 'completed' | 'rejected'
  payment_confirmed_at?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

const statusConfig = {
  pending: {
    label: 'Değerlendirmede',
    description: 'Başvurunuz inceleniyor. En kısa sürede size dönüş yapacağız.',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    badgeVariant: 'secondary' as const,
    step: 1
  },
  approved_waiting_payment: {
    label: 'Ödeme Bekleniyor',
    description: 'Başvurunuz onaylandı! Katılım ücretini ödeyerek yerinizi kesinleştirin.',
    icon: CreditCard,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    badgeVariant: 'outline' as const,
    step: 2
  },
  payment_submitted: {
    label: 'Ödeme Bildirimi Alındı',
    description: 'Ödeme bildiriminiz alındı ve kontrol ediliyor.',
    icon: AlertCircle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    badgeVariant: 'default' as const,
    step: 3
  },
  completed: {
    label: 'Tamamlandı',
    description: 'Tebrikler! Yeriniz kesinleşti. Yılbaşı Pazarı\'nda görüşmek üzere! 🎄',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    badgeVariant: 'default' as const,
    step: 4
  },
  rejected: {
    label: 'Reddedildi',
    description: 'Maalesef başvurunuz bu sefer kabul edilemedi. Gelecek etkinliklerde görüşmek dileğiyle.',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    badgeVariant: 'destructive' as const,
    step: 0
  }
}

// Banka bilgileri
const bankInfo = {
  bankName: "Ziraat Bankası",
  accountHolder: "LOKAL CAFE",
  iban: "TR00 0000 0000 0000 0000 0000 00", // Gerçek IBAN ile değiştirilmeli
  description: "Yılbaşı Pazarı Katılım Ücreti"
}

export function MarketApplicationStatus() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [application, setApplication] = useState<MarketApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchApplication = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('market_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setApplication(data)
    } catch (error: any) {
      console.error("Error fetching market application:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplication()
  }, [user])

  const copyIban = () => {
    navigator.clipboard.writeText(bankInfo.iban.replace(/\s/g, ''))
    setCopied(true)
    toast({
      title: "Kopyalandı",
      description: "IBAN numarası panoya kopyalandı.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const submitPaymentNotification = async () => {
    if (!application) return

    setSubmittingPayment(true)
    try {
      const { error } = await supabase
        .from('market_applications')
        .update({ status: 'payment_submitted' })
        .eq('id', application.id)

      if (error) throw error

      setApplication({ ...application, status: 'payment_submitted' })
      setShowPaymentDialog(false)
      toast({
        title: "Ödeme Bildirimi Gönderildi",
        description: "Ödemeniz kontrol edildikten sonra size bilgi verilecektir.",
      })
    } catch (error: any) {
      console.error("Error submitting payment notification:", error)
      toast({
        title: "Hata",
        description: "Ödeme bildirimi gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setSubmittingPayment(false)
    }
  }

  // Başvuru yoksa veya yükleniyorsa hiçbir şey gösterme
  if (loading || !application) {
    return null
  }

  const status = statusConfig[application.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-red-50/50 to-green-50/50 dark:from-red-950/20 dark:to-green-950/20 group overflow-hidden">
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className={`p-2 ${status.bgColor} rounded-xl ${status.color} group-hover:scale-110 transition-transform duration-300`}>
              <TreePine className="w-6 h-6" />
            </div>
            Yılbaşı Pazarı Başvurusu
          </CardTitle>
          <CardDescription className="text-base">
            {application.brand_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={status.badgeVariant} 
              className={`flex items-center gap-1.5 px-3 py-1 ${
                application.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                application.status === 'payment_submitted' ? 'bg-orange-100 text-orange-700 border-orange-200' : ''
              }`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(application.created_at), "d MMM yyyy", { locale: tr })}
            </span>
          </div>

          {/* Status Description */}
          <p className="text-sm text-muted-foreground">
            {status.description}
          </p>

          {/* Progress Steps (for non-rejected applications) */}
          {application.status !== 'rejected' && (
            <div className="flex items-center gap-1 py-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div 
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      step <= status.step 
                        ? 'bg-green-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Participation Days */}
          {application.participation_days && application.participation_days.length > 0 && (
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Katılım:</span>
              <div className="flex gap-1">
                {application.participation_days.map((day, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Payment Section - Only show when waiting for payment */}
          {application.status === 'approved_waiting_payment' && (
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ödeme Bilgilerini Gör
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Ödeme Bilgileri
                  </DialogTitle>
                  <DialogDescription>
                    Aşağıdaki hesaba havale/EFT yaparak ödemenizi tamamlayın.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Banka</p>
                      <p className="font-medium">{bankInfo.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hesap Sahibi</p>
                      <p className="font-medium">{bankInfo.accountHolder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">IBAN</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-medium flex-1">{bankInfo.iban}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={copyIban}
                          className="h-8 px-2"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Açıklama</p>
                      <p className="font-medium text-sm">{bankInfo.description} - {application.brand_name}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Ödeme açıklamasına marka adınızı yazmayı unutmayın.
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={submitPaymentNotification}
                    disabled={submittingPayment}
                  >
                    {submittingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Ödemeyi Yaptım, Bildirimi Gönder
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Completed Status - Show confirmation */}
          {application.status === 'completed' && application.payment_confirmed_at && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Ödemeniz {format(new Date(application.payment_confirmed_at), "d MMMM yyyy", { locale: tr })} tarihinde onaylandı.
              </p>
            </div>
          )}

          {/* Link to Market Page */}
          <Button variant="ghost" className="w-full justify-between hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 group/btn" asChild>
            <Link href="/yilbasi-pazari">
              Yılbaşı Pazarı Sayfası
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardContent>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-100 dark:bg-red-900/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150" />
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-100 dark:bg-green-900/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150" />
      </Card>
    </motion.div>
  )
}
