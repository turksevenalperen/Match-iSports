import { useState, useCallback } from "react"
import { Toast, ToastType } from "@/components/ui/toast"

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration: duration || 5000
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const toast = {
    success: (title: string, message?: string, duration?: number) => 
      addToast("success", title, message, duration),
    error: (title: string, message?: string, duration?: number) => 
      addToast("error", title, message, duration),
    warning: (title: string, message?: string, duration?: number) => 
      addToast("warning", title, message, duration),
    info: (title: string, message?: string, duration?: number) => 
      addToast("info", title, message, duration),
  }

  return {
    toasts,
    toast,
    removeToast
  }
}
