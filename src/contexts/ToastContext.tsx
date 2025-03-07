"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

type ToastOptions = Partial<
  Pick<ToastProps, "variant" | "duration">
> & {
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = ToastOptions & {
  id: string
}

type ToastContextType = {
  toasts: Toast[]
  toast: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, ...options }
    
    setToasts((prevToasts) => [...prevToasts, newToast])
    
    if (options.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id)
      }, options.duration || 5000)
    }
  }

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
} 