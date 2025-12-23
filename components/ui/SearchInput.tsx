"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import { Input } from "./Input";

interface SearchResult {
  id: string | number;
  label: string;
  subtitle?: string;
  metadata?: string;
}

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onSelect"> {
  label?: string;
  placeholder?: string;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onSelect?: (result: SearchResult) => void;
  debounceMs?: number;
  minChars?: number;
  emptyMessage?: string;
  loadingMessage?: string;
}

export function SearchInput({
  label,
  placeholder = "Digite para buscar...",
  onSearch,
  onSelect,
  debounceMs = 300,
  minChars = 2,
  emptyMessage = "Nenhum resultado encontrado",
  loadingMessage = "Buscando...",
  className = "",
  ...props
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentSearchQueryRef = useRef<string>("");
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Limpar timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (!query || query.length < minChars) {
      setResults([]);
      setIsLoading(false);
      setShowResults(false);
      currentSearchQueryRef.current = "";
      return;
    }

    // Armazenar a query atual para verificar depois se ainda é válida
    const searchQuery = query;
    currentSearchQueryRef.current = searchQuery;

    // Aguardar debounce antes de iniciar a busca
    timeoutRef.current = setTimeout(async () => {
      // Verificar se a query ainda é a mesma (pode ter mudado durante o debounce)
      if (currentSearchQueryRef.current !== searchQuery) {
        return; // Query mudou, ignorar este resultado
      }

      // Mostrar loading SEM esconder resultados anteriores (evita flickering)
      setIsLoading(true);
      
      if (onSearch) {
        try {
          const searchResults = await onSearch(searchQuery);
          
          // Verificar novamente se a query ainda é a mesma após a busca
          if (currentSearchQueryRef.current !== searchQuery) {
            return; // Query mudou durante a busca, ignorar resultado
          }
          
          const resultsArray = searchResults || [];
          
          // Atualizar estados de forma atômica - tudo de uma vez
          // Usar startTransition para agrupar atualizações e evitar flickering
          startTransition(() => {
            setResults(resultsArray);
            setIsLoading(false);
            setShowResults(resultsArray.length > 0);
          });
        } catch (error) {
          // Verificar se a query ainda é a mesma antes de atualizar estados
          if (currentSearchQueryRef.current !== searchQuery) {
            return;
          }
          
          console.error("Erro na busca:", error);
          startTransition(() => {
            setResults([]);
            setIsLoading(false);
            setShowResults(false);
          });
        }
      } else {
        setIsLoading(false);
        setShowResults(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [query, onSearch, debounceMs, minChars]);

  const handleSelect = (result: SearchResult) => {
    // Atualizar query e limpar estados de forma síncrona
    currentSearchQueryRef.current = result.label;
    setQuery(result.label);
    setShowResults(false);
    setIsLoading(false);
    setResults([]);
    setHighlightedIndex(-1);
    if (onSelect) {
      onSelect(result);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <Input
        label={label}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Mostrar resultados ao focar apenas se não estiver carregando e houver resultados
          if (!isLoading && results.length > 0 && query.length >= minChars) {
            setShowResults(true);
          }
        }}
        placeholder={placeholder}
        className="w-full"
        {...props}
      />

      {/* Loading state - mostra apenas quando não há resultados sendo exibidos */}
      {isLoading && results.length === 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="p-4 text-center text-gray-500 text-sm">
            {loadingMessage}
          </div>
        </div>
      )}
      
      {/* Results - mostra quando há resultados e showResults está true */}
      {showResults && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto"
          role="listbox"
          aria-label="Resultados da busca"
        >
          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
              role="option"
              aria-selected={index === highlightedIndex}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(result);
                }
              }}
              className={`p-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                index === highlightedIndex
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-gray-900">
                {highlightText(result.label, query)}
              </div>
              {result.subtitle && (
                <div className="text-sm text-gray-600 mt-1">
                  {result.subtitle}
                </div>
              )}
              {result.metadata && (
                <div className="text-xs text-gray-500 mt-1">
                  {result.metadata}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

