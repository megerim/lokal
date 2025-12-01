"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Trash2,
  Calendar,
  Users,
  Clock,
  Building2,
  Phone,
  Mail,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ActivityRequest {
  id: string
  title: string
  description: string
  event_type?: string
  expected_participants?: string
  preferred_date?: string
  duration?: string
  budget_range?: string
  organization_name?: string
  requester_name: string
  requester_email: string
  phone_number?: string
  status: string
  created_at: string
  updated_at: string
}

const eventTypeLabels: Record<string, string> = {
  workshop: "Atölye Çalışması",
  meeting: "Toplantı",
  training: "Eğitim",
  social: "Sosyal Etkinlik",
  presentation: "Sunum",
  birthday: "Doğum Günü",
  other: "Diğer",
}

const statusConfig = {
  pending: { label: "Bekliyor", icon: AlertCircle, color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Onaylandı", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  rejected: { label: "Reddedildi", icon: XCircle, color: "bg-red-100 text-red-800" },
}

interface ActivityRequestsDialogProps {
  trigger?: React.ReactNode
}

export function ActivityRequestsDialog({ trigger }: ActivityRequestsDialogProps) {
  const [open, setOpen] = useState(false)
  const [requests, setRequests] = useState<ActivityRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("etkinlik_talepleri")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setRequests(data || [])
    } catch (error) {
      toast({
        title: "Hata",
        description: "Talepler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu talebi silmek istediğinizden emin misiniz?")) return

    try {
      const { error } = await supabase.from("etkinlik_talepleri").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Talep silindi.",
      })

      fetchRequests()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Talep silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("etkinlik_talepleri")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: `Talep durumu ${statusConfig[newStatus as keyof typeof statusConfig].label} olarak güncellendi.`,
      })

      fetchRequests()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = selectedStatus === "all"
    ? requests
    : requests.filter(r => r.status === selectedStatus)

  useEffect(() => {
    if (open) {
      fetchRequests()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Aktivite Talepleri
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Aktivite Talepleri
          </DialogTitle>
          <DialogDescription>Kullanıcılardan gelen aktivite talepleri</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filtrele:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary">Toplam: {filteredRequests.length}</Badge>
          </div>

          {filteredRequests.length > 0 ? (
            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-4 pr-4">
                {filteredRequests.map((request) => {
                  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || AlertCircle
                  const statusColor = statusConfig[request.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"

                  return (
                    <div key={request.id} className="p-5 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{request.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={statusColor}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
                            </Badge>
                            {request.event_type && (
                              <Badge variant="outline">
                                {eventTypeLabels[request.event_type] || request.event_type}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {new Date(request.created_at).toLocaleDateString("tr-TR")}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={request.status}
                            onValueChange={(value) => handleStatusChange(request.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Bekliyor</SelectItem>
                              <SelectItem value="approved">Onayla</SelectItem>
                              <SelectItem value="rejected">Reddet</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p>{request.description}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {request.expected_participants && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{request.expected_participants}</span>
                          </div>
                        )}
                        {request.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{request.duration === "full-day" ? "Tam gün" : `${request.duration} saat`}</span>
                          </div>
                        )}
                        {request.preferred_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{new Date(request.preferred_date).toLocaleDateString("tr-TR")}</span>
                          </div>
                        )}
                        {request.budget_range && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span>{request.budget_range}</span>
                          </div>
                        )}
                        {request.organization_name && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span>{request.organization_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{request.requester_name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            {request.requester_email && (
                              <a
                                href={`mailto:${request.requester_email}`}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                              >
                                <Mail className="w-4 h-4" />
                                {request.requester_email}
                              </a>
                            )}
                            {request.phone_number && (
                              <a
                                href={`tel:${request.phone_number.replace(/\s/g, '')}`}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                              >
                                <Phone className="w-4 h-4" />
                                {request.phone_number}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Henüz talep yok</p>
              <p className="text-sm">Bu kategoride aktivite talebi bulunmuyor.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}