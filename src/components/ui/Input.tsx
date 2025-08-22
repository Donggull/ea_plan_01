'use client'

import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-600',
  {
    variants: {
      variant: {
        default: '',
        error:
          'border-red-500 focus-visible:ring-red-500 dark:border-red-600 dark:focus-visible:ring-red-600',
        success:
          'border-emerald-500 focus-visible:ring-emerald-500 dark:border-emerald-600 dark:focus-visible:ring-emerald-600',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-3',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    React.useEffect(() => {
      if (type === 'password' && showPasswordToggle) {
        setInputType(showPassword ? 'text' : 'password')
      } else {
        setInputType(type)
      }
    }, [type, showPassword, showPasswordToggle])

    const finalVariant = errorText ? 'error' : variant

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: finalVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || (type === 'password' && showPasswordToggle)) &&
                'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
              {rightIcon}
            </div>
          )}

          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {(helperText || errorText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              errorText
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400'
            )}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
