import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({ 
  children, 
  title, 
  className = "", 
  clickable = false,
  onClick,
  selected = false
}: CardProps) {
  const baseClasses = "bg-white rounded-lg shadow-sm border p-6 transition-all duration-200";
  const clickableClasses = clickable 
    ? "card-clickable cursor-pointer" 
    : "";
  const selectedClasses = selected
    ? "border-blue-500 bg-blue-50 shadow-md"
    : "border-gray-200";
  const hoverClasses = clickable && !selected
    ? "hover:shadow-md hover:border-blue-300"
    : "";

  return (
    <div 
      className={`${baseClasses} ${clickableClasses} ${selectedClasses} ${hoverClasses} ${className}`}
      onClick={clickable && onClick ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable && onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

