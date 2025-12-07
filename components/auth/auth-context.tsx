"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react"
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
  const initialLoadDone = useRef(false)
  
  const supabase = useMemo(() => createClient(), [])

  const fetchUserRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", userId)
        .single()

      if (error || !profile) {
        return false
      }

      return profile.role === 'admin'
    } catch (error) {
      return false
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
          const adminStatus = await fetchUserRole(user.id)
          setIsAdmin(adminStatus)
        }
      }
    } catch (error) {
      setUser(null)
      setIsAdmin(false)
    }
  }, [supabase, fetchUserRole])

  useEffect(() => {
    let isMounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const initializeAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (!isMounted) return

        if (error) {
          setUser(null)
          setIsAdmin(false)
        } else {
          setUser(user)
          if (user) {
            const adminStatus = await fetchUserRole(user.id)
            if (isMounted) {
              setIsAdmin(adminStatus)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        if (isMounted) {
          initialLoadDone.current = true
          setLoading(false)
          
          // Set up auth state listener AFTER initial load is complete
          const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return
            
            // Skip INITIAL_SESSION since we already handled it
            if (event === 'INITIAL_SESSION') return
            
            setUser(session?.user ?? null)
            
            if (session?.user) {
              const adminStatus = await fetchUserRole(session.user.id)
              if (isMounted) {
                setIsAdmin(adminStatus)
              }
            } else {
              setIsAdmin(false)
            }
          })
          subscription = data.subscription
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
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
