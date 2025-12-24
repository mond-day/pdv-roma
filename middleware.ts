import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";

const publicRoutes = ["/login", "/api/auth/login", "/api/health"];

/**
 * Adiciona security headers a uma resposta
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HSTS em produção
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CSP básica
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.romamineracao.com.br",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Verificar sessão com tratamento de erro
  try {
    const session = await getSession();

    if (!session) {
      if (pathname.startsWith("/api")) {
        const response = NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
        return addSecurityHeaders(response);
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  } catch (error) {
    console.error("Erro no middleware:", error);
    // Em caso de erro, redirecionar para login
    if (pathname.startsWith("/api")) {
      const response = NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
      return addSecurityHeaders(response);
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

