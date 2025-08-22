'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Spinner Component
const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
        xl: 'h-12 w-12 border-4',
      },
      color: {
        primary: 'text-slate-600 dark:text-slate-400',
        secondary: 'text-slate-400 dark:text-slate-500',
        white: 'text-white',
        success: 'text-emerald-500',
        warning: 'text-amber-500',
        error: 'text-red-500',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
)

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size, color, className }) => (
  <div
    className={cn(spinnerVariants({ size, color }), className)}
    role="status"
    aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
)

// Dots Spinner
interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  color = 'text-slate-600 dark:text-slate-400',
  className,
}) => {
  const dotSize = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  }

  return (
    <div
      className={cn('flex space-x-1', className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map(index => (
        <div
          key={index}
          className={cn(
            dotSize[size],
            color,
            'bg-current rounded-full animate-pulse'
          )}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Progress Bar
interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const colorClasses = {
    primary: 'bg-slate-600 dark:bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}

// Skeleton Component
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700'

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, 'h-4 rounded')}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    )
  }

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
      }}
    />
  )
}

// Loading Overlay
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  overlay?: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerSize = 'lg',
  className,
  overlay = true,
}) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center z-10',
          overlay && 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'
        )}
      >
        <Spinner size={spinnerSize} />
      </div>
    )}
  </div>
)

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn('p-6 space-y-4', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" width={80} height={32} />
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  </div>
)

// Table Skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={colIndex === 0 ? '25%' : '20%'}
          />
        ))}
      </div>
    ))}
  </div>
)

export { spinnerVariants, Spinner as Loading, Skeleton as LoadingSkeleton }
