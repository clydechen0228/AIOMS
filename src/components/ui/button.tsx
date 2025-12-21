import * as React from "react"

// I'll make a simple button without slot for now to avoid dependency issues since I can't install packages.
import { cn } from "../../lib/utils"

// Removed cva dependency too to keep it simple without class-variance-authority if it wasn't installed.
// Wait, I should implement a basic version.

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        // Basic variant handling manually since cva is likely missing
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

        let variantStyles = "bg-primary text-primary-foreground shadow hover:bg-primary/90"
        if (variant === "destructive") variantStyles = "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
        else if (variant === "outline") variantStyles = "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        else if (variant === "secondary") variantStyles = "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
        else if (variant === "ghost") variantStyles = "hover:bg-accent hover:text-accent-foreground"
        else if (variant === "link") variantStyles = "text-primary underline-offset-4 hover:underline"

        let sizeStyles = "h-9 px-4 py-2"
        if (size === "sm") sizeStyles = "h-8 rounded-md px-3 text-xs"
        else if (size === "lg") sizeStyles = "h-10 rounded-md px-8"
        else if (size === "icon") sizeStyles = "h-9 w-9"

        return (
            <button
                className={cn(baseStyles, variantStyles, sizeStyles, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
