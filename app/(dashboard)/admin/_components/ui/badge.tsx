import { cn } from "./utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10",
    success:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-[#10b981]/10 dark:text-[#10b981] dark:border-[#10b981]/20",
    danger:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    warning:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-[#f59e0b]/10 dark:text-[#f59e0b] dark:border-[#f59e0b]/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center text-xs font-medium border transition-colors",
        variants[variant],
        className,
      )}
      style={{
        padding: "4px 12px",
        borderRadius: "9999px",
        whiteSpace: "nowrap",
      }}
      {...props}
    >
      {children}
    </span>
  );
}
