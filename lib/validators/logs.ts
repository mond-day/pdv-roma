import { z } from "zod";
import { PaginationQuery, DateISO } from "./_common";

export const LogsQuerySchema = PaginationQuery.extend({
  de: DateISO.optional(),
  ate: DateISO.optional(),
  acao: z.string().optional(),
  user_id: z.string().optional(),
  carregamento_id: z.coerce.number().int().optional(),
});

export const LogItemSchema = z.object({
  id: z.number().int(),
  data: z.string(),
  acao: z.string(),
  detalhes: z.string().nullable().optional(),
  request_id: z.string().nullable().optional(),
  carregamento_id: z.number().int().nullable().optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
  }),
});

export const LogsResponseSchema = z.object({
  ok: z.literal(true),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  items: z.array(LogItemSchema),
});

