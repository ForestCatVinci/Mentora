import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api, UserProfile } from '../lib/api'

export interface AuthState {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (id: string) => {
    try {
      const profile = await api.getMe(id)
      setUser(profile)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const refresh = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) await loadProfile(data.session.user.id)
  }

  return { user, loading, signIn, signUp, signOut, refresh }
}
