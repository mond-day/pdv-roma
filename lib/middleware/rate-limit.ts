/**
 * Rate Limiting Middleware
 * Protege endpoints críticos contra brute force
 *
 * Configuração (Q8-A): 5 tentativas / 15 minutos
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (para produção, considerar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  max: number; // Máximo de tentativas
  message?: string;
  keyGenerator?: (req: Request) => string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
};

/**
 * Verifica se requisição excedeu rate limit
 * Retorna null se OK, ou Response com erro 429 se excedeu
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const resetTime = now + finalConfig.windowMs;

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Nova janela ou janela expirada
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: finalConfig.max - 1,
      resetTime,
    };
  }

  // Incrementar contador
  entry.count++;
  rateLimitStore.set(identifier, entry);

  const remaining = Math.max(0, finalConfig.max - entry.count);
  const allowed = entry.count <= finalConfig.max;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Criar response de rate limit excedido (429 Too Many Requests)
 */
export function rateLimitExceededResponse(
  resetTime: number,
  message?: string
): Response {
  const resetDate = new Date(resetTime);
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000); // segundos

  return new Response(
    JSON.stringify({
      ok: false,
      error: message || DEFAULT_CONFIG.message,
      retryAfter,
      resetAt: resetDate.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': DEFAULT_CONFIG.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  );
}

/**
 * Utilitário: Gerar identificador único por IP
 */
export function getClientIdentifier(request: Request): string {
  // Tentar obter IP real (considerando proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  const ip =
    forwarded?.split(',')[0].trim() ||
    realIp ||
    'unknown';

  return ip;
}

/**
 * Exemplo de uso no endpoint de login
 */
export function rateLimitLogin(request: Request): Response | null {
  const identifier = getClientIdentifier(request);
  const result = checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
  });

  if (!result.allowed) {
    console.warn(
      `🚨 Rate limit excedido para ${identifier} - ` +
      `Tentativas: ${5 - result.remaining} | Reset: ${new Date(result.resetTime).toISOString()}`
    );
    return rateLimitExceededResponse(
      result.resetTime,
      'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.'
    );
  }

  // Adicionar headers informativos
  return null; // Permitido
}

/**
 * Limpar rate limit de um identificador (ex: após login bem-sucedido)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
