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
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, X, Eye, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface MarketApplication {
    id: string
    full_name: string
    email: string
    phone: string
    brand_name: string
    product_description: string
    instagram_handle?: string
    website_url?: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

export function MarketApplications() {
    const [applications, setApplications] = useState<MarketApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState<MarketApplication | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchApplications()
    }, [])

    async function fetchApplications() {
        try {
            const { data, error } = await supabase
                .from('market_applications')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setApplications(data || [])
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

    async function updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
        setActionLoading(id)
        try {
            const { error } = await supabase
                .from('market_applications')
                .update({ status })
                .eq('id', id)

            if (error) throw error

            setApplications(apps => apps.map(app =>
                app.id === id ? { ...app, status } : app
            ))

            toast({
                title: "Başarılı",
                description: `Başvuru ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
            })

            if (selectedApp?.id === id) {
                setSelectedApp(prev => prev ? { ...prev, status } : null)
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

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Yılbaşı Pazarı Başvuruları</h2>
                <Badge variant="outline" className="text-lg">
                    Toplam: {applications.length}
                </Badge>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Marka</TableHead>
                            <TableHead>Instagram</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>
                                    {format(new Date(app.created_at), "d MMM HH:mm", { locale: tr })}
                                </TableCell>
                                <TableCell>{app.full_name}</TableCell>
                                <TableCell className="font-medium">{app.brand_name}</TableCell>
                                <TableCell>
                                    {app.instagram_handle ? (
                                        <a
                                            href={`https://instagram.com/${app.instagram_handle.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {app.instagram_handle}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ) : "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        app.status === 'approved' ? 'default' :
                                            app.status === 'rejected' ? 'destructive' :
                                                'secondary'
                                    }>
                                        {app.status === 'approved' ? 'Onaylandı' :
                                            app.status === 'rejected' ? 'Reddedildi' :
                                                'Bekliyor'}
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
                                                <DialogTitle>Başvuru Detayları</DialogTitle>
                                                <DialogDescription>
                                                    {app.brand_name} - {app.full_name}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">İletişim</h4>
                                                        <p>{app.email}</p>
                                                        <p>{app.phone}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">Web Sitesi</h4>
                                                        {app.website_url ? (
                                                            <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                                {app.website_url}
                                                            </a>
                                                        ) : "-"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Ürün Açıklaması</h4>
                                                    <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                                        {app.product_description}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 pt-4 border-t">
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
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => updateStatus(app.id, 'approved')}
                                                                disabled={actionLoading === app.id}
                                                            >
                                                                {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                                                Onayla
                                                            </Button>
                                                        </>
                                                    )}
                                                    {app.status !== 'pending' && (
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
                        {applications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Henüz başvuru bulunmuyor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
