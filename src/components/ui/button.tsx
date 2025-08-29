// src/components/ui/button.tsx
// Modified: replaced hardcoded colors with semantic theme tokens
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-text-inverse hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20",
        destructive:
          "bg-error text-text-inverse hover:bg-error/90",
        outline:
          "border border-accent bg-transparent text-accent hover:bg-accent hover:text-text-inverse hover:shadow-lg hover:shadow-accent/20",
        secondary:
          "bg-accent text-text-inverse hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-hover",
        success: "bg-success text-text-inverse hover:bg-success/90",
        warning: "bg-warning text-text-inverse hover:bg-warning/90",
        info: "bg-info text-text-inverse hover:bg-info/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }