"use client"

import React from 'react'
import { LoadingProvider, useLoading } from './ui/loading-context'
import EsirLoader from './ui/esir-loader'
import { usePathname, useSearchParams } from 'next/navigation'

function Overlay() {
  const { loading, setLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // hide loader when pathname or search params change (client navigation completed)
  React.useEffect(() => {
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()])

  if (!loading) return null
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 pointer-events-auto">
      <EsirLoader />
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Show a quick overlay on full page reloads (beforeunload)
    const onBeforeUnload = () => {
      try {
        const el = document.createElement('div')
        el.setAttribute('id', 'esir-reload-overlay')
        el.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5)')
        el.innerHTML = `<div style="font-size:48px;color:white;font-weight:700;">ESIR</div>`
        document.body.appendChild(el)
      } catch (e) {
        // ignore
      }
    }

    const onPageShow = () => {
      const existing = document.getElementById('esir-reload-overlay')
      if (existing) existing.remove()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('load', onPageShow)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('load', onPageShow)
    }
  }, [])

  return (
    <LoadingProvider>
      {children}
      <Overlay />
    </LoadingProvider>
  )
}
