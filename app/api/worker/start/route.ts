import { NextRequest } from "next/server";
import { startWorker } from "@/lib/queue/worker";
import { successResponse } from "@/lib/utils/response";

// Endpoint para iniciar o worker (pode ser chamado no startup do servidor)
export async function POST(request: NextRequest) {
  startWorker();
  return successResponse({ ok: true, message: "Worker iniciado" });
}

