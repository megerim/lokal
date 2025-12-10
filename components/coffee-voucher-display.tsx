"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { ensureUserProfile } from "@/lib/supabase/ensure-profile"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Coffee, 
  Gift, 
  Calendar,
  CheckCircle,
  Clock,
  Trophy,
  Star,
  Target
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import type { CoffeeVoucher, UserProfile } from "@/lib/types"
import QRCode from "react-qr-code";

type CoffeeVoucherDisplayProps = {
  variant?: 'default' | 'compact'
}

export function CoffeeVoucherDisplay({ variant = 'default' }: CoffeeVoucherDisplayProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vouchers, setVouchers] = useState<CoffeeVoucher[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVoucher, setSelectedVoucher] = useState<CoffeeVoucher | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Ensure user profile exists
      const { profile: profileData } = await ensureUserProfile(user)
      setProfile(profileData)

      // Fetch user's vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from("coffee_vouchers")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_used", false)
        .order("created_at", { ascending: false })

      if (vouchersError) throw vouchersError
      setVouchers(vouchersData || [])
    } catch (error: any) {
      console.error("Error fetching user data:", error)
      console.error("Error details:", error?.message, error?.details, error?.hint)
      toast({
        title: "Hata",
        description: error?.message || "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user])

  if (!user || loading) {
    return null
  }

  const activeVouchers = vouchers.filter(v => !v.expires_at || new Date(v.expires_at) > new Date())
  const progressPercentage = ((profile?.activity_attendance_count || 0) % 6) * (100 / 6)
  const activitiesToNextVoucher = 6 - ((profile?.activity_attendance_count || 0) % 6)

  const reasonLabels = {
    birthday: { label: "Doğum Günü Hediyesi", icon: Gift, color: "text-pink-600" },
    loyalty: { label: "Sadakat Puanı", icon: Trophy, color: "text-blue-600" },
    special: { label: "Özel Hediye", icon: Star, color: "text-purple-600" }
  }

  let body: React.ReactNode

  if (variant === 'default') {
    body = (
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5" />
              Kahve Kuponlarım
            </CardTitle>
            <CardDescription>
              Kullanılmayı bekleyen kuponlarınız
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeVouchers.length > 0 ? (
              <div className="space-y-3">
                {activeVouchers.map((voucher) => {
                  const reasonInfo = reasonLabels[voucher.reason]
                  const ReasonIcon = reasonInfo.icon
                  return (
                    <div
                      key={voucher.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVoucher(voucher)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${reasonInfo.color}`}>
                            <ReasonIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reasonInfo.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kod: <span className="font-mono">{voucher.voucher_code}</span>
                            </p>
                            {voucher.expires_at && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(voucher.expires_at), {
                                  addSuffix: true,
                                  locale: tr,
                                })} sona eriyor
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Aktif</Badge>
                      </div>
                    </div>
                  )
                })}
                <p className="text-xs text-muted-foreground text-center mt-3">Kuponu kullanmak için tıklayın</p>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aktif kuponunuz bulunmuyor.</p>
                <p className="text-sm mt-2">Aktivitelere katılarak kupon kazanabilirsiniz!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loyalty Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sadakat Programı
            </CardTitle>
            <CardDescription>6 aktiviteye katılın, 1 kahve kazanın!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">İlerleme</span>
                <span className="font-medium">{(profile?.activity_attendance_count || 0) % 6} / 6 Aktivite</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{profile?.activity_attendance_count || 0}</p>
                <p className="text-xs text-muted-foreground">Toplam Katılım</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Coffee className="w-8 h-8 mx-auto mb-2 text-brown-600" />
                <p className="text-2xl font-bold">{profile?.coffee_voucher_count || 0}</p>
                <p className="text-xs text-muted-foreground">Kazanılan Kupon</p>
              </div>
            </div>

            {activitiesToNextVoucher < 6 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-center">
                  <span className="font-medium">{activitiesToNextVoucher}</span> aktiviteye daha katıldığınızda yeni bir kahve kuponu kazanacaksınız!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } else {
    // Compact variant: merged into a single section (to be used inside a parent Card)
    body = (
      <div className="space-y-6">
        {activeVouchers.length > 0 ? (
          <div className="space-y-3">
            {activeVouchers.map((voucher) => {
              const reasonInfo = reasonLabels[voucher.reason]
              const ReasonIcon = reasonInfo.icon
              return (
                <div
                  key={voucher.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedVoucher(voucher)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${reasonInfo.color}`}>
                        <ReasonIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{reasonInfo.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kod: <span className="font-mono">{voucher.voucher_code}</span>
                        </p>
                        {voucher.expires_at && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(voucher.expires_at), {
                              addSuffix: true,
                              locale: tr,
                            })} sona eriyor
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Aktif</Badge>
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-muted-foreground text-center mt-3">Kuponu kullanmak için tıklayın</p>
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            <Coffee className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Aktif kuponunuz bulunmuyor.</p>
          </div>
        )}

        <div className="space-y-3 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">İlerleme</span>
            <span className="font-medium">{(profile?.activity_attendance_count || 0) % 6} / 6 Aktivite</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
              <p className="text-xl font-bold">{profile?.activity_attendance_count || 0}</p>
              <p className="text-xs text-muted-foreground">Toplam Katılım</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <Coffee className="w-6 h-6 mx-auto mb-1 text-brown-600" />
              <p className="text-xl font-bold">{profile?.coffee_voucher_count || 0}</p>
              <p className="text-xs text-muted-foreground">Kazanılan Kupon</p>
            </div>
          </div>
          {activitiesToNextVoucher < 6 && (
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-medium">{activitiesToNextVoucher}</span> aktivite sonra yeni bir kupon!
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {body}
      {selectedVoucher && (
        <Dialog open={!!selectedVoucher} onOpenChange={() => setSelectedVoucher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kahve Kuponu</DialogTitle>
              <DialogDescription>
                Bu kuponu kasada göstererek ücretsiz kahvenizi alabilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg text-center">
                <div style={{ background: 'white', padding: '16px', display: 'inline-block' }}>
                  <QRCode value={selectedVoucher.voucher_code} />
                </div>
                <p className="text-2xl font-bold font-mono mt-4 mb-2">{selectedVoucher.voucher_code}</p>
                <Badge className="mb-4">{reasonLabels[selectedVoucher.reason].label}</Badge>
                {selectedVoucher.expires_at && (
                  <p className="text-sm text-muted-foreground">
                    Son kullanım: {new Date(selectedVoucher.expires_at).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm">Kupon otomatik olarak hesabınıza tanımlanmıştır.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}