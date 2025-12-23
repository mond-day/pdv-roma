/**
 * Tipos TypeScript baseados no schema do Appsmith
 * Alinhados com as tabelas do banco de dados
 */

// ============================================
// 1. USUARIOS
// ============================================
export interface Usuario {
  id: string; // UUID
  nome: string;
  email: string;
  senha_hash?: string; // Não retornar em queries normais
  permissao?: 'operador' | 'supervisor';
  ativo: boolean;
  pode_editar?: boolean;
  pode_duplicar?: boolean;
  pode_cancelar?: boolean;
  role?: 'admin' | 'operador' | 'supervisor';
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 2. USER_AUTH
// ============================================
export interface UserAuth {
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'operador' | 'supervisor';
  last_login?: string;
  created_at?: string;
}

// ============================================
// 3. VENDAS
// ============================================
export interface Venda {
  id_gc: string; // ID no Gestão Click
  codigo: string; // Código do contrato/venda
  nome_cliente: string;
  situacao?: string;
  transportadora_id?: string; // id_gc da transportadora
  data?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 4. PRODUTOS_VENDA
// ============================================
export interface ProdutoVenda {
  id: number;
  venda_id: string; // Referencia vendas.id_gc
  produto_id?: string; // ID do produto no GC
  nome_produto: string;
  quantidade: number; // Saldo/quantidade disponível
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 5. CARREGAMENTOS
// ============================================
export type StatusCarregamento = 'pendente' | 'standby' | 'concluido' | 'finalizado' | 'cancelado';

export interface Carregamento {
  id: number;
  venda_id?: string; // Referencia vendas.id_gc (texto)
  placa: string;
  motorista_id?: number;
  transportadora_id?: number | string; // Pode ser id_gc (string) ou id (number)
  produto_venda_id?: number; // Referencia produtos_venda.id
  eixos?: number;
  tara_eixos?: number[] | string; // JSONB array ou string JSON
  tara_total?: number;
  peso_final_eixos?: number[] | string; // JSONB array ou string JSON
  peso_final_total?: number; // Mesmo que bruto_kg
  data_carregamento: string;
  finalizado_em?: string;
  status: StatusCarregamento;
  observacoes?: string;
  detalhes_produto?: string;
  qtd_desejada?: string | number; // Pode ser string ou number
  // Campos adicionais do schema atual
  cliente_nome?: string;
  contrato_codigo?: string;
  id_gc?: string;
  produto_nome?: string;
  qtd_desejada_ton?: number;
  tara_kg?: number;
  bruto_kg?: number;
  liquido_kg?: number;
  final_eixos_kg?: number[] | string;
  cancelado_em?: string;
  cancelamento_motivo?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 6. PRODUTOS_CARREGAMENTO
// ============================================
export interface ProdutoCarregamento {
  id: number;
  carregamento_id: number; // FK → carregamentos.id
  produto_id?: string;
  nome_produto: string;
  quantidade: number;
  unidade?: string; // Ex: 'TON'
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 7. MOTORISTAS
// ============================================
export interface Motorista {
  id: number;
  nome: string;
  transportadora_id?: string; // id_gc da transportadora
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 8. TRANSPORTADORAS
// ============================================
export interface Transportadora {
  id_gc: string; // ID no Gestão Click
  nome: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 9. PLACAS
// ============================================
export interface Placa {
  id: number;
  placa: string; // Normalizada (sem hífen, uppercase)
  created_at?: string;
}

// ============================================
// 10. PLACAS_MOTORISTAS (Relação N-N)
// ============================================
export interface PlacaMotorista {
  placa_id: number;
  motorista_id: number;
}

// ============================================
// 11. PLACAS_TRANSPORTADORAS (Relação N-N)
// ============================================
export interface PlacaTransportadora {
  placa_id: number;
  transportadora_id: string; // id_gc
}

// ============================================
// 12. PARAMETROS_PESAGEM
// ============================================
export interface ParametrosPesagem {
  id?: number;
  tolerancia_peso: number;
  peso_maximo_eixo: number; // Padrão: 6000
  permitir_excesso: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 13. WEBHOOKS_CONFIG
// ============================================
export interface WebhooksConfig {
  id?: number;
  confirmacao?: string;
  cancelamento?: string;
  duplicacao?: string;
  ticket?: string;
  busca_codigo?: string;
  busca_placa?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 14. LOGS_ACAO
// ============================================
export interface LogAcao {
  id: number;
  usuario_id?: string; // UUID (pode ser NULL)
  carregamento_id?: number; // FK → carregamentos.id
  acao: string;
  detalhes?: string;
  data?: string;
  request_id?: string;
  created_at?: string;
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Normaliza placa (remove hífen, uppercase)
 * Ex: "ABC-1234" → "ABC1234"
 */
export function normalizarPlaca(placa: string): string {
  return placa.replace(/-/g, '').toUpperCase();
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
 * Valida schema JSONB de eixos
 */
export function validarEixosJSONB(eixos: unknown): number[] {
  if (Array.isArray(eixos)) {
    return eixos.map(e => typeof e === 'number' ? e : parseFloat(String(e)) || 0);
  }
  if (typeof eixos === 'string') {
    try {
      const parsed = JSON.parse(eixos);
      return Array.isArray(parsed) ? parsed.map(e => parseFloat(String(e)) || 0) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Serializa array de eixos para JSONB
 */
export function serializarEixosJSONB(eixos: number[]): string {
  return JSON.stringify(eixos);
}

