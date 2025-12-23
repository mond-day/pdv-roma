import { z } from "zod";
import { PaginationQuery } from "./_common";

export const NotificacoesListQuerySchema = PaginationQuery.extend({
  status: z.enum(["abertas", "lidas"]).default("abertas"),
  carregamento_id: z.coerce.number().int().optional(),
});

export const NotificacaoItemSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  titulo: z.string(),
  mensagem: z.string(),
  tipo: z.enum(["integracao", "sistema", "aviso"]).default("integracao"),
  carregamento_id: z.number().int().nullable().optional(),
  lida: z.boolean(),
});

export const NotificacoesListResponseSchema = z.object({
  ok: z.literal(true),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  items: z.array(NotificacaoItemSchema),
});

export const MarcarNotificacaoLidaResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string(),
  lida: z.literal(true),
});

