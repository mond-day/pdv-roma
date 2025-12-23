// Initialize worker on server startup
import { startWorker } from "./worker";

// Start worker when this module is imported
if (typeof window === "undefined") {
  // Only run on server
  try {
    startWorker();
  } catch (error) {
    console.error("Erro ao iniciar worker:", error);
    // Não bloquear o servidor se o worker falhar
  }
}

