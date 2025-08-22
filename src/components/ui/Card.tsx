'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-slate-200 dark:border-slate-700',
        outline: 'border-slate-300 dark:border-slate-600',
        ghost: 'border-transparent shadow-none',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        glow: 'transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50',
        border:
          'transition-colors duration-200 hover:border-slate-400 dark:hover:border-slate-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover }), className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Interactive Card with click handler
interface InteractiveCardProps extends CardProps {
  onClick?: () => void
  disabled?: boolean
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  (
    { className, onClick, disabled, children, hover = 'lift', ...props },
    ref
  ) => (
    <Card
      ref={ref}
      className={cn(
        onClick &&
          !disabled &&
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      hover={disabled ? 'none' : hover}
      onClick={disabled ? undefined : onClick}
      tabIndex={onClick && !disabled ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={
        onClick && !disabled
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Card>
  )
)
InteractiveCard.displayName = 'InteractiveCard'

// Card Header
const CardHeaderCompound: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  >
    {children}
  </div>
)
CardHeaderCompound.displayName = 'CardHeaderCompound'

// Card Body
const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
)
CardBody.displayName = 'CardBody'

// Stats Card
interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => (
  <Card className={cn('', className)} hover="glow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {value}
          </p>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-slate-400 dark:text-slate-500">{icon}</div>
        )}
      </div>
    </CardContent>
  </Card>
)

// Attach compound components to Card
const CardWithCompounds = Card as typeof Card & {
  Header: typeof CardHeaderCompound
  Body: typeof CardBody
  Content: typeof CardContent
  Footer: typeof CardFooter
}

CardWithCompounds.Header = CardHeaderCompound
CardWithCompounds.Body = CardBody
CardWithCompounds.Content = CardContent
CardWithCompounds.Footer = CardFooter

export {
  CardWithCompounds as Card,
  CardHeader,
  CardHeaderCompound,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  InteractiveCard,
  StatsCard,
  cardVariants,
}
