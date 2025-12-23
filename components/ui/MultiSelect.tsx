"use client";

import React, { useState, useRef, useEffect } from "react";
import { Badge } from "./Badge";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  label,
  options,
  value = [],
  onChange,
  placeholder = "Selecione...",
  error,
  className = "",
  maxDisplay = 3,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const displayedOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = selectedOptions.length - maxDisplay;

  return (
    <div ref={wrapperRef} className={`w-full relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-white border rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[42px] flex items-center flex-wrap gap-2 ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        } ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <>
            {displayedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="default"
                className="flex items-center space-x-1"
              >
                <span>{option.label}</span>
                <button
                  onClick={(e) => removeOption(option.value, e)}
                  className="ml-1 hover:text-red-600 focus:outline-none"
                  aria-label={`Remover ${option.label}`}
                >
                  ×
                </button>
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="default" className="bg-gray-200 text-gray-700">
                +{remainingCount}
              </Badge>
            )}
          </>
        )}
        <span className="ml-auto text-gray-400">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto animate-fade-in">
          {options.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Nenhuma opção disponível
            </div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={`p-3 cursor-pointer transition-colors flex items-center ${
                    isSelected
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(option.value)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-gray-900">{option.label}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

