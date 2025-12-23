import { z } from "zod";
import { NonEmpty } from "./_common";

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: NonEmpty,
});

export const LoginResponseSchema = z.object({
  ok: z.literal(true),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "faturador"]),
  }),
});

export const MeResponseSchema = z.object({
  ok: z.literal(true),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "faturador"]),
  }),
});

