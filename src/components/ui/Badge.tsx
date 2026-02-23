import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        planning: "bg-lavender-100 text-lavender-600",
        booked: "bg-sky-pastel-100 text-sky-pastel-600",
        ongoing: "bg-amber-pastel-100 text-amber-pastel-500",
        completed: "bg-sage-100 text-sage-600",
        cancelled: "bg-rose-pastel-100 text-rose-pastel-500",
        confirmed: "bg-sage-100 text-sage-600",
        option: "bg-surface-3 text-text-secondary",
        default: "bg-surface-3 text-text-secondary",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const statusLabels: Record<string, string> = {
  planning: "Planning",
  booked: "Booked",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};
