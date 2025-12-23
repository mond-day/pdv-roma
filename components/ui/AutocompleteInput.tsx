"use client";

import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onSearch?: (query: string) => Promise<string[]>;
  debounceMs?: number;
  minChars?: number;
  error?: string;
}

interface DropdownState {
  suggestions: string[];
  isLoading: boolean;
  shouldShow: boolean;
}

function AutocompleteInputComponent({
  label,
  onSearch,
  debounceMs = 300,
  minChars = 2,
  error,
  value,
  onChange,
  className = "",
  ...props
}: AutocompleteInputProps) {
  // Estado único combinado para evitar múltiplos re-renders
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    suggestions: [],
    isLoading: false,
    shouldShow: false,
  });
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentQueryRef = useRef<string>("");
  const isMountedRef = useRef(true);
  const previousSuggestionsRef = useRef<string[]>([]);
  const lastValueRef = useRef<string>(String(value || ""));

  // Limpar timeouts ao desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownState((prev) => ({ ...prev, shouldShow: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Função de busca memoizada
  const performSearch = useCallback(async (query: string) => {
    if (!onSearch || !isMountedRef.current) return [];
    
    try {
      console.log("AutocompleteInput - Buscando:", query);
      const results = await onSearch(query);
      console.log("AutocompleteInput - Resultados recebidos:", results);
      // Verificar se ainda está montado e a query ainda é válida
      if (isMountedRef.current && currentQueryRef.current === query) {
        return results;
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    }
    return [];
  }, [onSearch]);

  useEffect(() => {
    const currentValue = String(value || "");
    
    // Se o valor não mudou, não fazer nada
    if (currentValue === lastValueRef.current) {
      return;
    }
    
    lastValueRef.current = currentValue;
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    const query = currentValue.trim();
    const previousQuery = currentQueryRef.current;
    currentQueryRef.current = query;

    // Se query vazia ou muito curta, limpar tudo de uma vez
    if (!query || query.length < minChars || !onSearch) {
      // Só atualizar se realmente mudou
      setDropdownState((prev) => {
        if (prev.suggestions.length === 0 && !prev.isLoading && !prev.shouldShow) {
          return prev; // Já está no estado correto, não atualizar
        }
        return {
          suggestions: [],
          isLoading: false,
          shouldShow: false,
        };
      });
      previousSuggestionsRef.current = [];
      return;
    }

    // Se a query não mudou, não fazer nada
    if (query === previousQuery) {
      return;
    }

    // Manter sugestões anteriores visíveis durante o loading
    const hasPreviousSuggestions = previousSuggestionsRef.current.length > 0;
    
    // Iniciar loading SEM esconder sugestões anteriores - apenas se necessário
    setDropdownState((prev) => {
      // Se já está carregando e tem sugestões, não mudar nada
      if (prev.isLoading && hasPreviousSuggestions) {
        return prev;
      }
      // Se não está carregando, iniciar loading mantendo sugestões visíveis
      if (!prev.isLoading) {
        return {
          suggestions: previousSuggestionsRef.current, // Manter sugestões anteriores
          isLoading: true,
          shouldShow: true, // Sempre mostrar se há sugestões anteriores ou está carregando
        };
      }
      return prev;
    });

    // Debounce da busca
    timeoutRef.current = setTimeout(async () => {
      // Verificar se a query ainda é a mesma
      if (currentQueryRef.current !== query || !isMountedRef.current) {
        return;
      }

      const results = await performSearch(query);
      
      // Verificar novamente após a busca
      if (currentQueryRef.current !== query || !isMountedRef.current) {
        return;
      }

      // Atualizar tudo de uma vez - estado atômico
      previousSuggestionsRef.current = results;
      console.log("AutocompleteInput - Atualizando estado com resultados:", results);
      setDropdownState((prev) => {
        // Só atualizar se realmente mudou
        if (
          prev.suggestions.length === results.length &&
          prev.suggestions.every((s, i) => s === results[i]) &&
          !prev.isLoading &&
          prev.shouldShow === (results.length > 0)
        ) {
          return prev;
        }
        const newState = {
          suggestions: results,
          isLoading: false,
          shouldShow: results.length > 0, // Mostrar se há resultados
        };
        console.log("AutocompleteInput - Novo estado:", newState);
        return newState;
      });
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [value, performSearch, debounceMs, minChars, onSearch]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleSelect = useCallback((suggestion: string) => {
    if (onChangeRef.current) {
      const syntheticEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChangeRef.current(syntheticEvent);
    }
    // Fechar dropdown imediatamente
    setDropdownState({
      suggestions: [],
      isLoading: false,
      shouldShow: false,
    });
    previousSuggestionsRef.current = [];
    currentQueryRef.current = suggestion;
    lastValueRef.current = suggestion;
  }, []);

  const handleFocus = useCallback(() => {
    // Mostrar sugestões ao focar se houver resultados ou se está carregando
    if (dropdownState.suggestions.length > 0 || dropdownState.isLoading) {
      setDropdownState((prev) => ({ ...prev, shouldShow: true }));
    }
  }, [dropdownState.suggestions.length, dropdownState.isLoading]);

  // Determinar o que mostrar - memoizado para evitar recálculos
  const { showLoading, showResults, dropdownKey } = useMemo(() => {
    // Mostrar loading apenas quando não há sugestões anteriores e está carregando
    const loading = dropdownState.isLoading && dropdownState.suggestions.length === 0;
    // Mostrar resultados se há sugestões e o dropdown deve ser mostrado
    // OU se está carregando mas já tem sugestões anteriores (mostrar enquanto busca novas)
    const results = dropdownState.shouldShow && dropdownState.suggestions.length > 0;
    const key = `dropdown-${dropdownState.suggestions.length}-${results}-${dropdownState.shouldShow}`;
    console.log("AutocompleteInput - showResults:", results, "suggestions:", dropdownState.suggestions.length, "shouldShow:", dropdownState.shouldShow);
    return { showLoading: loading, showResults: results, dropdownKey: key };
  }, [dropdownState.isLoading, dropdownState.suggestions.length, dropdownState.shouldShow]);

  return (
    <div ref={wrapperRef} className={`w-full relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (onChangeRef.current) {
            onChangeRef.current(e);
          }
        }}
        onFocus={handleFocus}
        className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
          error ? "border-red-500 focus:ring-red-500" : ""
        }`}
        {...props}
      />
      
      {/* Results - mostrar sempre que houver sugestões ou estiver carregando */}
      {(showResults || (showLoading && dropdownState.suggestions.length > 0)) && (
        <div 
          key={dropdownKey}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
        >
          {dropdownState.suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              onClick={() => handleSelect(suggestion)}
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-900"
            >
              {suggestion}
            </div>
          ))}
          {/* Mostrar indicador de loading apenas se estiver carregando e não houver sugestões ainda */}
          {showLoading && dropdownState.suggestions.length === 0 && (
            <div className="p-3 text-center text-gray-500 text-sm">Buscando...</div>
          )}
        </div>
      )}
      
      {/* Loading - apenas quando não há resultados sendo exibidos */}
      {showLoading && dropdownState.suggestions.length === 0 && (
        <div 
          key="loading"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="p-3 text-center text-gray-500 text-sm">Buscando...</div>
        </div>
      )}
      
      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

// Comparação customizada para memo
export const AutocompleteInput = memo(AutocompleteInputComponent, (prevProps, nextProps) => {
  // Comparar apenas props relevantes
  return (
    prevProps.value === nextProps.value &&
    prevProps.onSearch === nextProps.onSearch &&
    prevProps.debounceMs === nextProps.debounceMs &&
    prevProps.minChars === nextProps.minChars &&
    prevProps.error === nextProps.error &&
    prevProps.label === nextProps.label &&
    prevProps.className === nextProps.className
  );
});

