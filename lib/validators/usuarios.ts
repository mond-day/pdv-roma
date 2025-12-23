import { z } from "zod";
import { RoleEnum } from "./_common";

export const UsuarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleEnum,
  is_active: z.boolean(),
  created_at: z.string().optional(),
});

export const ListUsuariosResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(UsuarioSchema),
});

export const CreateUsuarioBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: RoleEnum,
  password: z.string().min(8),
});

export const UpdateUsuarioBodySchema = z.object({
  name: z.string().min(2).optional(),
  role: RoleEnum.optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const UsuarioResponseSchema = z.object({
  ok: z.literal(true),
  item: UsuarioSchema,
});

export const DeleteUsuarioResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string(),
});

