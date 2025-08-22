'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        success:
          'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100',
        error:
          'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
        warning:
          'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100',
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  toast: Toast
  onClose: (id: string) => void
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(toast.id), 300) // Allow time for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const getIcon = () => {
    const iconClass = 'h-5 w-5 flex-shrink-0'

    switch (toast.type) {
      case 'success':
        return (
          <svg
            className={iconClass}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case 'error':
        return (
          <svg
            className={iconClass}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg
            className={iconClass}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )
      case 'info':
        return (
          <svg
            className={iconClass}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  return (
    <div
      className={cn(
        toastVariants({ variant: toast.type }),
        !isVisible && 'opacity-0 translate-x-full'
      )}
      style={{
        transition: 'all 0.3s ease-out',
      }}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <div className="text-sm font-semibold">{toast.title}</div>
          )}
          <div className="text-sm">{toast.message}</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={() => onClose(toast.id)}
          className="text-current hover:opacity-70 transition-opacity"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Toast Context
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (message: string, options?: Partial<Toast>) => void
  error: (message: string, options?: Partial<Toast>) => void
  warning: (message: string, options?: Partial<Toast>) => void
  info: (message: string, options?: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      return updated.slice(0, maxToasts)
    })
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message: string, options?: Partial<Toast>) => {
    addToast({ message, type: 'success', ...options })
  }

  const error = (message: string, options?: Partial<Toast>) => {
    addToast({ message, type: 'error', ...options })
  }

  const warning = (message: string, options?: Partial<Toast>) => {
    addToast({ message, type: 'warning', ...options })
  }

  const info = (message: string, options?: Partial<Toast>) => {
    addToast({ message, type: 'info', ...options })
  }

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const container = (
    <div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-2">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )

  return createPortal(container, document.body)
}

// Simple toast function for quick usage - placeholder for future implementation
export const toast = {
  success: (_message: string, _options?: Partial<Toast>) => {
    // This would need to be implemented with a global toast context
    // console.log('Success:', message, options)
  },
  error: (_message: string, _options?: Partial<Toast>) => {
    // console.log('Error:', message, options)
  },
  warning: (_message: string, _options?: Partial<Toast>) => {
    // console.log('Warning:', message, options)
  },
  info: (_message: string, _options?: Partial<Toast>) => {
    // console.log('Info:', message, options)
  },
}

export { ToastComponent, toastVariants }
