import { z } from "zod";
import { DateISO } from "./_common";

export const RelatoriosQuerySchema = z.object({
  de: DateISO,
  ate: DateISO,
  groupBy: z.enum(["cliente", "transportadora", "motorista"]).default("cliente"),
});

export const RelatorioLinhaSchema = z.object({
  groupKey: z.string(),
  total_carregamentos: z.number().int().min(0),
  total_liquido_kg: z.number().int().min(0),
});

export const RelatoriosResponseSchema = z.object({
  ok: z.literal(true),
  params: RelatoriosQuerySchema,
  rows: z.array(RelatorioLinhaSchema),
});

export const RelatoriosExportResponseSchema = z.object({
  ok: z.literal(true),
  filename: z.string().optional(),
});

