/**
 * Utilitários para formatação de status
 */

export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "stand-by": "Em Espera",
    "standby": "Em Espera", // Compatibilidade
    "concluido": "Finalizado",
    "finalizado": "Finalizado", // Compatibilidade
    "cancelado": "Cancelado",
    "pendente": "Pendente",
    "enviado": "Enviado",
    "erro": "Erro",
  };
  return statusMap[status] || status;
}

export function getStatusBadgeVariant(status: string): "success" | "warning" | "danger" | "info" | "default" {
  const variants: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
    "concluido": "success",
    "finalizado": "success", // Compatibilidade
    "stand-by": "warning",
    "standby": "warning", // Compatibilidade
    "cancelado": "danger",
    "pendente": "info",
    "erro": "danger",
    "enviado": "success",
  };
  return variants[status] || "default";
}

