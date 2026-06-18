import { clsx, type ClassValue } from "clsx";

export function cn(...classes: ClassValue[]) {
  return clsx(classes);
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
