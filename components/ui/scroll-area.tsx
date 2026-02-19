import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// We keep the variants object (even if simple)
const scrollAreaVariants = cva("relative overflow-hidden", {
  variants: {
    // This is just a placeholder variant so VariantProps is actually used
    // You can expand it later with real variants if needed
    radius: {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    radius: "md",
  },
})

// Now VariantProps is used here (TS sees it)
type ScrollAreaVariants = VariantProps<typeof scrollAreaVariants>

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ScrollAreaVariants
>(({ className, radius, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(scrollAreaVariants({ radius }), className)}
    {...props}
  >
    <div className="h-full w-full overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }