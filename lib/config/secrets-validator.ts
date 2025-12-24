/**
 * Validação de Secrets Obrigatórios no Startup
 * Garante que variáveis críticas estejam configuradas antes de iniciar a aplicação
 *
 * Configuração (Q2): Validar no startup
 */

export interface SecretConfig {
  key: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

const REQUIRED_SECRETS: SecretConfig[] = [
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'Connection string do PostgreSQL',
  },
  {
    key: 'JWT_SECRET',
    required: true,
    description: 'Secret para geração de tokens JWT',
  },
  {
    key: 'ENCRYPTION_KEY',
    required: true,
    description: 'Chave para criptografia de dados sensíveis',
  },
  {
    key: 'N8N_WEBHOOK_URL',
    required: false,
    description: 'URL do webhook N8N (opcional)',
  },
  {
    key: 'N8N_TOKEN',
    required: false,
    description: 'Token de autenticação N8N (opcional)',
  },
  {
    key: 'SMTP_HOST',
    required: false,
    description: 'Host SMTP para envio de emails',
  },
  {
    key: 'GOOGLE_CHAT_WEBHOOK',
    required: false,
    description: 'Webhook do Google Chat para notificações',
  },
];

export class SecretsValidationError extends Error {
  constructor(public missingSecrets: string[]) {
    super(`Secrets obrigatórios ausentes: ${missingSecrets.join(', ')}`);
    this.name = 'SecretsValidationError';
  }
}

/**
 * Valida se todos os secrets obrigatórios estão configurados
 * Lança erro se algum secret crítico estiver ausente
 */
export function validateSecrets(): { ok: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const secret of REQUIRED_SECRETS) {
    const value = process.env[secret.key];

    if (!value || value.trim() === '') {
      if (secret.required) {
        missing.push(secret.key);
        console.error(
          `❌ SECRET OBRIGATÓRIO AUSENTE: ${secret.key}\n` +
          `   Descrição: ${secret.description}`
        );
      } else {
        warnings.push(secret.key);
        console.warn(
          `⚠️  Secret opcional ausente: ${secret.key}\n` +
          `   Descrição: ${secret.description}`
        );
      }
    } else {
      console.log(`✅ ${secret.key}: Configurado`);
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ FALHA NA VALIDAÇÃO DE SECRETS\n');
    console.error('Secrets obrigatórios ausentes:');
    missing.forEach(key => {
      const secret = REQUIRED_SECRETS.find(s => s.key === key);
      console.error(`  - ${key}: ${secret?.description}`);
    });
    console.error('\nConfigure as variáveis de ambiente antes de iniciar a aplicação.\n');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Secrets opcionais não configurados:');
    warnings.forEach(key => {
      const secret = REQUIRED_SECRETS.find(s => s.key === key);
      console.warn(`  - ${key}: ${secret?.description}`);
    });
    console.warn('Algumas funcionalidades podem não funcionar corretamente.\n');
  }

  if (missing.length === 0) {
    console.log('\n✅ Todos os secrets obrigatórios estão configurados!\n');
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Valida secrets e lança erro se houver problemas
 * Usar no startup da aplicação
 */
export function ensureSecretsOrExit(): void {
  const result = validateSecrets();

  if (!result.ok) {
    throw new SecretsValidationError(result.missing);
  }
}

/**
 * Retorna informações sobre um secret (sem expor o valor)
 */
export function getSecretInfo(key: string): { exists: boolean; length?: number } {
  const value = process.env[key];

  if (!value) {
    return { exists: false };
  }

  return {
    exists: true,
    length: value.length,
  };
}
