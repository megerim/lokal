import type { Metadata } from "next"
import AdminPageClient from "./admin-page-client"

// Server component can export metadata
export const metadata: Metadata = {
  title: "Admin Paneli",
  description: "Duyuruları yönetin ve katılımcıları görüntüleyin.",
robots: {
    index: false,
    follow: false,
  },
}

// Server component simply renders the client component
export default function AdminPage() {
  return <AdminPageClient />
}
