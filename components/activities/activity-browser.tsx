"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { ActivityCard } from "./activity-card"
import { ActivityDetailModal } from "./activity-detail-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import {
  Search,
  Filter,
  Grid3x3,
  List,
  CalendarIcon,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react"
import { format, isAfter, isBefore, isToday, parseISO, startOfDay, endOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Activity, ActivityAttendance } from "@/lib/types"

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

type ViewMode = 'grid' | 'list'
type SortOption = 'date_asc' | 'date_desc' | 'popularity' | 'spots_available'

const ACTIVITY_TYPES = [
  { value: 'all', label: 'Tüm Aktiviteler' },
  { value: 'workshop', label: 'Atölye' },
  { value: 'social', label: 'Sosyal Etkinlik' },
  { value: 'sports', label: 'Spor' },
  { value: 'art', label: 'Sanat' },
  { value: 'music', label: 'Müzik' },
  { value: 'education', label: 'Eğitim' },
  { value: 'club', label: 'Kulüp Etkinliği' },
  { value: 'other', label: 'Diğer' }
]

const ITEMS_PER_PAGE = 12

export function ActivityBrowser() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  // State management
  const [activities, setActivities] = useState<ActivityWithDetails[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [showFullOnly, setShowFullOnly] = useState(false)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>('date_asc')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = new Set(activities.map(a => a.location).filter(Boolean))
    return Array.from(uniqueLocations).sort()
  }, [activities])

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_attendance (
            id,
            user_id,
            user_name,
            attended
          ),
          organizer:user_profiles!activities_created_by_fkey (
            full_name,
            avatar_url
          )
        `)
        .in('status', ['upcoming', 'ongoing'])
        .order('date_time', { ascending: true })

      // Fetch user's requests
      let userRequests: any[] = []
      if (user) {
        const { data: requests } = await supabase
          .from('activity_requests')
          .select('activity_id, status')
          .eq('user_id', user.id)
          .in('status', ['pending_payment', 'payment_submitted', 'approved'])

        if (requests) userRequests = requests
      }

      if (error) throw error

      const processedActivities = (data || []).map(activity => {
        const participantCount = activity.activity_attendance?.length || 0
        const isRegistered = user ?
          activity.activity_attendance?.some((a: ActivityAttendance) => a.user_id === user.id) :
          false

        const userRequest = userRequests.find(r => r.activity_id === activity.id)
        const requestStatus = userRequest?.status || null

        return {
          ...activity,
          participant_count: participantCount,
          is_registered: isRegistered,
          request_status: requestStatus
        }
      })

      setActivities(processedActivities)
      setFilteredActivities(processedActivities)

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
  }, [supabase, user, toast])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Filter and sort activities
  useEffect(() => {
    let filtered = [...activities]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.location?.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.activity_type === selectedType)
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(activity => activity.location === selectedLocation)
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(activity => {
        const activityDate = parseISO(activity.date_time)
        const fromDate = startOfDay(dateRange.from!)
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!)

        return isAfter(activityDate, fromDate) && isBefore(activityDate, toDate)
      })
    }

    // Availability filters
    if (showAvailableOnly) {
      filtered = filtered.filter(activity => {
        if (!activity.max_participants) return true
        return (activity.participant_count || 0) < activity.max_participants
      })
    }

    if (showFullOnly) {
      filtered = filtered.filter(activity => {
        if (!activity.max_participants) return false
        return (activity.participant_count || 0) >= activity.max_participants
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc':
          return new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        case 'date_desc':
          return new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        case 'popularity':
          return (b.participant_count || 0) - (a.participant_count || 0)
        case 'spots_available':
          const spotsA = (a.max_participants || Infinity) - (a.participant_count || 0)
          const spotsB = (b.max_participants || Infinity) - (b.participant_count || 0)
          return spotsB - spotsA
        default:
          return 0
      }
    })

    setFilteredActivities(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }, [activities, searchQuery, selectedType, selectedLocation, dateRange, showFullOnly, showAvailableOnly, sortOption])

  // Get paginated activities
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredActivities.slice(startIndex, endIndex)
  }, [filteredActivities, currentPage])

  const handleActivityClick = (activity: ActivityWithDetails) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const handleJoinToggle = async (activityId: string, isJoining: boolean) => {
    if (!user) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Aktivitelere katılmak için lütfen giriş yapın.",
        variant: "destructive",
      });
      return;
    }

    const originalActivities = [...activities];

    // Optimistic update
    const newActivities = activities.map(a => {
      if (a.id === activityId) {
        return {
          ...a,
          is_registered: isJoining ? false : false, // Wait for approval
          request_status: isJoining ? 'payment_submitted' as const : null,
          participant_count: (a.participant_count || 0) // Count doesn't change until approved
        };
      }
      return a;
    });
    setActivities(newActivities);

    try {
      if (isJoining) {
        // Create activity request
        const { error } = await supabase
          .from("activity_requests")
          .insert({
            activity_id: activityId,
            user_id: user.id,
            status: 'payment_submitted',
            payment_method: 'bank_transfer'
          });

        if (error) throw error;

        toast({
          title: "Ödeme Bildirimi Alındı",
          description: "Katılım talebiniz ve ödeme bildiriminiz alındı. Yönetici onayından sonra kaydınız tamamlanacaktır.",
        });
      } else {
        // Cancel request and/or leave activity

        // 1. Delete from activity_attendance if exists
        const { error: attendanceError } = await supabase
          .from("activity_attendance")
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', user.id);

        if (attendanceError) throw attendanceError;

        // 2. Cancel/Delete request
        // We can either delete the request or update status to cancelled. 
        // Deleting is cleaner for now to allow re-request easily.
        const { error: requestError } = await supabase
          .from("activity_requests")
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', user.id);

        if (requestError) throw requestError;

        toast({
          title: "Başarılı",
          description: "Aktivite kaydınız/talebiniz iptal edildi.",
        });
      }

      await fetchActivities();

    } catch (error) {
      setActivities(originalActivities);
      errorHandler.logError('Error toggling activity participation', error);
      toast({
        title: "Hata",
        description: isJoining ?
          "Aktiviteye katılırken bir hata oluştu." :
          "Aktiviteden ayrılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("all")
    setSelectedLocation("all")
    setDateRange({ from: undefined, to: undefined })
    setShowFullOnly(false)
    setShowAvailableOnly(false)
    setSortOption('date_asc')
  }

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedLocation !== 'all' ||
    dateRange.from || showFullOnly || showAvailableOnly

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-full md:w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and View Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Aktivite ara... (başlık, açıklama veya konum)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtreler
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                Aktif
              </Badge>
            )}
          </Button>

          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filtreler</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Temizle
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Activity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aktivite Türü</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Konum</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Konum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Konumlar</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location || ''}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih Aralığı</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "d MMM", { locale: tr })} - {format(dateRange.to, "d MMM", { locale: tr })}
                        </>
                      ) : (
                        format(dateRange.from, "d MMMM", { locale: tr })
                      )
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sıralama</label>
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_asc">Tarihe Göre (Yakın)</SelectItem>
                  <SelectItem value="date_desc">Tarihe Göre (Uzak)</SelectItem>
                  <SelectItem value="popularity">Popülerlik</SelectItem>
                  <SelectItem value="spots_available">Boş Kontenjan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showAvailableOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowAvailableOnly(!showAvailableOnly)
                if (!showAvailableOnly) setShowFullOnly(false)
              }}
            >
              Sadece Yer Olanlar
            </Button>
            <Button
              variant={showFullOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowFullOnly(!showFullOnly)
                if (!showFullOnly) setShowAvailableOnly(false)
              }}
            >
              Sadece Dolu Olanlar
            </Button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredActivities.length} aktivite bulundu
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Sayfa {currentPage} / {totalPages}
          </p>
        )}
      </div>

      {/* Activities Grid/List */}
      {paginatedActivities.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aktivite Bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Arama kriterlerinize uygun aktivite bulunamadı.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={cn(
            viewMode === 'grid'
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          )}>
            {paginatedActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                viewMode={viewMode}
                onJoinToggle={handleJoinToggle}
                onViewDetails={() => handleActivityClick(activity)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Önceki
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedActivity(null)
          }}
          onJoinToggle={handleJoinToggle}
          onUpdate={fetchActivities}
        />
      )}
    </div>
  )
}