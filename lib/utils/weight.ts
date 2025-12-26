/**
 * Utilitários para formatação e conversão de pesos
 * 
 * O banco de dados armazena pesos em GRAMAS (NUMERIC)
 * A UI exibe em TON com 3 casas decimais (formato brasileiro)
 */

/**
 * Converte gramas para TON
 */
export function gramasToTon(gramas: number | null | undefined): number | null {
  if (gramas === null || gramas === undefined) return null;
  return parseFloat((gramas / 1000).toFixed(3));
}

/**
 * Converte TON para gramas
 */
export function tonToGramas(ton: number | null | undefined): number | null {
  if (ton === null || ton === undefined) return null;
  return Math.round(ton * 1000);
}

/**
 * Formata peso em TON com 3 casas decimais no formato brasileiro
 * Exemplos:
 * - 1.234 → "1,234"
 * - 10.234 → "10,234"
 * - 100.234 → "100,234"
 * - 1000.234 → "1.000,234"
 * 
 * @param ton - Peso em TON (número)
 * @returns String formatada ou "-" se for null/undefined
 */
export function formatTon(ton: number | null | undefined): string {
  if (ton === null || ton === undefined) return "-";
  
  // Garantir 3 casas decimais
  const fixed = parseFloat(ton.toFixed(3));
  
  // Separar parte inteira e decimal
  const parts = fixed.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '000';
  
  // Formatar parte inteira com separador de milhares (ponto)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Garantir 3 dígitos na parte decimal
  const formattedDecimal = decimalPart.padEnd(3, '0').substring(0, 3);
  
  // Retornar no formato brasileiro: 1.000,234
  return `${formattedInteger},${formattedDecimal}`;
}

/**
 * Formata peso em TON com unidade
 */
export function formatTonWithUnit(ton: number | null | undefined): string {
  const formatted = formatTon(ton);
  return formatted === "-" ? "-" : `${formatted} TON`;
}

/**
 * Converte gramas para TON e formata
 */
export function formatGramasAsTon(gramas: number | null | undefined): string {
  if (gramas === null || gramas === undefined) return "-";
  const ton = gramasToTon(gramas);
  return formatTon(ton);
}

/**
 * Converte gramas para TON e formata com unidade
 */
export function formatGramasAsTonWithUnit(gramas: number | null | undefined): string {
  if (gramas === null || gramas === undefined) return "-";
  const ton = gramasToTon(gramas);
  return formatTonWithUnit(ton);
}

/**
 * Parse de string formatada em TON para número
 * Aceita formatos: "1,234", "1.000,234", "1234", "1234.5"
 */
export function parseTon(tonString: string | null | undefined): number | null {
  if (!tonString || tonString.trim() === "") return null;
  
  // Remover espaços
  let cleaned = tonString.trim();
  
  // Substituir vírgula por ponto (formato brasileiro)
  cleaned = cleaned.replace(/\./g, ''); // Remove separadores de milhares
  cleaned = cleaned.replace(',', '.'); // Converte vírgula decimal para ponto
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}


