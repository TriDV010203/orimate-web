import { cn } from "./card";
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
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#2d6a4f] to-[#40916c] text-white shadow-md hover:shadow-lg",
    outline:
      "border-2 border-gray-200 bg-white text-gray-700 hover:border-[#2d6a4f] hover:text-[#2d6a4f]",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
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
