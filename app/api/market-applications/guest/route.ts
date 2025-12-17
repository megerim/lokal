import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

// Validation schema for guest market application
const guestApplicationSchema = z.object({
  brandName: z.string().min(2, "Marka adı en az 2 karakter olmalıdır"),
  instagram: z.string().min(1, "Instagram linki zorunludur"),
  day27: z.boolean(),
  day28: z.boolean(),
  logoUrl: z.string().min(1, "Logo yüklemeniz zorunludur"),
  description: z.string().min(20, "Lütfen ürünlerinizi en az 20 karakterle anlatınız"),
  guestEmail: z.string().email("Geçerli bir e-posta adresi giriniz"),
  guestPhone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
}).refine((data) => data.day27 || data.day28, {
  message: "En az bir gün seçmelisiniz",
  path: ["day28"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validationResult = guestApplicationSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join("."),
        message: e.message
      }))
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Doğrulama hatası",
          details: errors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    
    // Build participation days array
    const participationDays: string[] = []
    if (data.day27) participationDays.push("27 Aralık")
    if (data.day28) participationDays.push("28 Aralık")

    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    // Insert the guest application
    const { data: application, error } = await supabase
      .from("market_applications")
      .insert({
        user_id: null, // Guest application, no user
        brand_name: data.brandName,
        instagram_handle: data.instagram,
        participation_days: participationDays,
        logo_url: data.logoUrl,
        product_description: data.description,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        is_guest: true,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting guest application:", error)
      
      // Handle specific error cases
      if (error.code === "23505") {
        return NextResponse.json(
          { 
            success: false, 
            error: "Bu e-posta adresi ile zaten bir başvuru yapılmış." 
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Başvuru kaydedilirken bir hata oluştu." 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Başvurunuz başarıyla alındı!",
      data: {
        id: application.id,
        brandName: application.brand_name,
      }
    })

  } catch (error) {
    console.error("Error in guest market application:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Beklenmeyen bir hata oluştu." 
      },
      { status: 500 }
    )
  }
}
