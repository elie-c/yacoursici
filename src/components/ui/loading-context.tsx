"use client"

import React, { createContext, useContext, useState } from 'react'

type LoadingContextValue = {
  loading: boolean
  setLoading: (v: boolean) => void
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  return <LoadingContext.Provider value={{ loading, setLoading }}>{children}</LoadingContext.Provider>
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider')
  return ctx
}
