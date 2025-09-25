"use client"

import dynamic from "next/dynamic"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

// Dynamically import the AdminDashboard component
const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then(mod => mod.AdminDashboard), {
  loading: () => <LoadingSpinner />
})

export default function AdminPageClient() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If auth is done loading and the user is not an admin, redirect.
    if (!loading && !isAdmin) {
      router.replace("/")
    }
  }, [isAdmin, loading, router])

  // While loading authentication status, show a spinner.
  if (loading) {
    return <LoadingSpinner />
  }

  // If the user is an admin, render the dashboard.
  // The dynamic import will handle its own loading state.
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-16">
          <AdminDashboard />
        </div>
      </div>
    )
  }

  // If not an admin, show a spinner while redirecting.
  return <LoadingSpinner />
}
