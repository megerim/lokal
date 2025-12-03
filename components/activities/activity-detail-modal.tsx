"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  Share2,
  Copy,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Tag,
  Info,
  ChevronRight
} from "lucide-react"
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays, addHours } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"
import type { Activity, ActivityAttendance } from "@/lib/types"
import { PaymentModal } from "./payment-modal"

interface ActivityWithDetails extends Activity {
  activity_attendance?: ActivityAttendance[]
  participant_count?: number
  is_registered?: boolean
  request_status?: 'pending_payment' | 'payment_submitted' | 'approved' | 'rejected' | 'cancelled' | null
  organizer?: {
    full_name?: string
    avatar_url?: string
    email?: string
    phone_number?: string
    bio?: string
  }
  related_activities?: Array<{
    id: string
    title: string
    date_time: string
    participant_count: number
    max_participants?: number
  }>
}

interface ActivityDetailModalProps {
  activity: ActivityWithDetails
  isOpen: boolean
  onClose: () => void
  onJoinToggle: (activityId: string, isJoining: boolean) => void
  onUpdate?: () => void
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  workshop: { label: "Atölye", color: "bg-purple-100 text-purple-800", icon: "🔨" },
  social: { label: "Sosyal", color: "bg-blue-100 text-blue-800", icon: "🎉" },
  sports: { label: "Spor", color: "bg-green-100 text-green-800", icon: "⚽" },
  art: { label: "Sanat", color: "bg-pink-100 text-pink-800", icon: "🎨" },
  music: { label: "Müzik", color: "bg-indigo-100 text-indigo-800", icon: "🎵" },
  education: { label: "Eğitim", color: "bg-yellow-100 text-yellow-800", icon: "📚" },
  club: { label: "Kulüp", color: "bg-teal-100 text-teal-800", icon: "🏛️" },
  other: { label: "Diğer", color: "bg-gray-100 text-gray-800", icon: "📌" }
}

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
  onJoinToggle,
  onUpdate
}: ActivityDetailModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const [isJoining, setIsJoining] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [participants, setParticipants] = useState<ActivityAttendance[]>([])
  const [relatedActivities, setRelatedActivities] = useState<ActivityWithDetails['related_activities']>([])
  const [showAllParticipants, setShowAllParticipants] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const activityDate = parseISO(activity.date_time)
  const isPastActivity = isPast(activityDate)
  const isCancelled = activity.status === 'cancelled'
  const isFull = activity.max_participants ?
    (activity.participant_count || 0) >= activity.max_participants : false

  const spotsLeft = activity.max_participants ?
    activity.max_participants - (activity.participant_count || 0) : null

  const participationPercentage = activity.max_participants ?
    ((activity.participant_count || 0) / activity.max_participants) * 100 : 0

  const typeInfo = activity.activity_type ? TYPE_LABELS[activity.activity_type] : null

  // Fetch additional details
  useEffect(() => {
    if (!isOpen) return

    const fetchDetails = async () => {
      try {
        // Fetch participants
        if (activity.activity_attendance) {
          setParticipants(activity.activity_attendance)
        }

        // Fetch related activities
        const { data: related, error } = await supabase
          .from("activities")
          .select("id, title, date_time, max_participants")
          .eq('activity_type', activity.activity_type || 'other')
          .neq('id', activity.id)
          .in('status', ['upcoming', 'ongoing'])
          .order('date_time', { ascending: true })
          .limit(3)

        if (!error && related) {
          // Get participant counts for related activities
          const relatedWithCounts = await Promise.all(
            related.map(async (act) => {
              const { count } = await supabase
                .from("activity_attendance")
                .select('*', { count: 'exact', head: true })
                .eq('activity_id', act.id)

              return {
                ...act,
                participant_count: count || 0
              }
            })
          )

          setRelatedActivities(relatedWithCounts)
        }
      } catch (error) {
        errorHandler.logError('Error fetching activity details', error)
      }
    }

    fetchDetails()
  }, [isOpen, activity, supabase])

  const handleJoin = async () => {
    if (!user) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Aktivitelere katılmak için lütfen giriş yapın.",
        variant: "destructive",
      })
      return
    }

    // If already registered or has pending request, this is a "Leave/Cancel" action
    if (activity.is_registered || activity.request_status) {
      if (confirm(activity.is_registered ? "Aktiviteden ayrılmak istediğinize emin misiniz?" : "Katılım talebinizi iptal etmek istediğinize emin misiniz?")) {
        setIsJoining(true)
        await onJoinToggle(activity.id, false)
        setIsJoining(false)
        if (onUpdate) onUpdate()
      }
      return
    }

    // Otherwise, open payment modal
    setIsPaymentModalOpen(true)
  }

  const handlePaymentConfirm = async () => {
    setIsJoining(true)
    await onJoinToggle(activity.id, true)
    setIsJoining(false)
    if (onUpdate) onUpdate()
  }

  const handleShare = async () => {
    const shareData = {
      title: activity.title,
      text: `${activity.title} - ${format(activityDate, "d MMMM yyyy HH:mm", { locale: tr })}`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Copy link fallback
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Kopyalandı",
        description: "Aktivite linki panoya kopyalandı.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Link kopyalanamadı.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsCopying(false), 2000)
    }
  }

  const getDateLabel = () => {
    if (isToday(activityDate)) return "Bugün"
    if (isTomorrow(activityDate)) return "Yarın"
    const daysUntil = differenceInDays(activityDate, new Date())
    if (daysUntil > 0 && daysUntil <= 7) return `${daysUntil} gün sonra`
    return format(activityDate, "d MMMM yyyy", { locale: tr })
  }

  const displayedParticipants = showAllParticipants ? participants : participants.slice(0, 10)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          {/* Header Image */}
          {activity.image_url && (
            <div className="relative h-64 w-full">
              <Image
                src={activity.image_url}
                alt={activity.title}
                fill
                className="object-cover"
              />
              {isCancelled && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-2xl px-6 py-2">
                    ETKİNLİK İPTAL EDİLDİ
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Title and Type */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {typeInfo && (
                      <span className="text-2xl">{typeInfo.icon}</span>
                    )}
                    <h2 className="text-2xl font-bold">{activity.title}</h2>
                  </div>
                  {typeInfo && (
                    <Badge className={cn("mb-3", typeInfo.color)}>
                      {typeInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {isCopying ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {isPastActivity && (
                  <Badge variant="secondary">Etkinlik Sona Erdi</Badge>
                )}
                {activity.is_registered && !isPastActivity && !isCancelled && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Kayıtlısınız
                  </Badge>
                )}
                {isFull && !activity.is_registered && !isPastActivity && !isCancelled && (
                  <Badge variant="secondary">Kontenjan Dolu</Badge>
                )}
                {!activity.is_registered && (activity.request_status === 'payment_submitted' || activity.request_status === 'pending_payment') && !isPastActivity && !isCancelled && (
                  <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800 hover:bg-orange-100">
                    <Clock className="h-3 w-3" />
                    Onay Bekliyor
                  </Badge>
                )}
                {spotsLeft && spotsLeft <= 5 && !isFull && !isPastActivity && !isCancelled && (
                  <Badge variant="destructive">Son {spotsLeft} yer!</Badge>
                )}
              </div>
            </div>

            {/* Key Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{getDateLabel()}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(activityDate, "EEEE, d MMMM yyyy", { locale: tr })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{format(activityDate, "HH:mm")}</p>
                    {activity.duration_hours && (
                      <p className="text-sm text-muted-foreground">
                        Süre: {activity.duration_hours} saat
                        <span className="text-xs ml-1">
                          ({format(activityDate, "HH:mm")} - {format(addHours(activityDate, activity.duration_hours), "HH:mm")})
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {activity.location && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.location}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            window.open(
                              `https://maps.google.com/?q=${encodeURIComponent(activity.location!)}`,
                              '_blank'
                            )
                          }}
                        >
                          Haritada Göster
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Katılım Durumu</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.participant_count || 0}
                      {activity.max_participants && ` / ${activity.max_participants}`} katılımcı
                    </p>
                  </div>
                </div>

                {activity.max_participants && (
                  <>
                    <Progress value={participationPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {isFull ? 'Kontenjan doldu' : `${spotsLeft} yer mevcut`}
                    </p>
                  </>
                )}

                <Separator />

                {/* Action Button */}
                {!isPastActivity && !isCancelled && (
                  <Button
                    className="w-full"
                    variant={activity.is_registered || activity.request_status ? "outline" : "default"}
                    size="lg"
                    onClick={handleJoin}
                    disabled={isJoining || (isFull && !activity.is_registered && !activity.request_status)}
                  >
                    {activity.is_registered ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Katılımdan Vazgeç
                      </>
                    ) : activity.request_status ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        İptal Et
                      </>
                    ) : isFull ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Kontenjan Dolu
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Aktiviteye Katıl
                      </>
                    )}
                  </Button>
                )}
              </Card>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Aktivite Hakkında</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>

            {/* Organizer */}
            {activity.organizer && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Organizatör</h3>
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={activity.organizer.avatar_url} />
                      <AvatarFallback>
                        {activity.organizer.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{activity.organizer.full_name || 'Organizatör'}</p>
                      {activity.organizer.bio && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.organizer.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {activity.organizer.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs"
                            onClick={() => window.location.href = `mailto:${activity.organizer!.email}`}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            E-posta
                          </Button>
                        )}
                        {activity.organizer.phone_number && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs"
                            onClick={() => window.location.href = `tel:${activity.organizer!.phone_number}`}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Telefon
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Participants */}
            {participants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Katılımcılar ({participants.length})
                  </h3>
                  {participants.length > 10 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllParticipants(!showAllParticipants)}
                    >
                      {showAllParticipants ? 'Daha Az Göster' : `Tümünü Göster (${participants.length})`}
                    </Button>
                  )}
                </div>
                <Card className="p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {displayedParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {participant.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {participant.user_name}
                          </p>
                          {participant.attended && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Katıldı
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {participants.length > 10 && !showAllParticipants && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      ve {participants.length - 10} kişi daha...
                    </p>
                  )}
                </Card>
              </div>
            )}

            {/* Related Activities */}
            {relatedActivities && relatedActivities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Benzer Aktiviteler</h3>
                <div className="grid gap-3">
                  {relatedActivities.map((related) => (
                    <Card
                      key={related.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        // TODO: Navigate to activity or update modal content
                        console.log('Navigate to:', related.id)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{related.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{format(parseISO(related.date_time), "d MMM", { locale: tr })}</span>
                            <span>•</span>
                            <span>{format(parseISO(related.date_time), "HH:mm")}</span>
                            <span>•</span>
                            <span>
                              {related.participant_count}
                              {related.max_participants && ` / ${related.max_participants}`} katılımcı
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
      <PaymentModal
        activity={activity}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
      />
    </Dialog>
  )
}