"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus, 
  UserMinus,
  Eye,
  CheckCircle,
  XCircle,
  Heart,
  AlertCircle
} from "lucide-react"
import { format, formatDistanceToNow, isPast, isFuture, isToday, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import type { Activity, ActivityAttendance } from "@/lib/types"

interface ActivityWithAttendance extends Activity {
  attendance?: ActivityAttendance
  participant_count?: number
  is_registered?: boolean
}

export function ActivityTimeline() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [upcomingActivities, setUpcomingActivities] = useState<ActivityWithAttendance[]>([])
  const [pastActivities, setPastActivities] = useState<ActivityWithAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithAttendance | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchActivities = async () => {
    if (!user) return

    try {
      const now = new Date().toISOString()
      
      // Fetch upcoming activities
      const { data: upcomingData, error: upcomingError } = await supabase
        .from("activities")
        .select(`
          *,
          activity_attendance!left (
            id,
            user_id,
            user_name,
            attended,
            checked_in_at,
            created_at
          )
        `)
        .eq("status", "upcoming")
        .gte("date_time", now)
        .order("date_time", { ascending: true })
        .limit(10)

      if (upcomingError) throw upcomingError

      // Fetch past activities
      const { data: pastData, error: pastError } = await supabase
        .from("activities")
        .select(`
          *,
          activity_attendance!left (
            id,
            user_id,
            user_name,
            attended,
            checked_in_at,
            created_at
          )
        `)
        .in("status", ["completed", "cancelled"])
        .lt("date_time", now)
        .order("date_time", { ascending: false })
        .limit(20)

      if (pastError) throw pastError

      // Process activities to add user-specific data
      const processActivities = (activities: any[]): ActivityWithAttendance[] => {
        return activities.map(activity => {
          const userAttendance = activity.activity_attendance?.find((att: any) => att.user_id === user.id)
          return {
            ...activity,
            attendance: userAttendance,
            participant_count: activity.activity_attendance?.length || 0,
            is_registered: !!userAttendance
          }
        })
      }

      setUpcomingActivities(processActivities(upcomingData || []))
      setPastActivities(processActivities(pastData || []))

    } catch (error) {
      errorHandler.logError('Error fetching activities', error)
      toast({
        title: "Hata",
        description: "Aktiviteler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [user])

  const handleJoinActivity = async (activity: ActivityWithAttendance) => {
    if (!user) return

    // Check if activity is full
    if (activity.max_participants && activity.participant_count && activity.participant_count >= activity.max_participants) {
      toast({
        title: "Aktivite Dolu",
        description: "Bu aktivite maksimum katılımcı sayısına ulaşmış.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(activity.id)
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from("activity_attendance")
        .insert({
          activity_id: activity.id,
          user_id: user.id,
          user_name: userData?.user?.user_metadata?.full_name || user.email?.split("@")[0] || "Kullanıcı",
          attended: false
        })

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Zaten Kayıtlısınız",
            description: "Bu aktiviteye zaten kayıt oldunuz.",
            variant: "destructive",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Başarılı",
          description: "Aktiviteye başarıyla kaydoldunuz.",
        })
        fetchActivities()
      }
    } catch (error) {
      errorHandler.logError('Error joining activity', error)
      toast({
        title: "Hata",
        description: "Aktiviteye katılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleLeaveActivity = async (activity: ActivityWithAttendance) => {
    if (!user) return

    if (!confirm("Bu aktiviteden ayrılmak istediğinizden emin misiniz?")) return

    setActionLoading(activity.id)
    try {
      const { error } = await supabase
        .from("activity_attendance")
        .delete()
        .eq("activity_id", activity.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Aktiviteden ayrıldınız.",
      })
      fetchActivities()
    } catch (error) {
      errorHandler.logError('Error leaving activity', error)
      toast({
        title: "Hata",
        description: "Aktiviteden ayrılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const ActivityCard = ({ activity, isPast = false }: { activity: ActivityWithAttendance, isPast?: boolean }) => {
    const activityDate = parseISO(activity.date_time)
    const isFull = activity.max_participants && activity.participant_count ? activity.participant_count >= activity.max_participants : false

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg line-clamp-1">{activity.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(activityDate, "d MMMM yyyy", { locale: tr })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(activityDate, "HH:mm")}
                </div>
                {activity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={activity.status === 'cancelled' ? 'destructive' : 'default'}>
                {activity.status === 'upcoming' && 'Yaklaşan'}
                {activity.status === 'completed' && 'Tamamlandı'}
                {activity.status === 'cancelled' && 'İptal Edildi'}
              </Badge>
              {isPast && activity.attendance && (
                <Badge variant={activity.attendance.attended ? 'default' : 'secondary'}>
                  {activity.attendance.attended ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Katıldı
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Katılmadı
                    </>
                  )}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>
                  {activity.participant_count} katılımcı
                  {activity.max_participants && ` / ${activity.max_participants}`}
                </span>
              </div>
              {!isPast && (
                <div className="text-xs">
                  {formatDistanceToNow(activityDate, { addSuffix: true, locale: tr })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedActivity(activity)
                  setIsDetailDialogOpen(true)
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Detay
              </Button>
              
              {!isPast && activity.status !== 'cancelled' && (
                activity.is_registered ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLeaveActivity(activity)}
                    disabled={actionLoading === activity.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserMinus className="w-4 h-4 mr-1" />
                    {actionLoading === activity.id ? "İşleniyor..." : "Ayrıl"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleJoinActivity(activity)}
                    disabled={actionLoading === activity.id || isFull}
                    className="bg-gradient-to-r from-[#0015ff] to-[#2563eb] hover:from-[#0015ff]/90 hover:to-[#2563eb]/90"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {actionLoading === activity.id ? "İşleniyor..." : isFull ? "Dolu" : "Katıl"}
                  </Button>
                )
              )}
              
              {!isPast && activity.is_registered && !activity.attendance?.attended && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  İlgili
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">Aktivite Geçmişim</h2>
          <p className="text-sm text-muted-foreground">
            Katıldığınız ve kayıt olduğunuz aktiviteleri görüntüleyin
          </p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Gelecek Aktiviteler ({upcomingActivities.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Geçmiş Aktiviteler ({pastActivities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingActivities.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Yaklaşan aktivite yok</h3>
                  <p className="text-muted-foreground">
                    Yeni aktivitelere katılmak için etkinlikler sayfasını ziyaret edin
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastActivities.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Geçmiş aktivite yok</h3>
                  <p className="text-muted-foreground">
                    Aktivitelere katılmaya başladığınızda geçmişiniz burada görünecek
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} isPast />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Activity Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedActivity.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-3">
                  <span>
                    {format(parseISO(selectedActivity.date_time), "d MMMM yyyy 'saat' HH:mm", { locale: tr })}
                  </span>
                  <Badge variant={selectedActivity.status === 'cancelled' ? 'destructive' : 'default'}>
                    {selectedActivity.status === 'upcoming' && 'Yaklaşan'}
                    {selectedActivity.status === 'completed' && 'Tamamlandı'}
                    {selectedActivity.status === 'cancelled' && 'İptal Edildi'}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Açıklama</h4>
                  <p className="text-gray-600">{selectedActivity.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedActivity.location && (
                    <div>
                      <h4 className="font-semibold mb-1">Konum</h4>
                      <p className="text-gray-600">{selectedActivity.location}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-1">Katılımcılar</h4>
                    <p className="text-gray-600">
                      {selectedActivity.participant_count} katılımcı
                      {selectedActivity.max_participants && ` (Maksimum: ${selectedActivity.max_participants})`}
                    </p>
                  </div>
                  {selectedActivity.duration_hours && (
                    <div>
                      <h4 className="font-semibold mb-1">Süre</h4>
                      <p className="text-gray-600">{selectedActivity.duration_hours} saat</p>
                    </div>
                  )}
                </div>

                {selectedActivity.is_registered && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Bu aktiviteye kayıt oldunuz
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}