import { z } from "zod";
import { IntegracaoStatusEnum } from "./_common";

export const ReenviarIntegracaoResponseSchema = z.object({
  ok: z.literal(true),
  carregamento_id: z.number().int(),
  integracao_status: IntegracaoStatusEnum,
  message: z.string().optional(),
});

// resposta do n8n (normalizada)
export const N8NResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string().optional(),
});

