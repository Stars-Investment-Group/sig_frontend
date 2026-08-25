import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-slate-900/20 dark:bg-slate-50/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-slate-900 transition-all dark:bg-slate-50"
      style={
        {
          transform: `translateX(-${100 - (value || 0)}%)`,
          // La barre de progression hérite de la couleur via la variable CSS
          // `--progress-foreground` quand elle est fournie (sinon couleur par défaut)
          backgroundColor: "var(--progress-foreground, undefined)",
          ...(props.style as React.CSSProperties),
        } as React.CSSProperties
      }
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }