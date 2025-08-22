'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from './Button'

const modalVariants = cva(
  'relative bg-white dark:bg-slate-800 rounded-lg shadow-xl transform transition-all',
  {
    variants: {
      size: {
        sm: 'w-full max-w-md',
        md: 'w-full max-w-lg',
        lg: 'w-full max-w-2xl',
        xl: 'w-full max-w-4xl',
        full: 'w-full max-w-7xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscapeKey?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  className,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscapeKey && event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscapeKey, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className={cn(modalVariants({ size }), className)}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg
                  className="h-6 w-6"
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
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'info',
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  title: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  size?: VariantProps<typeof modalVariants>['size']
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = '저장',
  cancelText = '취소',
  isLoading = false,
  size = 'md',
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit(event)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button type="submit" loading={isLoading}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { Modal, modalVariants }
