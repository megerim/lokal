"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useAuth } from "@/components/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, CheckCircle, XCircle } from "lucide-react"

const RedeemVoucherPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const scannerRef = useRef<HTMLDivElement>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redemptionStatus, setRedemptionStatus] = useState<"success" | "error" | null>(null)
  const [redemptionMessage, setRedemptionMessage] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!isAdmin || !scannerRef.current) return

    const scanner = new Html5QrcodeScanner(
      scannerRef.current.id,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    const onScanSuccess = (decodedText: string) => {
      setScanResult(decodedText)
      scanner.clear()
    }

    const onScanFailure = (error: any) => {
      // console.warn(`Code scan error = ${error}`)
    }

    scanner.render(onScanSuccess, onScanFailure)

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner.", error)
      })
    }
  }, [isAdmin])

  const handleRedeem = async () => {
    if (!scanResult) return

    setIsRedeeming(true)
    setRedemptionStatus(null)
    setRedemptionMessage("")

    try {
      const response = await fetch("/api/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherCode: scanResult }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Bilinmeyen bir hata oluştu.")
      }
      
      setRedemptionStatus("success")
      setRedemptionMessage(`"${data.voucherCode}" kodlu kupon başarıyla kullanıldı.`)
      toast({
        title: "Başarılı",
        description: "Kupon başarıyla kullanıldı.",
      })
    } catch (error: any) {
      setRedemptionStatus("error")
      setRedemptionMessage(error.message)
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  const handleReset = () => {
    setScanResult(null)
    setRedemptionStatus(null)
    setRedemptionMessage("")
    // This is a trick to force re-render and re-initialize the scanner
    window.location.reload();
  }

  if (authLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
          <p className="text-gray-600">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h2>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <p className="text-gray-500 mt-2 text-sm">Sadece admin kullanıcılar bu sayfaya erişebilir.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode />
            Kupon Okutucu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scanResult ? (
            <div id="reader" ref={scannerRef} />
          ) : (
            <div className="text-center">
              {redemptionStatus === "success" && (
                <div className="flex flex-col items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                  <p className="font-semibold">Kupon Başarıyla Kullanıldı!</p>
                  <p className="text-sm text-muted-foreground">{redemptionMessage}</p>
                </div>
              )}
              {redemptionStatus === "error" && (
                <div className="flex flex-col items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="w-16 h-16 text-red-600" />
                  <p className="font-semibold">Hata Oluştu</p>
                  <p className="text-sm text-muted-foreground">{redemptionMessage}</p>
                </div>
              )}
              {!redemptionStatus && (
                 <div>
                    <p className="mb-2">Okutulan Kupon Kodu:</p>
                    <p className="font-mono text-lg bg-muted p-2 rounded">{scanResult}</p>
                    <Button onClick={handleRedeem} disabled={isRedeeming} className="mt-4 w-full">
                      {isRedeeming ? "Kullanılıyor..." : "Kuponu Kullan"}
                    </Button>
                 </div>
              )}
              <Button onClick={handleReset} variant="outline" className="mt-4 w-full">
                Yeni Kupon Okut
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RedeemVoucherPage
