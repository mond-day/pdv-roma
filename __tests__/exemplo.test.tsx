/**
 * Exemplo de Teste - Template para começar
 *
 * Para rodar:
 *   npm test                    # Rodar todos os testes
 *   npm test -- --watch         # Modo watch
 *   npm test -- --coverage      # Com cobertura
 *   npm test auth.test          # Testar arquivo específico
 */

import { describe, expect, test } from '@jest/globals'

describe('Exemplo de Teste', () => {
  test('deve somar dois números corretamente', () => {
    expect(1 + 1).toBe(2)
  })

  test('deve validar strings', () => {
    const texto = 'PDV Roma'
    expect(texto).toContain('Roma')
    expect(texto.length).toBeGreaterThan(0)
  })
})

/**
 * Próximos passos:
 *
 * 1. Criar testes para autenticação:
 *    __tests__/lib/auth/password.test.ts
 *    __tests__/lib/auth/session.test.ts
 *
 * 2. Criar testes para queries do banco:
 *    __tests__/lib/db/queries/carregamentos.test.ts
 *    __tests__/lib/db/queries/produtos.test.ts
 *    __tests__/lib/db/queries/vendas.test.ts
 *
 * 3. Criar testes para validadores:
 *    __tests__/lib/validators/carregamentos.test.ts
 *
 * 4. Criar testes para componentes:
 *    __tests__/components/ui/Button.test.tsx
 *    __tests__/components/ui/Card.test.tsx
 *
 * 5. Criar testes para API endpoints:
 *    __tests__/api/auth/login.test.ts
 *    __tests__/api/carregamentos/route.test.ts
 */
