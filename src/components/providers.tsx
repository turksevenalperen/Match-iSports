"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/components/toast-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
