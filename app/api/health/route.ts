import { NextRequest } from "next/server";
import { successResponse } from "@/lib/utils/response";
import { pool } from "@/lib/db/pool";

export async function GET(request: NextRequest) {
  try {
    // Testar conexão com banco
    await pool.query("SELECT 1");
    return successResponse({ ok: true, status: "healthy" });
  } catch (error) {
    return successResponse(
      { ok: false, status: "unhealthy", error: "Database connection failed" },
      503
    );
  }
}

