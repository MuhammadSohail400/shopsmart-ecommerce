import { cn } from "@/lib/utils"

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusVariant
  pulse?: boolean
}

export function StatusIndicator({ 
  variant = 'default', 
  pulse = false, 
  className, 
  children,
  ...props 
}: StatusIndicatorProps) {
  const variantStyles = {
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    error: 'bg-destructive/15 text-destructive border-destructive/30',
    info: 'bg-primary/15 text-primary border-primary/30',
    default: 'bg-muted text-muted-foreground border-border',
  }

  const dotStyles = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
    info: 'bg-primary',
    default: 'bg-muted-foreground',
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="relative flex h-2 w-2 items-center justify-center">
        {pulse && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", dotStyles[variant])} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotStyles[variant])} />
      </div>
      {children}
    </div>
  )
}
