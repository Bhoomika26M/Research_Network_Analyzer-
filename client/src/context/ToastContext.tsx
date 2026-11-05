import { createContext, useContext, ReactNode } from 'react'
import { useToast, ToastType, Toast } from '../hooks/useToast'

interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider')
  return ctx
}

// Alias for easy import as useToast from context
export { useToastContext as useToast }
