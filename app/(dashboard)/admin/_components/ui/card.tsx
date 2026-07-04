import { cn } from "./utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#131722] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden text-slate-900 dark:text-white shadow-sm transition-colors duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
