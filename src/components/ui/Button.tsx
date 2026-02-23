import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-rose-pastel-300 text-white hover:bg-rose-pastel-600 active:bg-rose-pastel-700 shadow-sm hover:scale-106",
        secondary:
          "bg-surface-3 text-text-primary hover:bg-border border border-border hover:scale-106",
        ghost: "text-text-secondary hover:bg-surface-3 hover:text-text-primary hover:scale-106",
        danger: "bg-rose-pastel-500 text-white hover:bg-rose-pastel-600 hover:scale-106",
        outline:
          "border border-border bg-transparent hover:bg-surface-3 text-text-primary hover:scale-106",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";
