import { z } from "zod";
import { DateISO } from "./_common";

export const DashboardQuerySchema = z.object({
  date: DateISO,
});

export const DashboardResponseSchema = z.object({
  ok: z.literal(true),
  date: DateISO,
  kpis: z.object({
    total: z.number().int().min(0),
    standby: z.number().int().min(0),
    finalizado: z.number().int().min(0),
    cancelado: z.number().int().min(0),
  }),
  integracoes: z.object({
    pendentes: z.number().int().min(0),
    erros: z.number().int().min(0),
  }),
  ultimosLogs: z.array(
    z.object({
      id: z.number().int(),
      data: z.string(),
      acao: z.string(),
      detalhes: z.string().nullable(),
      user: z.object({ 
        id: z.string().nullable(), 
        name: z.string() 
      }),
      carregamento_id: z.number().int().nullable(),
    })
  ),
});

