"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  Eye,
  ChevronRight,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays } from "date-fns"
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
  }
}

interface ActivityCardProps {
  activity: ActivityWithDetails
  viewMode: 'grid' | 'list'
  onJoinToggle: (activityId: string, isJoining: boolean) => void
  onViewDetails: () => void
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  workshop: { label: "Atölye", color: "bg-purple-100 text-purple-800" },
  social: { label: "Sosyal", color: "bg-blue-100 text-blue-800" },
  sports: { label: "Spor", color: "bg-green-100 text-green-800" },
  art: { label: "Sanat", color: "bg-pink-100 text-pink-800" },
  music: { label: "Müzik", color: "bg-indigo-100 text-indigo-800" },
  education: { label: "Eğitim", color: "bg-yellow-100 text-yellow-800" },
  club: { label: "Kulüp", color: "bg-teal-100 text-teal-800" },
  other: { label: "Diğer", color: "bg-gray-100 text-gray-800" }
}

export function ActivityCard({ activity, viewMode, onJoinToggle, onViewDetails }: ActivityCardProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const activityDate = parseISO(activity.date_time)
  const isPastActivity = isPast(activityDate)
  const isCancelled = activity.status === 'cancelled'
  const isFull = activity.max_participants ?
    (activity.participant_count || 0) >= activity.max_participants : false

  const spotsLeft = activity.max_participants ?
    activity.max_participants - (activity.participant_count || 0) : null

  const participationPercentage = activity.max_participants ?
    ((activity.participant_count || 0) / activity.max_participants) * 100 : 0

  // Format date label
  const getDateLabel = () => {
    if (isToday(activityDate)) return "Bugün"
    if (isTomorrow(activityDate)) return "Yarın"
    const daysUntil = differenceInDays(activityDate, new Date())
    if (daysUntil > 0 && daysUntil <= 7) return `${daysUntil} gün sonra`
    return format(activityDate, "d MMMM", { locale: tr })
  }

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // If already registered or has pending request, this is a "Leave/Cancel" action
    if (activity.is_registered || activity.request_status) {
      if (confirm(activity.is_registered ? "Aktiviteden ayrılmak istediğinize emin misiniz?" : "Katılım talebinizi iptal etmek istediğinize emin misiniz?")) {
        setIsJoining(true)
        await onJoinToggle(activity.id, false)
        setIsJoining(false)
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
  }

  const typeInfo = activity.activity_type ? TYPE_LABELS[activity.activity_type] : null

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          "hover:shadow-lg transition-all cursor-pointer",
          isCancelled && "opacity-60",
          isPastActivity && "bg-muted/30"
        )}
        onClick={onViewDetails}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          {activity.image_url && (
            <div className="relative w-full md:w-48 h-48 md:h-auto">
              <Image
                src={activity.image_url}
                alt={activity.title}
                fill
                className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
              />
              {isCancelled && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                  <Badge variant="destructive" className="text-lg">İPTAL</Badge>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold line-clamp-1">{activity.title}</h3>
                  {typeInfo && (
                    <Badge className={cn("text-xs", typeInfo.color)}>
                      {typeInfo.label}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {activity.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getDateLabel()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(activityDate, "HH:mm")}</span>
                  </div>
                  {activity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {activity.participant_count || 0}
                      {activity.max_participants && ` / ${activity.max_participants}`} katılımcı
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {!isPastActivity && !isCancelled && (
                  <>
                    {activity.is_registered ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Kayıtlısınız
                      </Badge>
                    ) : activity.request_status === 'payment_submitted' || activity.request_status === 'pending_payment' ? (
                      <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800 hover:bg-orange-100">
                        <Clock className="h-3 w-3" />
                        Onay Bekliyor
                      </Badge>
                    ) : isFull ? (
                      <Badge variant="secondary">Dolu</Badge>
                    ) : spotsLeft && spotsLeft <= 5 ? (
                      <Badge variant="destructive">Son {spotsLeft} yer!</Badge>
                    ) : null}
                  </>
                )}

                <div className="flex gap-2">
                  {!isPastActivity && !isCancelled && !isFull && (
                    <Button
                      size="sm"
                      variant={activity.is_registered || activity.request_status ? "outline" : "default"}
                      onClick={handleJoinClick}
                      disabled={isJoining}
                      className="gap-1"
                    >
                      {activity.is_registered ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Ayrıl
                        </>
                      ) : activity.request_status ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          İptal Et
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Katıl
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails()
                    }}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Detay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid View
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all cursor-pointer overflow-hidden",
        isCancelled && "opacity-60",
        isPastActivity && "bg-muted/30"
      )}
      onClick={onViewDetails}
    >
      {/* Image Header */}
      {activity.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={activity.image_url}
            alt={activity.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isCancelled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">İPTAL</Badge>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-2">
            {typeInfo && (
              <Badge className={cn("text-xs", typeInfo.color)}>
                {typeInfo.label}
              </Badge>
            )}
            {!isPastActivity && !isCancelled && spotsLeft && spotsLeft <= 5 && (
              <Badge variant="destructive">Son {spotsLeft} yer!</Badge>
            )}
          </div>
          {activity.is_registered && !isPastActivity && !isCancelled && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Kayıtlı
              </Badge>
            </div>
          )}
          {!activity.is_registered && (activity.request_status === 'payment_submitted' || activity.request_status === 'pending_payment') && !isPastActivity && !isCancelled && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3" />
                Onay Bekliyor
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
          <Calendar className="h-16 w-16 text-primary/20" />
          {isCancelled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">İPTAL</Badge>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-2">
            {typeInfo && (
              <Badge className={cn("text-xs", typeInfo.color)}>
                {typeInfo.label}
              </Badge>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="space-y-1">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {activity.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{getDateLabel()}</span>
            <span className="text-muted-foreground">•</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(activityDate, "HH:mm")}</span>
          </div>

          {activity.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{activity.location}</span>
            </div>
          )}
        </div>

        {/* Participation Progress */}
        {activity.max_participants && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{activity.participant_count || 0} / {activity.max_participants}</span>
              </div>
              {!isFull ? (
                <span className="text-xs text-muted-foreground">
                  {spotsLeft} yer kaldı
                </span>
              ) : (
                <Badge variant="secondary" className="text-xs">Dolu</Badge>
              )}
            </div>
            <Progress value={participationPercentage} className="h-2" />
          </div>
        )}

        {/* Organizer Info */}
        {activity.organizer && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activity.organizer.avatar_url} />
              <AvatarFallback className="text-xs">
                {activity.organizer.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {activity.organizer.full_name || 'Organizatör'}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        {isPastActivity ? (
          <Badge variant="secondary" className="w-full justify-center">
            Etkinlik Sona Erdi
          </Badge>
        ) : isCancelled ? (
          <Badge variant="destructive" className="w-full justify-center">
            İptal Edildi
          </Badge>
        ) : (
          <div className="flex gap-2 w-full">
            {!isFull && (
              <Button
                className="flex-1"
                variant={activity.is_registered || activity.request_status ? "outline" : "default"}
                size="sm"
                onClick={handleJoinClick}
                disabled={isJoining}
              >
                {activity.is_registered ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Ayrıl
                  </>
                ) : activity.request_status ? (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    İptal Et
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Katıl
                  </>
                )}
              </Button>
            )}
            <Button
              variant={isFull && !activity.is_registered ? "default" : "ghost"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails()
              }}
              className={cn(
                "gap-1",
                isFull && !activity.is_registered && "flex-1"
              )}
            >
              <Eye className="h-4 w-4" />
              Detaylar
            </Button>
          </div>
        )}
      </CardFooter>
      <PaymentModal
        activity={activity}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
      />
    </Card>
  )
}