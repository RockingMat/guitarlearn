"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400 text-white",
  secondary:
    "bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white",
  danger:
    "bg-red-500 hover:bg-red-600 focus:ring-red-400 text-white",
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`w-full px-4 py-2 font-semibold rounded-md focus:outline-none focus:ring-2 transition duration-300 ${
        variantClasses[variant]
      } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;
