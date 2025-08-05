"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/components/toast-provider"
import { NotificationProvider } from "@/contexts/NotificationContext"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <ToastProvider>{children}</ToastProvider>
      </NotificationProvider>
    </SessionProvider>
  )
}
