"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

// Define a type for our user profile
interface UserProfile {
  role: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isAdmin = useMemo(() => userProfile?.role === "admin", [userProfile])

  const supabase = useMemo(() => createClient(), [])

  const checkUserProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setUserProfile(null)
      return
    }
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()
      
      if (error) {
        console.error("Error fetching user profile:", error)
        setUserProfile(null)
      } else {
        setUserProfile(data as UserProfile)
      }
    } catch (e) {
      setUserProfile(null)
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setUser(null)
        setUserProfile(null)
      } else {
        setUser(user)
        await checkUserProfile(user)
      }
    } catch (error) {
      setUser(null)
      setUserProfile(null)
    }
  }, [supabase, checkUserProfile])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      await checkUserProfile(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null
        setUser(user)
        await checkUserProfile(user)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, checkUserProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      // Handle sign out error silently
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, userProfile, isAdmin, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
