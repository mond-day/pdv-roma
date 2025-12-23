import { z } from "zod";

export const ConfigKeyEnum = z.enum([
  "N8N_WEBHOOK_URL",
  "N8N_TOKEN",
  "NIBO_TOKEN",
  "GC_TOKEN",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "EMAIL_ON_INTEGRACAO_ERRO",
  "EMAIL_ON_INTEGRACAO_SUCESSO",
]);

export const ConfigItemSchema = z.object({
  key: ConfigKeyEnum,
  value: z.string().optional(), // ao buscar, pode mascarar segredos
  masked: z.boolean().default(false),
});

export const GetConfiguracoesResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(ConfigItemSchema),
});

export const PutConfiguracoesBodySchema = z.object({
  items: z.array(
    z.object({
      key: ConfigKeyEnum,
      value: z.string(),
    })
  ),
});

export const PutConfiguracoesResponseSchema = z.object({
  ok: z.literal(true),
  updated: z.number().int().min(0),
});

