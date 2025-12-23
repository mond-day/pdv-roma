"use client";

import React, { useState, useEffect, useRef } from "react";

interface DateInputProps {
  label?: string;
  value: string; // formato ISO (YYYY-MM-DD) para o value interno
  onChange: (value: string) => void; // retorna ISO
  error?: string;
  className?: string;
}

export function DateInput({ label, value, onChange, error, className = "" }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Converter ISO para DD/MM/AAAA
  const formatToDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate + "T00:00:00");
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Converter DD/MM/AAAA para ISO
  const parseFromDisplay = (display: string): string | null => {
    const cleaned = display.replace(/\D/g, "");
    if (cleaned.length !== 8) return null;
    
    const day = parseInt(cleaned.substring(0, 2), 10);
    const month = parseInt(cleaned.substring(2, 4), 10);
    const year = parseInt(cleaned.substring(4, 8), 10);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
      return null;
    }

    const date = new Date(year, month - 1, day);
    if (
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (value) {
      setDisplayValue(formatToDisplay(value));
      const date = new Date(value + "T00:00:00");
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else {
      setDisplayValue("");
      setSelectedDate(null);
    }
  }, [value]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remover caracteres não numéricos
    input = input.replace(/\D/g, "");
    
    // Formatar enquanto digita: DD/MM/AAAA
    let formatted = "";
    if (input.length > 0) {
      formatted = input.substring(0, 2);
      if (input.length > 2) {
        formatted += "/" + input.substring(2, 4);
      }
      if (input.length > 4) {
        formatted += "/" + input.substring(4, 8);
      }
    }
    
    setDisplayValue(formatted);
    
    // Se tiver 10 caracteres (DD/MM/AAAA completo), tentar converter
    if (formatted.length === 10) {
      const iso = parseFromDisplay(formatted);
      if (iso) {
        onChange(iso);
      }
    }
  };

  const handleCalendarSelect = (date: Date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    onChange(iso);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  const currentMonth = selectedDate?.getMonth() ?? today.getMonth();
  const currentYear = selectedDate?.getFullYear() ?? today.getFullYear();
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className={`w-full relative ${className}`} ref={calendarRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleDisplayChange}
          onFocus={handleInputFocus}
          placeholder="DD/MM/AAAA"
          className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          📅
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <span className="font-semibold text-gray-900">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-xs font-semibold text-gray-600 text-center py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
            {days.map((day) => {
              const date = new Date(viewYear, viewMonth, day);
              const isSelected =
                selectedDate &&
                date.toDateString() === selectedDate.toDateString();
              const isToday =
                date.toDateString() === today.toDateString();
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleCalendarSelect(date)}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-900 hover:text-blue-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}



