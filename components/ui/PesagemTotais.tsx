import React from "react";
import { formatTonWithUnit } from "@/lib/utils/weight";

interface TotalItem {
  label: string;
  value: number;
  unit: "kg" | "t";
  highlight?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

interface PesagemTotaisProps {
  items: TotalItem[];
  className?: string;
}

export function PesagemTotais({ items, className = "" }: PesagemTotaisProps) {
  const formatValue = (value: number, unit: "kg" | "t") => {
    if (unit === "t") {
      // Converter kg para TON e formatar
      const ton = value / 1000;
      return formatTonWithUnit(ton);
    }
    // Para kg, também converter para TON e formatar
    const ton = value / 1000;
    return formatTonWithUnit(ton);
  };

  const getVariantClasses = (variant: TotalItem["variant"] = "default") => {
    const base = "p-4 rounded-lg border-2 transition-all duration-200";
    switch (variant) {
      case "success":
        return `${base} bg-green-50 border-green-200`;
      case "warning":
        return `${base} bg-yellow-50 border-yellow-200`;
      case "danger":
        return `${base} bg-red-50 border-red-200`;
      default:
        return `${base} bg-gray-50 border-gray-200`;
    }
  };

  const getTextColor = (variant: TotalItem["variant"] = "default") => {
    switch (variant) {
      case "success":
        return "text-green-900";
      case "warning":
        return "text-yellow-900";
      case "danger":
        return "text-red-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
      role="region"
      aria-label="Totais da pesagem"
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={getVariantClasses(item.variant)}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-gray-700 mb-1">{item.label}</p>
          <p
            className={`text-2xl font-bold ${getTextColor(item.variant)} ${
              item.highlight ? "animate-pulse-slow" : ""
            }`}
            aria-label={`${item.label}: ${item.value > 0 ? formatValue(item.value, item.unit) : "sem valor"}`}
          >
            {item.value > 0 ? formatValue(item.value, item.unit) : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

