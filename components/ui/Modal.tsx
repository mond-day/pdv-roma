import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "warning" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  variant = "default",
  size = "md"
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  const variantClasses = {
    default: "border-gray-200",
    warning: "border-yellow-400 bg-yellow-50",
    danger: "border-red-400 bg-red-50",
  };

  const titleVariantClasses = {
    default: "text-gray-900",
    warning: "text-yellow-900",
    danger: "text-red-900",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 animate-fade-in"
          onClick={onClose}
        />

        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all animate-slide-up sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full border-2 ${variantClasses[variant]}`}>
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${titleVariantClasses[variant]}`}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
                aria-label="Fechar"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="text-gray-700">{children}</div>
          </div>
          {footer && (
            <div className={`bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 ${
              variant === "warning" ? "bg-yellow-50" : variant === "danger" ? "bg-red-50" : ""
            }`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

