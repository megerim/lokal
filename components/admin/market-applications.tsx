"use client"

import { useState, useEffect } from "react"
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
import { Loader2, Check, X, Eye, ExternalLink, Calendar, CreditCard, Clock } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"

interface MarketApplication {
    id: string
    user_id: string
    brand_name: string
    product_description: string
    instagram_handle?: string
    logo_url?: string
    participation_days?: string[]
    status: 'pending' | 'approved_waiting_payment' | 'payment_submitted' | 'completed' | 'rejected'
    payment_confirmed_at?: string
    admin_notes?: string
    created_at: string
    user_profiles?: {
        full_name: string
        phone_number?: string
    }
}

const statusLabels: Record<string, string> = {
    pending: 'Değerlendirmede',
    approved_waiting_payment: 'Ödeme Bekleniyor',
    payment_submitted: 'Ödeme Bildirimi Alındı',
    completed: 'Tamamlandı',
    rejected: 'Reddedildi'
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: 'secondary',
    approved_waiting_payment: 'outline',
    payment_submitted: 'default',
    completed: 'default',
    rejected: 'destructive'
}

export function MarketApplications() {
    const [applications, setApplications] = useState<MarketApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState<MarketApplication | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchApplications()
    }, [])

    async function fetchApplications() {
        try {
            // First fetch applications
            const { data: apps, error: appsError } = await supabase
                .from('market_applications')
                .select('*')
                .order('created_at', { ascending: false })

            if (appsError) throw appsError

            // Then fetch user profiles for all user_ids
            if (apps && apps.length > 0) {
                const userIds = [...new Set(apps.map(app => app.user_id))]
                const { data: profiles, error: profilesError } = await supabase
                    .from('user_profiles')
                    .select('user_id, full_name, phone_number')
                    .in('user_id', userIds)

                if (profilesError) {
                    console.error('Error fetching profiles:', profilesError)
                }

                // Merge profiles with applications
                const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
                const mergedApps = apps.map(app => ({
                    ...app,
                    user_profiles: profileMap.get(app.user_id) || null
                }))

                setApplications(mergedApps)
            } else {
                setApplications([])
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
            toast({
                title: "Hata",
                description: "Başvurular yüklenirken bir hata oluştu.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(id: string, status: MarketApplication['status']) {
        setActionLoading(id)
        try {
            const updateData: any = { status }
            if (status === 'completed') {
                updateData.payment_confirmed_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('market_applications')
                .update(updateData)
                .eq('id', id)

            if (error) throw error

            setApplications(apps => apps.map(app =>
                app.id === id ? { ...app, ...updateData } : app
            ))

            toast({
                title: "Başarılı",
                description: `Başvuru durumu güncellendi.`,
            })

            if (selectedApp?.id === id) {
                setSelectedApp(prev => prev ? { ...prev, ...updateData } : null)
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

    const filteredApplications = applications.filter(app => {
        if (activeTab === 'all') return true
        if (activeTab === 'pending') return app.status === 'pending'
        if (activeTab === 'payment') return ['approved_waiting_payment', 'payment_submitted'].includes(app.status)
        if (activeTab === 'completed') return app.status === 'completed'
        if (activeTab === 'rejected') return app.status === 'rejected'
        return true
    })

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        payment: applications.filter(a => ['approved_waiting_payment', 'payment_submitted'].includes(a.status)).length,
        completed: applications.filter(a => a.status === 'completed').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">🎄 Yılbaşı Pazarı Başvuruları</h2>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg bg-green-50 text-green-700 border-green-200">
                        Onaylı: {counts.completed}
                    </Badge>
                    <Badge variant="outline" className="text-lg">
                        Toplam: {counts.all}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Tümü ({counts.all})</TabsTrigger>
                    <TabsTrigger value="pending">Bekleyen ({counts.pending})</TabsTrigger>
                    <TabsTrigger value="payment">Ödeme ({counts.payment})</TabsTrigger>
                    <TabsTrigger value="completed">Tamamlanan ({counts.completed})</TabsTrigger>
                    <TabsTrigger value="rejected">Reddedilen ({counts.rejected})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Logo</TableHead>
                                    <TableHead>Marka</TableHead>
                                    <TableHead>İsim</TableHead>
                                    <TableHead>Günler</TableHead>
                                    <TableHead>Instagram</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            {app.logo_url ? (
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={app.logo_url}
                                                        alt={app.brand_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                    Logo
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{app.brand_name}</TableCell>
                                        <TableCell>{app.user_profiles?.full_name || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {app.participation_days?.map((day, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {day}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {app.instagram_handle ? (
                                                <a
                                                    href={app.instagram_handle.startsWith('http') ? app.instagram_handle : `https://instagram.com/${app.instagram_handle.replace('@', '').replace('https://instagram.com/', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    <span className="truncate max-w-[120px]">@{app.instagram_handle.replace('@', '').replace('https://instagram.com/', '')}</span>
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </a>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusColors[app.status]} className={
                                                app.status === 'payment_submitted' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                    app.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : ''
                                            }>
                                                {statusLabels[app.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        İncele
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-3">
                                                            {app.logo_url && (
                                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                                                    <Image src={app.logo_url} alt={app.brand_name} fill className="object-cover" />
                                                                </div>
                                                            )}
                                                            {app.brand_name}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Başvuru Tarihi: {format(new Date(app.created_at), "d MMMM yyyy HH:mm", { locale: tr })}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Katılım Günleri
                                                                </h4>
                                                                <div className="flex gap-2 mt-1">
                                                                    {app.participation_days?.map((day, i) => (
                                                                        <Badge key={i} variant="secondary">{day}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-muted-foreground">İletişim</h4>
                                                                <p className="text-sm">{app.user_profiles?.full_name}</p>
                                                                <p className="text-sm text-muted-foreground">{app.user_profiles?.phone_number || '-'}</p>
                                                            </div>
                                                        </div>

                                                        {app.instagram_handle && (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-muted-foreground">Instagram</h4>
                                                                <a
                                                                    href={app.instagram_handle.startsWith('http') ? app.instagram_handle : `https://instagram.com/${app.instagram_handle.replace('@', '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                                >
                                                                    {app.instagram_handle}
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Ürün Açıklaması</h4>
                                                            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                                                {app.product_description}
                                                            </div>
                                                        </div>

                                                        {app.payment_confirmed_at && (
                                                            <div className="bg-green-50 p-3 rounded-md text-sm text-green-700 flex items-center gap-2">
                                                                <Check className="w-4 h-4" />
                                                                Ödeme onaylandı: {format(new Date(app.payment_confirmed_at), "d MMMM yyyy HH:mm", { locale: tr })}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => updateStatus(app.id, 'rejected')}
                                                                        disabled={actionLoading === app.id}
                                                                    >
                                                                        {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                                                                        Reddet
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-blue-600 hover:bg-blue-700"
                                                                        onClick={() => updateStatus(app.id, 'approved_waiting_payment')}
                                                                        disabled={actionLoading === app.id}
                                                                    >
                                                                        {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                                                                        Onayla (Ödeme Bekle)
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {app.status === 'approved_waiting_payment' && (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Clock className="w-4 h-4" />
                                                                    Kullanıcının ödeme bildirimi bekleniyor...
                                                                </div>
                                                            )}

                                                            {app.status === 'payment_submitted' && (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => updateStatus(app.id, 'approved_waiting_payment')}
                                                                        disabled={actionLoading === app.id}
                                                                    >
                                                                        Ödeme Onaylanmadı
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                        onClick={() => updateStatus(app.id, 'completed')}
                                                                        disabled={actionLoading === app.id}
                                                                    >
                                                                        {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                                                        Ödeme Onayla
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {(app.status === 'rejected' || app.status === 'completed') && (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => updateStatus(app.id, 'pending')}
                                                                    disabled={actionLoading === app.id}
                                                                >
                                                                    Durumu Sıfırla
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredApplications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Bu kategoride başvuru bulunmuyor.
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
