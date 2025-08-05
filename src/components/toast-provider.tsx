"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ToastContextType {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Array<{ id: number; type: string; message: string }>>([])

  const addToast = (type: string, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const success = (message: string) => addToast("success", message)
  const error = (message: string) => addToast("error", message)
  const info = (message: string) => addToast("info", message)

  const toast = { success, error, info }

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
      case "error":
        return "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20"
      case "info":
        return "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
      default:
        return "bg-gray-700 border-gray-600 text-white shadow-lg"
    }
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-right-full ${getToastStyles(toast.type)}`}
          >
            <div className="flex items-center space-x-2">
              <div className="font-medium">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}
