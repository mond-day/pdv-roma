import { getConfigValue } from "@/lib/db/queries/configuracoes";
import { N8NResponseSchema } from "@/lib/validators/integracoes";

const TIMEOUT_MS = 120000; // 120 segundos

export async function sendToN8N(
  payload: unknown,
  idempotencyKey: string
): Promise<{ ok: boolean; message?: string }> {
  const webhookUrl = await getConfigValue("N8N_WEBHOOK_URL", true);
  const token = await getConfigValue("N8N_TOKEN", true);

  if (!webhookUrl) {
    return {
      ok: false,
      message: "N8N_WEBHOOK_URL não configurado",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Ensure payload is an object before spreading
    const payloadObj = typeof payload === "object" && payload !== null ? payload : {};
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...payloadObj,
        idempotency_key: idempotencyKey,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      return {
        ok: false,
        message: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    const parsed = N8NResponseSchema.safeParse(data);

    if (parsed.success) {
      return parsed.data;
    }

    // Se não seguir o contrato, assumir sucesso se status 2xx
    return {
      ok: true,
      message: "Resposta não padronizada, mas status HTTP OK",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        message: "Timeout após 120 segundos",
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

