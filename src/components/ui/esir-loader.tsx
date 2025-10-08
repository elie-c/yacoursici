"use client"

import React from 'react'
import { createPortal } from 'react-dom'

export default function EsirLoader() {
  if (typeof document === 'undefined') return null

  const el = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 pointer-events-auto">
      <style>{`
        @keyframes esir-bounce { 0% { transform: translateY(0); } 30% { transform: translateY(-14px); } 60% { transform: translateY(0); } 100% { transform: translateY(0); } }
      `}</style>
      <div className="flex items-end space-x-3">
        {['E','S','I','R'].map((ch, i) => (
          <span
            key={i}
            className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg"
            style={{ animation: `esir-bounce 0.9s ease-in-out ${i * 0.12}s infinite` }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  )

  return createPortal(el, document.body)
}
