"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    Send,
    Check,
    Instagram,
    Upload,
    Calendar,
    X,
    Mail,
    Phone,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";

const formSchema = z
    .object({
        brandName: z.string().min(2, "Marka adı en az 2 karakter olmalıdır"),
        instagram: z.string().min(1, "Instagram linki zorunludur"),
        day27: z.boolean(),
        day28: z.boolean(),
        logoUrl: z.string().min(1, "Logo yüklemeniz zorunludur"),
        description: z
            .string()
            .min(20, "Lütfen ürünlerinizi en az 20 karakterle anlatınız"),
        guestEmail: z.string().email("Geçerli bir e-posta adresi giriniz"),
        guestPhone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
    })
    .refine((data) => data.day27 || data.day28, {
        message: "En az bir gün seçmelisiniz",
        path: ["day28"],
    });

interface EasyMarketApplicationFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EasyMarketApplicationForm({
    isOpen,
    onClose,
}: EasyMarketApplicationFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string>("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brandName: "",
            instagram: "",
            day27: false,
            day28: false,
            logoUrl: "",
            description: "",
            guestEmail: "",
            guestPhone: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await fetch("/api/market-applications/guest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Başvuru gönderilemedi");
            }

            toast({
                title: "Başvuru Alındı! 🎉",
                description:
                    "Başvurunuz başarıyla alındı. Onaylandıktan sonra sizinle iletişime geçeceğiz.",
            });

            onClose();
            form.reset();
            setLogoUrl("");
        } catch (error: any) {
            console.error("Application error:", error);
            toast({
                title: "Hata",
                description: error.message || "Başvuru gönderilirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">🎄 Üye Olmadan Başvuru Formu</DialogTitle>
                    <DialogDescription>
                        Yılbaşı pazarımızda yer almak için formu doldurun. Giriş yapmadan hızlıca başvurabilirsiniz.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Contact Information Section */}
                        <div className="bg-blue-50 rounded-xl p-4 space-y-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2 text-blue-800">
                                📞 İletişim Bilgileri
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="guestEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                E-posta
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="ornek@email.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="guestPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Telefon
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="05XX XXX XX XX"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="brandName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marka / İşletme Adı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Markanızın adı" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Instagram className="w-4 h-4" />
                                        Instagram Linki
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://instagram.com/kullaniciadi"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Görsellerinizin bulunduğu Instagram hesabınız
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Participation Days */}
                        <div className="space-y-3">
                            <FormLabel className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Katılım Günleri
                            </FormLabel>
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="day27"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <label
                                                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-border hover:border-green-300"
                                                        }`}
                                                >
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <div className="font-semibold">27 Aralık</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Cumartesi
                                                        </div>
                                                    </div>
                                                    {field.value && (
                                                        <Check className="w-5 h-5 text-green-500" />
                                                    )}
                                                </label>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="day28"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <label
                                                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value
                                                        ? "border-red-500 bg-red-50"
                                                        : "border-border hover:border-red-300"
                                                        }`}
                                                >
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <div className="font-semibold">28 Aralık</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Pazar
                                                        </div>
                                                    </div>
                                                    {field.value && (
                                                        <Check className="w-5 h-5 text-red-500" />
                                                    )}
                                                </label>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {form.formState.errors.day28 && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.day28.message}
                                </p>
                            )}
                        </div>

                        {/* Logo Upload */}
                        <FormField
                            control={form.control}
                            name="logoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Logonuz
                                    </FormLabel>
                                    <FormControl>
                                        <div>
                                            {logoUrl ? (
                                                <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-border">
                                                    <Image
                                                        src={logoUrl}
                                                        alt="Logo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLogoUrl("");
                                                            field.onChange("");
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <UploadDropzone
                                                    endpoint="guestImageUploader"
                                                    onClientUploadComplete={(res) => {
                                                        if (res?.[0]) {
                                                            setLogoUrl(res[0].ufsUrl);
                                                            field.onChange(res[0].ufsUrl);
                                                        }
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast({
                                                            title: "Yükleme Hatası",
                                                            description: error.message,
                                                            variant: "destructive",
                                                        });
                                                    }}
                                                    className="ut-label:text-sm ut-allowed-content:text-xs border-dashed"
                                                />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ürünleriniz Hakkında</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ne tür ürünler satıyorsunuz? El yapımı mı? Hikayeniz nedir?"
                                            className="h-24"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Ürünlerinizin el emeği, hikayesi, doğallığı,
                                        sürdürülebilirliği ve yaratıcı unsurları
                                        değerlendirilecektir.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Gönderiliyor
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Başvuruyu Gönder
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
