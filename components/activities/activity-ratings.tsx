"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { 
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Camera,
  ChevronDown,
  Award,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  X,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import { format, parseISO, isAfter } from "date-fns"
import { tr } from "date-fns/locale"
import type { ActivityRating, ActivityAttendance } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActivityRatingsProps {
  activityId: string
  activityTitle: string
  activityDate: string
}

interface RatingWithVotes extends ActivityRating {
  helpfulVotes: number
  notHelpfulVotes: number
  userVote?: 'helpful' | 'not_helpful' | null
  verifiedAttendance?: boolean
}

interface RatingStats {
  averageRating: number
  totalRatings: number
  distribution: Record<number, number>
}

export function ActivityRatings({ 
  activityId, 
  activityTitle,
  activityDate
}: ActivityRatingsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [ratings, setRatings] = useState<RatingWithVotes[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [userRating, setUserRating] = useState<ActivityRating | null>(null)
  const [userAttendance, setUserAttendance] = useState<ActivityAttendance | null>(null)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "helpful" | "highest" | "lowest">("helpful")
  const [submitting, setSubmitting] = useState(false)
  
  // Rating form state
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    fetchRatings()
    if (user) {
      checkUserAttendance()
      fetchUserRating()
    }
  }, [activityId, user])

  const fetchRatings = async () => {
    try {
      setLoading(true)

      // Fetch ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("activity_ratings")
        .select("*")
        .eq("activity_id", activityId)

      if (ratingsError) throw ratingsError

      // Fetch rating votes if user is logged in
      let userVotes: Record<string, 'helpful' | 'not_helpful'> = {}
      if (user) {
        const { data: votesData } = await supabase
          .from("rating_votes")
          .select("rating_id, vote_type")
          .eq("user_id", user.id)
          .eq("activity_id", activityId)

        if (votesData) {
          votesData.forEach(vote => {
            userVotes[vote.rating_id] = vote.vote_type as 'helpful' | 'not_helpful'
          })
        }
      }

      // Verify attendance for each rating
      const processedRatings: RatingWithVotes[] = await Promise.all(
        (ratingsData || []).map(async (rating) => {
          // Check if user attended
          const { data: attendanceData } = await supabase
            .from("activity_attendance")
            .select("attended")
            .eq("activity_id", activityId)
            .eq("user_id", rating.user_id)
            .single()

          return {
            ...rating,
            helpfulVotes: rating.helpful_count || 0,
            notHelpfulVotes: 0, // You might want to track this separately
            userVote: userVotes[rating.id] || null,
            verifiedAttendance: attendanceData?.attended || false
          }
        })
      )

      setRatings(processedRatings)
      calculateStats(processedRatings)

    } catch (error) {
      errorHandler.logError('Error fetching ratings', error)
      toast({
        title: "Hata",
        description: "Değerlendirmeler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUserAttendance = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("activity_attendance")
        .select("*")
        .eq("activity_id", activityId)
        .eq("user_id", user.id)
        .single()

      if (!error && data) {
        setUserAttendance(data)
      }
    } catch (error) {
      errorHandler.logError('Error checking attendance', error)
    }
  }

  const fetchUserRating = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("activity_ratings")
        .select("*")
        .eq("activity_id", activityId)
        .eq("user_id", user.id)
        .single()

      if (!error && data) {
        setUserRating(data)
        setSelectedRating(data.rating)
        setReviewText(data.review || "")
        setUploadedPhotos(data.photos || [])
      }
    } catch (error) {
      // User hasn't rated yet
      console.log('No existing rating')
    }
  }

  const calculateStats = (ratingsList: RatingWithVotes[]) => {
    if (ratingsList.length === 0) {
      setStats(null)
      return
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalScore = 0

    ratingsList.forEach(rating => {
      distribution[rating.rating] = (distribution[rating.rating] || 0) + 1
      totalScore += rating.rating
    })

    setStats({
      averageRating: totalScore / ratingsList.length,
      totalRatings: ratingsList.length,
      distribution
    })
  }

  const handleSubmitRating = async () => {
    if (!user || selectedRating === 0) return

    setSubmitting(true)
    try {
      const ratingData = {
        activity_id: activityId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı',
        user_avatar: user.user_metadata?.avatar_url,
        rating: selectedRating,
        review: reviewText.trim() || null,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : null,
        is_verified_attendance: userAttendance?.attended || false
      }

      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from("activity_ratings")
          .update({
            ...ratingData,
            updated_at: new Date().toISOString()
          })
          .eq("id", userRating.id)

        if (error) throw error

        toast({
          title: "Başarılı",
          description: "Değerlendirmeniz güncellendi",
        })
      } else {
        // Create new rating
        const { error } = await supabase
          .from("activity_ratings")
          .insert(ratingData)

        if (error) throw error

        toast({
          title: "Başarılı",
          description: "Değerlendirmeniz eklendi",
        })
      }

      setIsRatingDialogOpen(false)
      setIsEditingRating(false)
      fetchRatings()
      fetchUserRating()

    } catch (error) {
      errorHandler.logError('Error submitting rating', error)
      toast({
        title: "Hata",
        description: "Değerlendirme eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRating = async () => {
    if (!user || !userRating) return

    try {
      const { error } = await supabase
        .from("activity_ratings")
        .delete()
        .eq("id", userRating.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Değerlendirmeniz silindi",
      })

      setUserRating(null)
      setSelectedRating(0)
      setReviewText("")
      setUploadedPhotos([])
      fetchRatings()

    } catch (error) {
      errorHandler.logError('Error deleting rating', error)
      toast({
        title: "Hata",
        description: "Değerlendirme silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleVoteRating = async (ratingId: string, voteType: 'helpful' | 'not_helpful') => {
    if (!user) return

    try {
      // Check if user already voted
      const rating = ratings.find(r => r.id === ratingId)
      if (rating?.userVote === voteType) {
        // Remove vote
        const { error } = await supabase
          .from("rating_votes")
          .delete()
          .eq("rating_id", ratingId)
          .eq("user_id", user.id)

        if (error) throw error

        // Update helpful count
        await supabase
          .from("activity_ratings")
          .update({
            helpful_count: Math.max(0, (rating.helpful_count || 0) - 1)
          })
          .eq("id", ratingId)

      } else {
        // Add or update vote
        const { error } = await supabase
          .from("rating_votes")
          .upsert({
            rating_id: ratingId,
            activity_id: activityId,
            user_id: user.id,
            vote_type: voteType
          })

        if (error) throw error

        // Update helpful count
        if (voteType === 'helpful') {
          await supabase
            .from("activity_ratings")
            .update({
              helpful_count: (rating?.helpful_count || 0) + 1
            })
            .eq("id", ratingId)
        }
      }

      fetchRatings()

    } catch (error) {
      errorHandler.logError('Error voting on rating', error)
      toast({
        title: "Hata",
        description: "Oy verirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl))
  }

  const sortedRatings = useMemo(() => {
    const sorted = [...ratings]
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      case "helpful":
        return sorted.sort((a, b) => b.helpfulVotes - a.helpfulVotes)
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating)
      default:
        return sorted
    }
  }, [ratings, sortBy])

  const canRate = user && isAfter(new Date(), parseISO(activityDate))
  const hasAttended = userAttendance?.attended || false

  const RatingDialog = () => (
    <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {userRating ? "Değerlendirmeyi Düzenle" : "Aktiviteyi Değerlendir"}
          </DialogTitle>
          <DialogDescription>
            {activityTitle} hakkındaki deneyiminizi paylaşın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Puanınız</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoveredRating || selectedRating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {selectedRating > 0 && `${selectedRating} / 5`}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Yorumunuz (Opsiyonel)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Aktivite hakkındaki düşüncelerinizi paylaşın..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length} / 500
            </p>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Fotoğraflar (Opsiyonel)
            </label>
            <div className="flex flex-wrap gap-2">
              {uploadedPhotos.map(photo => (
                <div key={photo} className="relative group">
                  <img
                    src={photo}
                    alt="Review photo"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {uploadedPhotos.length < 3 && (
                <UploadButton<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setUploadedPhotos(prev => [...prev, res[0].ufsUrl])
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      title: "Hata",
                      description: `Yükleme hatası: ${error.message}`,
                      variant: "destructive",
                    })
                  }}
                  appearance={{
                    button: "w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary transition-colors",
                    allowedContent: "hidden"
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) return <Camera className="w-6 h-6 text-gray-400" />
                      return <Loader2 className="w-6 h-6 animate-spin" />
                    }
                  }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maksimum 3 fotoğraf yükleyebilirsiniz
            </p>
          </div>

          {/* Attendance Badge */}
          {hasAttended && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Katılım Doğrulandı
                </p>
                <p className="text-xs text-green-700">
                  Bu aktiviteye katıldığınız doğrulandı
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmitRating}
              disabled={submitting || selectedRating === 0}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {userRating ? "Güncelle" : "Değerlendir"}
            </Button>
            {userRating && (
              <Button
                variant="outline"
                onClick={handleDeleteRating}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setIsRatingDialogOpen(false)
                setIsEditingRating(false)
              }}
            >
              İptal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Değerlendirmeler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Değerlendirmeler ve İncelemeler
              </CardTitle>
              <CardDescription>
                Katılımcıların aktivite hakkındaki görüşleri
              </CardDescription>
            </div>
            {canRate && !userRating && (
              <Button
                onClick={() => setIsRatingDialogOpen(true)}
                disabled={!hasAttended && !isAfter(new Date(), parseISO(activityDate))}
              >
                <Star className="w-4 h-4 mr-2" />
                Değerlendir
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <= Math.round(stats.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.totalRatings} değerlendirme
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.distribution[rating] || 0
                  const percentage = stats.totalRatings > 0 
                    ? (count / stats.totalRatings) * 100 
                    : 0

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* User's Rating */}
          {userRating && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userRating.user_avatar} />
                    <AvatarFallback>
                      {userRating.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Senin Değerlendirmen</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4",
                              star <= userRating.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {userRating.review && (
                      <p className="text-sm">{userRating.review}</p>
                    )}
                    {userRating.photos && userRating.photos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {userRating.photos.map(photo => (
                          <img
                            key={photo}
                            src={photo}
                            alt="Review photo"
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingRating(true)
                    setIsRatingDialogOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Sort Options */}
          {ratings.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{ratings.length} İnceleme</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sırala: {
                      sortBy === "helpful" ? "En Yararlı" :
                      sortBy === "newest" ? "En Yeni" :
                      sortBy === "highest" ? "En Yüksek" :
                      "En Düşük"
                    }
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("helpful")}>
                    En Yararlı
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    En Yeni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("highest")}>
                    En Yüksek Puan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("lowest")}>
                    En Düşük Puan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Ratings List */}
          {sortedRatings.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">Henüz değerlendirme yok</p>
              {canRate && (
                <p className="text-sm text-muted-foreground mt-2">
                  İlk değerlendirmeyi siz yapın!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRatings.map(rating => (
                <div
                  key={rating.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={rating.user_avatar} />
                        <AvatarFallback>
                          {rating.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rating.user_name}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-3 h-3",
                                  star <= rating.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          {rating.verifiedAttendance && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Katılım Doğrulandı
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(rating.created_at), 'd MMMM yyyy', { locale: tr })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {rating.review && (
                    <p className="text-sm">{rating.review}</p>
                  )}

                  {rating.photos && rating.photos.length > 0 && (
                    <div className="flex gap-2">
                      {rating.photos.map((photo, idx) => (
                        <Dialog key={idx}>
                          <DialogTrigger asChild>
                            <button className="relative group">
                              <img
                                src={photo}
                                alt={`Review photo ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white" />
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <img
                              src={photo}
                              alt={`Review photo ${idx + 1}`}
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8",
                          rating.userVote === 'helpful' && "text-primary"
                        )}
                        onClick={() => handleVoteRating(rating.id, 'helpful')}
                        disabled={!user || rating.user_id === user?.id}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Yararlı ({rating.helpfulVotes})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8",
                          rating.userVote === 'not_helpful' && "text-primary"
                        )}
                        onClick={() => handleVoteRating(rating.id, 'not_helpful')}
                        disabled={!user || rating.user_id === user?.id}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RatingDialog />
    </>
  )
}