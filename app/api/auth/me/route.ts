import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { MeResponseSchema } from "@/lib/validators/auth";
import { successResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const user = await getSession();

  if (!user) {
    return unauthorizedResponse();
  }

  const response = MeResponseSchema.parse({
    ok: true,
    user,
  });

  return successResponse(response);
}

