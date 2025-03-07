"use client"

import { useContext } from "react"
import { ToastContext } from "@/contexts/ToastContext"

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// If you still want to keep the demo component, you can export it separately
export function ToastDemo() {
  const { toast } = useToast()
  return {
    toast: (props: {
      title: string;
      description: string;
    }) => {
      toast(props);
    }
  }
  
}
