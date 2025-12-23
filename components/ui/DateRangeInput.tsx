"use client";

import React, { useState, useEffect, useRef } from "react";

interface DateRangeInputProps {
  label?: string;
  valueInicio: string; // formato ISO (YYYY-MM-DD)
  valueFim: string; // formato ISO (YYYY-MM-DD)
  onChangeInicio: (value: string) => void; // retorna ISO
  onChangeFim: (value: string) => void; // retorna ISO
  error?: string;
  className?: string;
}

export function DateRangeInput({ 
  label, 
  valueInicio, 
  valueFim, 
  onChangeInicio, 
  onChangeFim, 
  error, 
  className = "" 
}: DateRangeInputProps) {
  const [displayInicio, setDisplayInicio] = useState("");
  const [displayFim, setDisplayFim] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inicioInputRef = useRef<HTMLInputElement>(null);
  const fimInputRef = useRef<HTMLInputElement>(null);
  const [activeField, setActiveField] = useState<"inicio" | "fim">("inicio");
  const [calendarPosition, setCalendarPosition] = useState({ left: 0 });

  // Calcular posição do calendário quando isOpen mudar
  useEffect(() => {
    if (isOpen) {
      const inputRef = activeField === "inicio" ? inicioInputRef.current : fimInputRef.current;
      const containerRef = calendarRef.current?.parentElement;
      if (inputRef && containerRef) {
        const inputRect = inputRef.getBoundingClientRect();
        const containerRect = containerRef.getBoundingClientRect();
        const left = inputRect.left - containerRect.left;
        setCalendarPosition({ left });
      }
    }
  }, [isOpen, activeField]);

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
    if (valueInicio) {
      setDisplayInicio(formatToDisplay(valueInicio));
    } else {
      setDisplayInicio("");
    }
  }, [valueInicio]);

  useEffect(() => {
    if (valueFim) {
      setDisplayFim(formatToDisplay(valueFim));
    } else {
      setDisplayFim("");
    }
  }, [valueFim]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>, field: "inicio" | "fim") => {
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
    
    if (field === "inicio") {
      setDisplayInicio(formatted);
    } else {
      setDisplayFim(formatted);
    }
    
    // Se tiver 10 caracteres (DD/MM/AAAA completo), tentar converter
    if (formatted.length === 10) {
      const iso = parseFromDisplay(formatted);
      if (iso) {
        if (field === "inicio") {
          onChangeInicio(iso);
        } else {
          onChangeFim(iso);
        }
      }
    }
  };

  const handleCalendarSelect = (date: Date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (activeField === "inicio") {
      onChangeInicio(iso);
      setActiveField("fim");
    } else {
      onChangeFim(iso);
      setIsOpen(false);
    }
  };

  const handleInputFocus = (field: "inicio" | "fim") => {
    setActiveField(field);
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
  const currentDate = activeField === "inicio" && valueInicio 
    ? new Date(valueInicio + "T00:00:00")
    : activeField === "fim" && valueFim
    ? new Date(valueFim + "T00:00:00")
    : today;
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Atualizar view quando mudar o campo ativo - memoizado para evitar re-renders
  useEffect(() => {
    const dateToUse = activeField === "inicio" && valueInicio 
      ? new Date(valueInicio + "T00:00:00")
      : activeField === "fim" && valueFim
      ? new Date(valueFim + "T00:00:00")
      : today;
    
    // Só atualizar se realmente mudou
    const newMonth = dateToUse.getMonth();
    const newYear = dateToUse.getFullYear();
    
    if (viewMonth !== newMonth || viewYear !== newYear) {
      setViewMonth(newMonth);
      setViewYear(newYear);
    }
  }, [activeField, valueInicio, valueFim, viewMonth, viewYear]);

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
    <div className={`w-full relative ${className}`} ref={calendarRef} style={{ zIndex: isOpen ? 50 : 'auto' }}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">De</span>
          <input
            ref={inicioInputRef}
            type="text"
            value={displayInicio}
            onChange={(e) => handleDisplayChange(e, "inicio")}
            onFocus={() => handleInputFocus("inicio")}
            placeholder="DD/MM/AAAA"
            className={`w-[110px] px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Até</span>
          <input
            ref={fimInputRef}
            type="text"
            value={displayFim}
            onChange={(e) => handleDisplayChange(e, "fim")}
            onFocus={() => handleInputFocus("fim")}
            placeholder="DD/MM/AAAA"
            className={`w-[110px] px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            }`}
          />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64" style={{ left: `${calendarPosition.left}px` }}>
          <div className="mb-2 text-xs text-gray-600">
            Selecione {activeField === "inicio" ? "data inicial" : "data final"}
          </div>
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
              const isSelectedInicio =
                valueInicio &&
                date.toDateString() === new Date(valueInicio + "T00:00:00").toDateString();
              const isSelectedFim =
                valueFim &&
                date.toDateString() === new Date(valueFim + "T00:00:00").toDateString();
              const isToday =
                date.toDateString() === today.toDateString();
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleCalendarSelect(date)}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    isSelectedInicio || isSelectedFim
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

