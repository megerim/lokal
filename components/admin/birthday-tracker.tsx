"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Cake,
  Gift,
  Calendar,
  Coffee,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react"
import { formatDistanceToNow, isToday, isTomorrow, isThisWeek, format } from "date-fns"
import { tr } from "date-fns/locale"

interface BirthdayUser {
  id: string
  user_id: string
  full_name: string
  birthday: string
  phone_number?: string
  has_voucher?: boolean
  coffee_voucher_count?: number
}

export function BirthdayTracker() {
  const [todayBirthdays, setTodayBirthdays] = useState<BirthdayUser[]>([])
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayUser[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingVoucher, setGeneratingVoucher] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const fetchBirthdays = async () => {
    try {
      // Get all users with birthdays
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("*")
        .not("birthday", "is", null)

      if (error) throw error

      if (!profiles) return

      const today = new Date()
      const currentMonth = today.getMonth()
      const currentDay = today.getDate()

      // Categorize birthdays
      const todayList: BirthdayUser[] = []
      const upcomingList: BirthdayUser[] = []

      for (const profile of profiles) {
        const birthday = new Date(profile.birthday)
        const birthMonth = birthday.getMonth()
        const birthDay = birthday.getDate()

        // Check if user already has a birthday voucher this year
        const { data: existingVoucher } = await supabase
          .from("coffee_vouchers")
          .select("id")
          .eq("user_id", profile.user_id)
          .eq("reason", "birthday")
          .gte("created_at", new Date(today.getFullYear(), 0, 1).toISOString())
          .lte("created_at", new Date(today.getFullYear(), 11, 31).toISOString())
          .single()

        const userBirthday: BirthdayUser = {
          ...profile,
          has_voucher: !!existingVoucher
        }

        // Today's birthdays
        if (birthMonth === currentMonth && birthDay === currentDay) {
          todayList.push(userBirthday)
        }
        // Upcoming birthdays (next 7 days)
        else {
          const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay)
          const nextYearBirthday = new Date(today.getFullYear() + 1, birthMonth, birthDay)

          const birthdayToCheck = thisYearBirthday > today ? thisYearBirthday : nextYearBirthday
          const daysUntil = Math.floor((birthdayToCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntil <= 7 && daysUntil > 0) {
            upcomingList.push(userBirthday)
          }
        }
      }

      setTodayBirthdays(todayList)
      setUpcomingBirthdays(upcomingList.sort((a, b) => {
        const aDate = new Date(a.birthday)
        const bDate = new Date(b.birthday)
        return aDate.getDate() - bDate.getDate()
      }))
    } catch (error) {
      console.error("Error fetching birthdays:", error)
      toast({
        title: "Hata",
        description: "Doğum günleri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateBirthdayVoucher = async (user: BirthdayUser) => {
    setGeneratingVoucher(user.user_id)

    try {
      // Generate voucher code
      const voucherCode = `LOKAL-BDAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Create voucher
      const { error } = await supabase.from("coffee_vouchers").insert({
        user_id: user.user_id,
        voucher_code: voucherCode,
        reason: "birthday",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

      if (error) throw error

      // Update voucher count in profile
      await supabase
        .from("user_profiles")
        .update({
          coffee_voucher_count: (user.coffee_voucher_count || 0) + 1
        })
        .eq("user_id", user.user_id)

      toast({
        title: "Başarılı!",
        description: `${user.full_name} için doğum günü kuponu oluşturuldu: ${voucherCode}`,
      })

      // Refresh the list
      fetchBirthdays()
    } catch (error) {
      console.error("Error generating voucher:", error)
      toast({
        title: "Hata",
        description: "Kupon oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setGeneratingVoucher(null)
    }
  }

  // Auto-generate vouchers for today's birthdays
  const autoGenerateVouchers = async () => {
    const usersWithoutVouchers = todayBirthdays.filter(u => !u.has_voucher)

    if (usersWithoutVouchers.length === 0) return

    toast({
      title: "Otomatik Kupon Oluşturma",
      description: `${usersWithoutVouchers.length} kişi için doğum günü kuponu oluşturuluyor...`,
    })

    for (const user of usersWithoutVouchers) {
      await generateBirthdayVoucher(user)
    }
  }

  useEffect(() => {
    fetchBirthdays()
  }, [])

  return (
    <div className="space-y-4">
      {/* Today's Birthdays */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-pink-500" />
                Bugünkü Doğum Günleri
              </CardTitle>
              <CardDescription>
                Bugün doğum günü olan üyeler
              </CardDescription>
            </div>
            {todayBirthdays.some(u => !u.has_voucher) && (
              <Button
                size="sm"
                onClick={autoGenerateVouchers}
                variant="outline"
              >
                <Gift className="w-4 h-4 mr-2" />
                Tüm Kuponları Oluştur
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : todayBirthdays.length > 0 ? (
            <div className="space-y-3">
              {todayBirthdays.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-pink-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Cake className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(user.birthday), "d MMMM", { locale: tr })}
                        {user.phone_number && ` • ${user.phone_number}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.has_voucher ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Kupon Oluşturuldu
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => generateBirthdayVoucher(user)}
                        disabled={generatingVoucher === user.user_id}
                      >
                        <Coffee className="w-4 h-4 mr-2" />
                        Kupon Oluştur
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Cake className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Bugün doğum günü olan üye yok.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Birthdays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Yaklaşan Doğum Günleri
          </CardTitle>
          <CardDescription>
            Önümüzdeki 7 gün içindeki doğum günleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBirthdays.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {upcomingBirthdays.map((user) => {
                  const birthday = new Date(user.birthday)
                  const thisYearBirthday = new Date(
                    new Date().getFullYear(),
                    birthday.getMonth(),
                    birthday.getDate()
                  )

                  return (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(birthday, "d MMMM", { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {isTomorrow(thisYearBirthday)
                          ? "Yarın"
                          : format(thisYearBirthday, "EEEE", { locale: tr })}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Yaklaşan doğum günü yok.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}