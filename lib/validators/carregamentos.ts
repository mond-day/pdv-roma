import { z } from "zod";
import {
  CarregamentoStatusEnum,
  IntegracaoStatusEnum,
  DateISO,
  PaginationQuery,
} from "./_common";

export const CarregamentosListQuerySchema = PaginationQuery.extend({
  date: DateISO.optional(), // opcional - se não fornecido, busca todos
  dateFim: DateISO.optional(), // opcional, para range de datas
  status: CarregamentoStatusEnum.optional(),
  cliente: z.string().optional(),
  transportadora: z.string().optional(),
  motorista: z.string().optional(),
  placa: z.string().optional(),
  contrato: z.string().optional(),
});

export const CarregamentoResumoSchema = z.object({
  id: z.number().int(),
  data_carregamento: z.string(),
  placa: z.string(),
  cliente_nome: z.string().default(""), // Aceita string vazia
  contrato_codigo: z.union([z.string(), z.number()]).nullable().optional().default(""),
  produto_nome: z.string().nullable().optional().default(""),
  liquido_kg: z.number().int().nullable().optional(),
  status: CarregamentoStatusEnum,
  integracao_status: IntegracaoStatusEnum.nullable().optional(),
  transportadora_nome: z.string().nullable().optional(),
  motorista_nome: z.string().nullable().optional(),
});

export const CarregamentosListResponseSchema = z.object({
  ok: z.literal(true),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  items: z.array(CarregamentoResumoSchema),
});

export const CarregamentoDetalheSchema = z.object({
  id: z.number().int(),
  status: CarregamentoStatusEnum,
  placa: z.string(),
  cliente_nome: z.string(),
  contrato_codigo: z.union([z.string(), z.number()]).nullable().optional(),
  id_gc: z.union([z.number(), z.string()]).nullable().optional(),
  venda_id: z.union([z.string(), z.number()]).nullable().optional(),
  data_carregamento: z.string().nullable().optional(),

  transportadora_id: z.number().int().nullable().optional(),
  motorista_id: z.number().int().nullable().optional(),

  produto_venda_id: z.number().int().nullable().optional(),
  produto_nome: z.string().nullable().optional(),

  qtd_desejada: z.union([z.string(), z.number()]).nullable().optional(),
  tara_total: z.number().nullable().optional(),
  peso_final_total: z.number().nullable().optional(),

  eixos: z.number().int().nullable().optional(),
  tara_eixos_kg: z.any().nullable().optional(),
  final_eixos_kg: z.any().nullable().optional(),

  observacoes: z.string().nullable().optional(),
  finalizado_em: z.string().nullable().optional(),
  cancelado_em: z.string().nullable().optional(),
  cancelamento_motivo: z.string().nullable().optional(),

  integracao: z
    .object({
      status: IntegracaoStatusEnum,
      ultima_mensagem: z.string().nullable().optional(),
      tentativas: z.number().int().min(0),
      ultimo_envio_em: z.string().nullable().optional(),
      idempotency_key: z.string(),
    })
    .nullable()
    .optional(),
});

export const CarregamentoDetailResponseSchema = z.object({
  ok: z.literal(true),
  item: CarregamentoDetalheSchema,
});

// Confirmar / Finalizar
export const FinalizarBodySchema = z.object({
  idempotency_key: z.string().min(8),
  timestamp: z.string(), // ISO

  // pesos finais
  bruto_kg: z.number().int().min(0),
  liquido_kg: z.number().int().min(0),
  final_eixos_kg: z.array(z.number().int().min(0)).optional().default([]),

  // payload completo (opcional se a UI já tiver pronto)
  n8n_payload: z.any().optional(),
});

export const FinalizarResponseSchema = z.object({
  ok: z.literal(true),
  carregamento_id: z.number().int(),
  status: z.enum(["concluido", "finalizado"]), // Aceita ambos para compatibilidade
  integracao_status: IntegracaoStatusEnum,
  warning: z.string().optional(),
});

// Cancelar
export const CancelarBodySchema = z.object({
  motivo: z.string().trim().min(3),
  request_id: z.string().min(8),
});

export const CancelarResponseSchema = z.object({
  ok: z.literal(true),
  carregamento_id: z.number().int(),
  status: z.literal("cancelado"),
});

// Criar carregamento
export const CreateCarregamentoBodySchema = z.object({
  venda_id: z.string().min(1), // Obrigatório
  placa: z.string().min(1),
  detalhes_produto: z.string().optional(),
  qtd_desejada: z.string().optional(), // TEXT no banco
  tara_total: z.number().optional(), // em TON
  eixos: z.number().int().optional(),
  tara_eixos: z.array(z.number().int()).optional(), // Array JSONB
  observacoes: z.string().optional(),
  transportadora_id: z.union([z.string(), z.number()]).optional(),
  motorista_id: z.number().int().optional(),
});

export const CreateCarregamentoResponseSchema = z.object({
  ok: z.literal(true),
  item: z.object({
    id: z.number().int(),
    status: CarregamentoStatusEnum,
    placa: z.string(),
  }),
});

