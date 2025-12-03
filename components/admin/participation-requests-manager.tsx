"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
    Loader2, Check, X, Eye, Calendar, CreditCard, Clock, 
    Users, MapPin, AlertCircle 
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface ActivityRequest {
    id: string
    activity_id: string
    user_id: string
    user_name?: string
    user_email?: string
    status: 'pending_payment' | 'payment_submitted' | 'approved' | 'rejected' | 'cancelled'
    payment_method?: string
    admin_notes?: string
    created_at: string
    updated_at: string
    activities?: {
        id: string
        title: string
        date_time: string
        location?: string
        max_participants?: number
    }
    user_profiles?: {
        full_name: string
        phone_number?: string
    }
}

const statusLabels: Record<string, string> = {
    pending_payment: 'Ödeme Bekleniyor',
    payment_submitted: 'Ödeme Bildirimi',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    cancelled: 'İptal Edildi'
}

const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    payment_submitted: 'bg-orange-100 text-orange-800 border-orange-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ParticipationRequestsManager() {
    const [requests, setRequests] = useState<ActivityRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<ActivityRequest | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("payment_submitted")
    const supabase = useMemo(() => createClient(), [])
    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        try {
            // Fetch activity requests with activities
            const { data: requests, error: requestsError } = await supabase
                .from('activity_requests')
                .select(`
                    *,
                    activities (
                        id,
                        title,
                        date_time,
                        location,
                        max_participants
                    )
                `)
                .order('created_at', { ascending: false })

            if (requestsError) throw requestsError

            // Fetch user profiles separately
            if (requests && requests.length > 0) {
                const userIds = [...new Set(requests.map(r => r.user_id))]
                const { data: profiles } = await supabase
                    .from('user_profiles')
                    .select('user_id, full_name, phone_number')
                    .in('user_id', userIds)

                const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
                const mergedRequests = requests.map(req => ({
                    ...req,
                    user_profiles: profileMap.get(req.user_id) || null
                }))

                setRequests(mergedRequests)
            } else {
                setRequests([])
            }
        } catch (error) {
            console.error('Error fetching requests:', error)
            toast({
                title: "Hata",
                description: "Katılım talepleri yüklenirken bir hata oluştu.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(id: string, status: ActivityRequest['status'], addToAttendance: boolean = false) {
        setActionLoading(id)
        try {
            const request = requests.find(r => r.id === id)
            if (!request) throw new Error('Request not found')

            // Update request status
            const { error: updateError } = await supabase
                .from('activity_requests')
                .update({ status })
                .eq('id', id)

            if (updateError) throw updateError

            // If approved, add to activity_attendance
            if (status === 'approved' && addToAttendance) {
                const { error: attendanceError } = await supabase
                    .from('activity_attendance')
                    .insert({
                        activity_id: request.activity_id,
                        user_id: request.user_id,
                        user_name: request.user_profiles?.full_name || request.user_name || 'Bilinmeyen',
                        attended: false
                    })

                if (attendanceError && !attendanceError.message.includes('duplicate')) {
                    throw attendanceError
                }
            }

            // If rejected/cancelled, remove from attendance if exists
            if (status === 'rejected' || status === 'cancelled') {
                await supabase
                    .from('activity_attendance')
                    .delete()
                    .eq('activity_id', request.activity_id)
                    .eq('user_id', request.user_id)
            }

            setRequests(reqs => reqs.map(r =>
                r.id === id ? { ...r, status } : r
            ))

            toast({
                title: "Başarılı",
                description: status === 'approved' 
                    ? "Katılım onaylandı ve kullanıcı listeye eklendi."
                    : "Talep durumu güncellendi.",
            })

            if (selectedRequest?.id === id) {
                setSelectedRequest(prev => prev ? { ...prev, status } : null)
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast({
                title: "Hata",
                description: "Durum güncellenirken bir hata oluştu.",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredRequests = requests.filter(req => {
        if (activeTab === 'all') return true
        if (activeTab === 'payment_submitted') return req.status === 'payment_submitted'
        if (activeTab === 'pending') return req.status === 'pending_payment'
        if (activeTab === 'approved') return req.status === 'approved'
        if (activeTab === 'rejected') return ['rejected', 'cancelled'].includes(req.status)
        return true
    })

    const counts = {
        all: requests.length,
        payment_submitted: requests.filter(r => r.status === 'payment_submitted').length,
        pending: requests.filter(r => r.status === 'pending_payment').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => ['rejected', 'cancelled'].includes(r.status)).length,
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Etkinlik Katılım Talepleri</h2>
                <div className="flex items-center gap-2">
                    {counts.payment_submitted > 0 && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {counts.payment_submitted} Ödeme Onayı Bekliyor
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-lg">
                        Toplam: {counts.all}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="payment_submitted" className="relative">
                        Ödeme Bildirimi
                        {counts.payment_submitted > 0 && (
                            <span className="ml-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {counts.payment_submitted}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="pending">Ödeme Bekleyen ({counts.pending})</TabsTrigger>
                    <TabsTrigger value="approved">Onaylanan ({counts.approved})</TabsTrigger>
                    <TabsTrigger value="rejected">Reddedilen ({counts.rejected})</TabsTrigger>
                    <TabsTrigger value="all">Tümü ({counts.all})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Etkinlik</TableHead>
                                    <TableHead>Kullanıcı</TableHead>
                                    <TableHead>Etkinlik Tarihi</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((req) => (
                                    <TableRow key={req.id} className={req.status === 'payment_submitted' ? 'bg-orange-50' : ''}>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(req.created_at), "d MMM HH:mm", { locale: tr })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {req.activities?.title || 'Bilinmeyen Etkinlik'}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{req.user_profiles?.full_name || req.user_name || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{req.user_profiles?.phone_number || '-'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {req.activities?.date_time && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(req.activities.date_time), "d MMM yyyy", { locale: tr })}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[req.status]}>
                                                {statusLabels[req.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {req.status === 'payment_submitted' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateStatus(req.id, 'pending_payment')}
                                                            disabled={actionLoading === req.id}
                                                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                        >
                                                            {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                                                            Reddet
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateStatus(req.id, 'approved', true)}
                                                            disabled={actionLoading === req.id}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                                            Onayla
                                                        </Button>
                                                    </>
                                                )}
                                                {req.status === 'pending_payment' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => updateStatus(req.id, 'cancelled')}
                                                        disabled={actionLoading === req.id}
                                                    >
                                                        İptal Et
                                                    </Button>
                                                )}
                                                {req.status === 'approved' && (
                                                    <Badge variant="outline" className="text-green-600">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Katılımcı Listesinde
                                                    </Badge>
                                                )}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Talep Detayları</DialogTitle>
                                                            <DialogDescription>
                                                                {req.activities?.title}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-muted-foreground">Kullanıcı</h4>
                                                                    <p className="font-medium">{req.user_profiles?.full_name || req.user_name}</p>
                                                                    <p className="text-sm text-muted-foreground">{req.user_profiles?.phone_number}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-muted-foreground">Talep Tarihi</h4>
                                                                    <p>{format(new Date(req.created_at), "d MMMM yyyy HH:mm", { locale: tr })}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {req.activities && (
                                                                <div className="bg-muted p-3 rounded-lg space-y-2">
                                                                    <h4 className="font-medium">{req.activities.title}</h4>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-4 h-4" />
                                                                            {format(new Date(req.activities.date_time), "d MMMM yyyy HH:mm", { locale: tr })}
                                                                        </span>
                                                                        {req.activities.location && (
                                                                            <span className="flex items-center gap-1">
                                                                                <MapPin className="w-4 h-4" />
                                                                                {req.activities.location}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Durum</h4>
                                                                <Badge className={statusColors[req.status]}>
                                                                    {statusLabels[req.status]}
                                                                </Badge>
                                                            </div>

                                                            {req.payment_method && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                                    <span>Ödeme Yöntemi: {req.payment_method === 'bank_transfer' ? 'Banka Havalesi' : req.payment_method}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Bu kategoride katılım talebi bulunmuyor.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
