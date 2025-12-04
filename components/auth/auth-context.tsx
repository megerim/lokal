"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const supabase = useMemo(() => createClient(), [])

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", userId)
        .single()

      if (error || !profile) {
        setIsAdmin(false)
        return
      }

      setIsAdmin(profile.role === 'admin')
    } catch (error) {
      setIsAdmin(false)
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        setUser(null)
        setIsAdmin(false)
      } else {
        setUser(user)
        if (user) {
          await fetchUserRole(user.id)
        }
      }
    } catch (error) {
      setUser(null)
      setIsAdmin(false)
    }
  }, [supabase, fetchUserRole])

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          setUser(null)
          setIsAdmin(false)
        } else {
          setUser(user)
          if (user) {
            await fetchUserRole(user.id)
          }
        }
      } catch (error) {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserRole])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      // Handle sign out error silently
    }
  }, [supabase])

  return <AuthContext.Provider value={{ user, loading, isAdmin, signOut, refreshUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
