"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FeatureFlagName, setStoredFlags, getStoredFlags, getCurrentEnvironment, setCurrentEnvironment } from './featureFlags'
import { getUser, setUser as setStoredUser, type User } from './getUser'

const FeatureFlagsContext = createContext<{
  flags: Record<string, any>
  currentEnvironment: string
  currentUser: User
  updateFlag: (name: FeatureFlagName, value: any) => void
  deleteFlag: (name: FeatureFlagName) => void
  setEnvironment: (env: string) => void
  setUser: (user: User) => void
} | null>(null)

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, any>>({})
  const [currentEnvironment, setCurrentEnv] = useState<string>('production')
  const [currentUser, setCurrentUser] = useState<User>(getUser())

  useEffect(() => {
    setFlags(getStoredFlags())
    setCurrentEnv(getCurrentEnvironment())
  }, [])

  const updateFlag = (name: FeatureFlagName, value: any) => {
    const newFlags = { ...flags, [name]: value }
    setFlags(newFlags)
    setStoredFlags(newFlags)
  }

  const deleteFlag = (name: FeatureFlagName) => {
    const newFlags = { ...flags }
    delete newFlags[name]
    setFlags(newFlags)
    setStoredFlags(newFlags)
  }

  const setEnvironment = (env: string) => {
    setCurrentEnv(env)
    setCurrentEnvironment(env)
  }

  const setUser = (user: User) => {
    setCurrentUser(user)
    setStoredUser(user)
  }

  return (
    <FeatureFlagsContext.Provider value={{ flags, currentEnvironment, currentUser, updateFlag, deleteFlag, setEnvironment, setUser }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (!context) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider')
  return context
}