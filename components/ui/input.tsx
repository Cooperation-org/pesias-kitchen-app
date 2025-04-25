import React from "react";
import { cn } from "@/lib/utils"; // if you're using className utils

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
