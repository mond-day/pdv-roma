import React, { memo, useMemo } from "react";
import { Button } from "./Button";
import { DateRangeInput } from "./DateRangeInput";
import { DateInput } from "./DateInput";
import { AutocompleteInput } from "./AutocompleteInput";

interface Filter {
  key: string;
  label: string;
  value: string;
  valueFim?: string; // Para date range
  type: "text" | "select" | "date" | "daterange" | "autocomplete";
  options?: Array<{ value: string; label: string }>;
  onSearch?: (query: string) => Promise<string[]>; // Para autocomplete
}

interface FilterBarProps {
  filters: Filter[];
  onFilterChange: (key: string, value: string) => void;
  onFilterChangeRange?: (key: string, valueInicio: string, valueFim: string) => void;
  onReset: () => void;
  onApply: () => void;
  isLoading?: boolean;
  showReset?: boolean;
  showApply?: boolean;
  className?: string;
}

function FilterBarComponent({
  filters,
  onFilterChange,
  onFilterChangeRange,
  onReset,
  onApply,
  isLoading = false,
  showReset = true,
  showApply = true,
  className = "",
}: FilterBarProps) {
  const activeFiltersCount = useMemo(() => filters.filter((f) => f.value).length, [filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""} ativo{activeFiltersCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="relative">
            {filter.type === "text" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  {filter.label}
                </label>
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder={`Buscar por ${filter.label.toLowerCase()}...`}
                />
              </div>
            )}

            {filter.type === "autocomplete" && (
              <AutocompleteInput
                key={filter.key}
                label={filter.label}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                onSearch={filter.onSearch}
                placeholder={`Buscar por ${filter.label.toLowerCase()}...`}
              />
            )}

            {filter.type === "select" && (
              <div className="relative" style={{ zIndex: 1 }}>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Todos</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filter.type === "date" && (
              <DateInput
                label={filter.label}
                value={filter.value}
                onChange={(value) => onFilterChange(filter.key, value)}
              />
            )}

            {filter.type === "daterange" && onFilterChangeRange && (
              <DateRangeInput
                label={filter.label}
                valueInicio={filter.value}
                valueFim={filter.valueFim || ""}
                onChangeInicio={(value) => onFilterChangeRange(filter.key, value, filter.valueFim || "")}
                onChangeFim={(value) => onFilterChangeRange(filter.key, filter.value, value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
        {showReset && (
          <Button variant="secondary" onClick={onReset} disabled={isLoading}>
            Limpar Filtros
          </Button>
        )}
        {showApply && (
          <Button onClick={onApply} isLoading={isLoading}>
            🔍 Pesquisar
          </Button>
        )}
      </div>
    </div>
  );
}

// Comparação customizada para evitar re-renders desnecessários
export const FilterBar = memo(FilterBarComponent, (prevProps, nextProps) => {
  // Comparar arrays de filtros
  if (prevProps.filters.length !== nextProps.filters.length) return false;
  
  for (let i = 0; i < prevProps.filters.length; i++) {
    const prev = prevProps.filters[i];
    const next = nextProps.filters[i];
    
    if (prev.key !== next.key || prev.value !== next.value || prev.valueFim !== next.valueFim) {
      return false;
    }
  }
  
  // Comparar outras props
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.showReset === nextProps.showReset &&
    prevProps.showApply === nextProps.showApply &&
    prevProps.className === nextProps.className &&
    prevProps.onFilterChange === nextProps.onFilterChange &&
    prevProps.onFilterChangeRange === nextProps.onFilterChangeRange &&
    prevProps.onReset === nextProps.onReset &&
    prevProps.onApply === nextProps.onApply
  );
});

