import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[#0B4964] text-white hover:bg-[#0B4964]/90",
      secondary: "bg-[#F8F9FA] text-[#1A1A1A] border border-gray-200 hover:bg-gray-100",
      outline: "border border-[#0B4964] text-[#0B4964] hover:bg-[#0B4964]/5",
      ghost: "text-[#666666] hover:bg-gray-100",
      gradient: "bg-gradient-to-r from-[#FB2965] to-[#FF4500] text-white hover:opacity-90",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#FB2965] transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

export const Card = ({ className, children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={cn("bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow", className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-[#FB2965]/10 text-[#FB2965]", className)}>
    {children}
  </span>
);
