import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "secondary",
    size = "md",
    className = "",
    ...props
  },
  ref
) {
  const base = "inline-flex items-center justify-center rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-blue-500 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-surface-elevated text-gray-200 border border-white/10 hover:bg-surface-overlay",
    ghost: "text-gray-400 hover:text-gray-200 hover:bg-white/5",
  };
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };
  return (
    <button
      ref={ref}
      type="button"
      // Safe: `variant` and `size` are strict union props that can only map to known keys.
      // eslint-disable-next-line security/detect-object-injection
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
