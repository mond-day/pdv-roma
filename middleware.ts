import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";

const publicRoutes = ["/login", "/api/auth/login", "/api/health"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar sessão com tratamento de erro
  try {
    const session = await getSession();

    if (!session) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro no middleware:", error);
    // Em caso de erro, redirecionar para login
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

