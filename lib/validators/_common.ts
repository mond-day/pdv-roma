import { z } from "zod";

export const RoleEnum = z.enum(["admin", "faturador"]);

export const CarregamentoStatusEnum = z.enum(["pendente", "stand-by", "concluido", "cancelado", "standby", "finalizado"]); // Inclui ambos para compatibilidade
export const IntegracaoStatusEnum = z.enum(["pendente", "enviado", "erro"]);

export const UUIDish = z.string().min(8);
export const NonEmpty = z.string().trim().min(1);

export const DateISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD

export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

