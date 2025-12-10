"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Copy, CheckCircle, CreditCard, Wallet } from "lucide-react"
import type { Activity } from "@/lib/types"

interface PaymentModalProps {
    activity: Activity
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function PaymentModal({ activity, isOpen, onClose, onConfirm }: PaymentModalProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const bankDetails = {
        bankName: "Garanti Bankası",
        accountName: "Lokal Topluluk Hizmetleri A.Ş.",
        iban: "TR12 3456 7890 1234 5678 9012 34",
        description: `Lokal - ${activity.title}`
    }

    const handleCopyIban = async () => {
        try {
            await navigator.clipboard.writeText(bankDetails.iban)
            setCopied(true)
            toast({
                title: "Kopyalandı",
                description: "IBAN panoya kopyalandı.",
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast({
                title: "Hata",
                description: "Kopyalama başarısız oldu.",
                variant: "destructive",
            })
        }
    }

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error("Payment confirmation error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ödeme Bilgileri</DialogTitle>
                    <DialogDescription>
                        Etkinliğe katılım için lütfen aşağıdaki hesaba ödeme yapınız.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Wallet className="w-5 h-5" />
                            <span>Banka Havalesi / EFT</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">Banka</Label>
                                <p className="font-medium">{bankDetails.bankName}</p>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Alıcı Adı</Label>
                                <p className="font-medium">{bankDetails.accountName}</p>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">IBAN</Label>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono font-medium text-sm">{bankDetails.iban}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={handleCopyIban}
                                    >
                                        {copied ? (
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Açıklama</Label>
                                <p className="font-medium text-sm bg-background p-2 rounded border">
                                    {bankDetails.description}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    *Lütfen açıklama kısmına yukarıdaki kodu yazınız.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded text-blue-800">
                        <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>
                            Ödemenizi yaptıktan sonra "Ödeme Yaptım" butonuna tıklayarak kaydınızı tamamlayabilirsiniz.
                            Yöneticilerimiz ödemenizi kontrol ettikten sonra katılımınız onaylanacaktır.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Vazgeç
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading} className="w-full sm:w-auto">
                        {loading ? "İşleniyor..." : "Ödeme Yaptım, Kaydı Tamamla"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
