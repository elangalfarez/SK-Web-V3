// src/components/ui/badge.tsx
// Modified: replaced hardcoded colors with semantic theme tokens
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-text-inverse hover:bg-accent-hover shadow-lg shadow-accent/20",
        secondary:
          "border-transparent bg-accent text-text-inverse hover:bg-accent-hover shadow-lg shadow-accent/30",
        destructive:
          "border-transparent bg-error text-text-inverse hover:bg-error/80",
        outline: "border-accent text-accent hover:bg-accent hover:text-text-inverse",
        success: "border-transparent bg-success text-text-inverse hover:bg-success/80",
        warning: "border-transparent bg-warning text-text-inverse hover:bg-warning/80",
        info: "border-transparent bg-info text-text-inverse hover:bg-info/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }