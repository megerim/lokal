"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-context";
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
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";

const formSchema = z
  .object({
    brandName: z.string().min(2, "Marka adı en az 2 karakter olmalıdır"),
    instagram: z.string().min(1, "Instagram linki zorunludur"),
    day28: z.boolean(),
    day29: z.boolean(),
    logoUrl: z.string().min(1, "Logo yüklemeniz zorunludur"),
    description: z
      .string()
      .min(20, "Lütfen ürünlerinizi en az 20 karakterle anlatınız"),
  })
  .refine((data) => data.day28 || data.day29, {
    message: "En az bir gün seçmelisiniz",
    path: ["day28"],
  });

const benefits = [
  "Özel standınız (70x100 cm)",
  "2 Sandalye",
  "Elektrik",
  "Masa örtüsü (yılbaşı uyumlu)",
  "Kapalı alan",
  "Isıtıcı",
  "Çay & Kahve & Yemek ikramları",
  "Özel personel",
  "İsimlikler (PVC ile hazırlanmış)",
  "Ürün kârı tamamen sizin",
  "0% komisyon",
  "En az 1 ürününüz çekiliş aracılığı ile satılacak",
];

interface MarketApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketApplicationForm({
  isOpen,
  onClose,
}: MarketApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: "",
      instagram: "",
      day28: false,
      day29: false,
      logoUrl: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Başvuru yapmak için lütfen giriş yapınız.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const participationDays = [];
      if (values.day28) participationDays.push("28 Aralık");
      if (values.day29) participationDays.push("29 Aralık");

      const { error } = await supabase.from("market_applications").insert({
        user_id: user.id,
        brand_name: values.brandName,
        instagram_handle: values.instagram,
        participation_days: participationDays,
        logo_url: values.logoUrl,
        product_description: values.description,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Başvuru Alındı! 🎉",
        description:
          "Başvurunuz başarıyla alındı. Onaylandıktan sonra ödeme bilgileri ile iletişime geçeceğiz.",
      });

      onClose();
      form.reset();
      setLogoUrl("");
    } catch (error) {
      console.error("Application error:", error);
      toast({
        title: "Hata",
        description: "Başvuru gönderilirken bir hata oluştu.",
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
          <DialogTitle className="text-2xl">🎄 Stant Başvuru Formu</DialogTitle>
          <DialogDescription>
            Yılbaşı pazarımızda yer almak için formu doldurun. Ürünlerinizin ve
            sizin Lokal'in ruhunu yansıtmasını bekliyoruz.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/30 dark:to-green-950/30 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            🎁 Size Sunduklarımız
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              💰 Başvuru onaylandıktan sonra katılım ücreti için ödeme bilgileri
              paylaşılacaktır.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  name="day28"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <label
                          className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            field.value
                              ? "border-red-500 bg-red-50 dark:bg-red-950/30"
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
                              Cumartesi
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
                <FormField
                  control={form.control}
                  name="day29"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <label
                          className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            field.value
                              ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                              : "border-border hover:border-green-300"
                          }`}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="hidden"
                          />
                          <div className="text-center">
                            <div className="font-semibold">29 Aralık</div>
                            <div className="text-xs text-muted-foreground">
                              Pazar
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
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.[0]) {
                              setLogoUrl(res[0].url);
                              field.onChange(res[0].url);
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
                className="bg-red-600 hover:bg-red-700"
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
