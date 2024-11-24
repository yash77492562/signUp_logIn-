// button.tsx
import React from 'react';
import { cn } from "./lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function Button({ 
  title, 
  children,
  onClick, 
  className, 
  type = "button",
  disabled,
  loading = false,
  fullWidth = false,
  ...props 
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "relative text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
        "hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300",
        "dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg",
        "dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5",
        "text-center transition-all duration-200 ease-in-out",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        loading && "cursor-wait",
        fullWidth && "w-full",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        children || title
      )}
    </button>
  );
}

// Rest of the ButtonUpload component remains the same...

interface ButtonUploadProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ButtonUpload({
  variant = 'default',
  size = 'default',
  className = "",
  children,
  type = "button",
  disabled,
  loading = false,
  fullWidth = false,
  ...props
}: ButtonUploadProps) {
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };

  const sizes = {
    default: "h-10 py-2 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : children}
    </button>
  );
}