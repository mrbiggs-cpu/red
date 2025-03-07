"use client"

import { useContext } from "react"
import { ToastContext } from "@/contexts/ToastContext"
import { ToastActionElement, type ToastProps } from "@/components/ui/toast"

type ToastOptions = Partial<
  Pick<ToastProps, "variant" | "duration">
> & {
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
}

export const useToast = () => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
} 