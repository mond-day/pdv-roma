import { z } from "zod";
import {
  CarregamentosListQuerySchema,
  CarregamentosListResponseSchema,
} from "./carregamentos";

export const HistoricoQuerySchema = CarregamentosListQuerySchema.extend({
  // opcional: por padrão pode vir sem status e retornar tudo, ou default finalizado/cancelado
});

export const HistoricoResponseSchema = CarregamentosListResponseSchema;

