import {
  getIntegracoesPendentes,
  updateIntegracaoStatus,
} from "@/lib/db/queries/integracoes";
import { sendToN8N } from "@/lib/integrations/n8n";
import { createNotificacao } from "@/lib/db/queries/notificacoes";
import { getConfigValue } from "@/lib/db/queries/configuracoes";
import { createLog } from "@/lib/db/queries/logs";

const INTERVAL_MS = 10000; // 10 segundos
let workerInterval: NodeJS.Timeout | null = null;

export async function processIntegracoes() {
  try {
    const integracoes = await getIntegracoesPendentes(20);

    for (const integracao of integracoes) {
      try {
        // Buscar payload do carregamento se necessário
        let payload = integracao.payload;
        if (!payload) {
          // Se não tiver payload salvo, construir do carregamento
          // Por enquanto, usar payload salvo
          continue;
        }

        const result = await sendToN8N(payload, integracao.idempotency_key);

        if (result.ok) {
          await updateIntegracaoStatus(integracao.id, "enviado", result.message || "Sucesso");
          await createLog({
            acao: "integracao_n8n_sucesso",
            detalhes: `Carregamento ${integracao.carregamento_id} enviado com sucesso`,
            carregamento_id: integracao.carregamento_id,
          });

          // Notificação de sucesso (se configurado)
          const emailOnSuccess = await getConfigValue("EMAIL_ON_INTEGRACAO_SUCESSO");
          if (emailOnSuccess === "true") {
            // TODO: enviar email
          }
        } else {
          await updateIntegracaoStatus(
            integracao.id,
            "erro",
            result.message || "Erro desconhecido"
          );
          // Log de erro
          try {
            await createLog({
              acao: "integracao_n8n_erro",
              detalhes: `Erro ao enviar carregamento ${integracao.carregamento_id}: ${result.message}`,
              carregamento_id: integracao.carregamento_id,
            });
          } catch (err) {
            // Ignore log errors
          }

          // Criar notificação de erro
          // TODO: buscar user_id do carregamento ou admin
          const emailOnError = await getConfigValue("EMAIL_ON_INTEGRACAO_ERRO");
          if (emailOnError === "true") {
            // TODO: enviar email
          }
        }
      } catch (error) {
        console.error(`Erro ao processar integração ${integracao.id}:`, error);
        await updateIntegracaoStatus(
          integracao.id,
          "erro",
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      }
    }
  } catch (error) {
    console.error("Erro no worker de integrações:", error);
  }
}

export function startWorker() {
  if (workerInterval) {
    console.log("ℹ️ Worker já está rodando");
    return; // Já está rodando
  }

  try {
    console.log("🔄 Iniciando worker de integrações n8n...");
    
    // Executar com tratamento de erro robusto para não bloquear o servidor
    processIntegracoes().catch((error) => {
      console.error("❌ Erro na primeira execução do worker:", error);
      if (error instanceof Error) {
        console.error("Stack:", error.stack);
      }
      // Não re-lançar erro
    });
    
    // Configurar intervalo com tratamento de erro em cada execução
    workerInterval = setInterval(() => {
      processIntegracoes().catch((error) => {
        console.error("❌ Erro no worker (intervalo):", error);
        if (error instanceof Error) {
          console.error("Stack:", error.stack);
        }
        // Não re-lançar erro - continuar tentando
      });
    }, INTERVAL_MS);
    
    console.log("✅ Worker iniciado com sucesso");
  } catch (error) {
    console.error("❌ Erro FATAL ao iniciar worker:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    // Não re-lançar erro para não quebrar o servidor
  }
}

export function stopWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("Worker de integrações n8n parado");
  }
}

