import { cn } from "./utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "outline" | "ghost";
}

export function Button({
  className,
  variant = "primary",
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-[#10b981]/20",
    outline:
      "border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
