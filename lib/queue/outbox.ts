// Outbox pattern implementation
// The integracoes_n8n table serves as the outbox
// Worker processes pending items from this table

export { getIntegracoesPendentes, updateIntegracaoStatus } from "@/lib/db/queries/integracoes";

