import React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info";
  title?: string;
  onClose?: () => void;
  className?: string;
  dismissible?: boolean;
}

export function Alert({
  children,
  variant = "info",
  title,
  onClose,
  className = "",
  dismissible = false,
}: AlertProps) {
  const variantClasses = {
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    danger: "bg-red-50 border-red-200 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconClasses = {
    success: "✅",
    warning: "⚠️",
    danger: "❌",
    info: "ℹ️",
  };

  const icon = iconClasses[variant];

  return (
    <div
      className={`border rounded-lg p-4 animate-fade-in ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 text-lg">{icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
            aria-label="Fechar alerta"
          >
            <span className="text-xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
}

