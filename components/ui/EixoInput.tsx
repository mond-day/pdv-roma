import React, { useState, useEffect } from "react";
import { Badge } from "./Badge";

interface EixoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  eixoNumber: number;
  peso: string;
  limiteEixo?: number;
  excesso?: number;
  error?: string;
  showTooltip?: boolean;
}

export function EixoInput({
  label,
  eixoNumber,
  peso,
  limiteEixo = 6000,
  excesso,
  error,
  showTooltip = true,
  className = "",
  ...props
}: EixoInputProps) {
  // Estado local para texto livre durante a digitação
  const [localValue, setLocalValue] = useState(peso);
  const [isFocused, setIsFocused] = useState(false);
  
  // Sincronizar com o prop peso quando mudar externamente (mas não durante digitação)
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(peso);
    }
  }, [peso, isFocused]);
  
  // Se o limite está em TON (valor < 10), mostrar em TON, senão em kg
  const isTon = limiteEixo < 10;
  
  // Converter vírgula para ponto para cálculo (usar valor atual do input)
  const currentValue = isFocused ? localValue : peso;
  const pesoNum = parseFloat((currentValue || '').toString().replace(',', '.').replace(/[^\d.]/g, '')) || 0;
  const excessoCalculado = excesso !== undefined ? excesso : (pesoNum > limiteEixo ? pesoNum - limiteEixo : 0);
  
  const getExcessoClass = () => {
    if (excessoCalculado <= 0) return "";
    if (excessoCalculado <= 500) return "eixo-excesso-leve";
    if (excessoCalculado <= 1000) return "eixo-excesso-medio";
    return "eixo-excesso-grave";
  };

  const getBadgeVariant = (): "success" | "warning" | "danger" => {
    if (excessoCalculado <= 0) return "success";
    if (excessoCalculado <= 500) return "warning";
    return "danger";
  };

  const tooltipText = excessoCalculado > 0 
    ? `Excesso de ${isTon ? excessoCalculado.toFixed(3) : excessoCalculado.toFixed(0)} ${isTon ? 'TON' : 'kg'} sobre o limite de ${isTon ? limiteEixo.toFixed(3) : limiteEixo.toFixed(0)} ${isTon ? 'TON' : 'kg'}`
    : `Dentro do limite de ${isTon ? limiteEixo.toFixed(3) : limiteEixo.toFixed(0)} ${isTon ? 'TON' : 'kg'}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={`eixo-${eixoNumber}`} className="block text-sm font-semibold text-gray-900">
          {label}
        </label>
        {showTooltip && (
          <div className="group relative">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 cursor-help text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
              aria-label={`Informações sobre ${label}`}
              aria-describedby={`tooltip-eixo-${eixoNumber}`}
            >
              ℹ️
            </button>
            <div
              id={`tooltip-eixo-${eixoNumber}`}
              role="tooltip"
              className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10"
            >
              {tooltipText}
            </div>
          </div>
        )}
      </div>
      <input
        id={`eixo-${eixoNumber}`}
        type="text"
        inputMode="decimal"
        value={localValue}
        placeholder="Ex: 10,234"
        aria-label={label}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `error-eixo-${eixoNumber}` : excessoCalculado > 0 ? `excesso-eixo-${eixoNumber}` : undefined}
        className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors ${
          error ? "border-red-500 focus:ring-red-500" : getExcessoClass() || "border-gray-300"
        } ${props.disabled ? "bg-gray-50 cursor-not-allowed opacity-75" : ""}`}
        onFocus={() => {
          setIsFocused(true);
          // Quando focar, usar o valor atual (pode estar formatado)
          setLocalValue(peso);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          
          // Formatar o valor ao perder o foco
          let value = e.target.value.trim();
          
          if (value === "") {
            setLocalValue("");
            if (props.onChange) {
              const syntheticEvent = {
                ...e,
                target: { ...e.target, value: "" }
              } as React.ChangeEvent<HTMLInputElement>;
              props.onChange(syntheticEvent);
            }
            return;
          }
          
          // Remover caracteres não permitidos (apenas números, vírgula e ponto)
          value = value.replace(/[^\d,.]/g, '');
          
          // Substituir ponto por vírgula para padronizar
          value = value.replace(/\./g, ',');
          
          // Garantir apenas uma vírgula
          const parts = value.split(',');
          if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
          }
          
          // Limitar casas decimais a 3 dígitos após a vírgula
          if (parts.length === 2 && parts[1].length > 3) {
            value = parts[0] + ',' + parts[1].substring(0, 3);
          }
          
          // Atualizar valor local formatado
          setLocalValue(value);
          
          // Chamar onChange para atualizar o estado pai
          if (props.onChange) {
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value }
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange(syntheticEvent);
          }
        }}
        onChange={(e) => {
          // Durante a digitação, permitir texto livre (sem formatação)
          // Atualizar apenas o estado local, não o estado pai
          const value = e.target.value;
          setLocalValue(value);
        }}
        {...props}
      />
      {excessoCalculado > 0 && (
        <span
          id={`excesso-eixo-${eixoNumber}`}
          role="status"
          aria-live="polite"
        >
          <Badge
            variant={getBadgeVariant()}
            className="text-xs"
          >
            Excesso: {isTon ? excessoCalculado.toFixed(3) : excessoCalculado.toFixed(0)} {isTon ? 'TON' : 'kg'}
          </Badge>
        </span>
      )}
      {error && (
        <p id={`error-eixo-${eixoNumber}`} className="mt-1 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

