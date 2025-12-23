/**
 * Utilitários para normalização e formatação de placas
 * Baseado no padrão usado no Appsmith
 */

/**
 * Normaliza placa (remove hífen, uppercase)
 * Ex: "ABC-1234" → "ABC1234"
 */
export function normalizarPlaca(placa: string): string {
  if (!placa) return '';
  return placa.replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}

/**
 * Formata placa para exibição
 * Ex: "ABC1234" → "ABC-1234"
 */
export function formatarPlaca(placa: string): string {
  const normalizada = normalizarPlaca(placa);
  if (normalizada.length >= 7) {
    return `${normalizada.slice(0, 3)}-${normalizada.slice(3)}`;
  }
  return normalizada;
}

/**
 * Valida formato de placa brasileira
 */
export function validarPlaca(placa: string): boolean {
  const normalizada = normalizarPlaca(placa);
  // Formato antigo: ABC1234 (7 caracteres)
  // Formato Mercosul: ABC1D23 (7 caracteres)
  const regexAntigo = /^[A-Z]{3}[0-9]{4}$/;
  const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return regexAntigo.test(normalizada) || regexMercosul.test(normalizada);
}

