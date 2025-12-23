import { NextRequest } from "next/server";
import { startWorker } from "@/lib/queue/worker";
import { successResponse } from "@/lib/utils/response";

// Endpoint para iniciar o worker (chamado no startup)
export async function GET(request: NextRequest) {
  startWorker();
  return successResponse({ ok: true, message: "Worker iniciado" });
}

