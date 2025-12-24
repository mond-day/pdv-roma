/**
 * Sistema de Alertas
 * Envia notificações via Email e Google Chat Webhook
 *
 * Configuração (Q7): Email + Google Chat webhook
 */

export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  level: AlertLevel;
  title: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Enviar alerta via Email
 */
async function sendEmailAlert(alert: Alert): Promise<boolean> {
  const SMTP_CONFIGURED = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (!SMTP_CONFIGURED) {
    console.warn('⚠️  SMTP não configurado. Email não enviado.');
    return false;
  }

  // TODO: Implementar envio de email quando SMTP estiver configurado
  // Por enquanto, apenas log
  console.log(`📧 EMAIL ALERT [${alert.level.toUpperCase()}]: ${alert.title}`);
  console.log(`   ${alert.message}`);
  if (alert.details) {
    console.log(`   Detalhes:`, JSON.stringify(alert.details, null, 2));
  }

  return true;
}

/**
 * Enviar alerta via Google Chat Webhook
 */
async function sendGoogleChatAlert(alert: Alert): Promise<boolean> {
  const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK;

  if (!WEBHOOK_URL) {
    console.warn('⚠️  Google Chat webhook não configurado.');
    return false;
  }

  try {
    // Emoji baseado no nível
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    }[alert.level];

    // Cor do card baseado no nível
    const color = {
      info: '#4285F4', // Azul
      warning: '#FBBC04', // Amarelo
      error: '#EA4335', // Vermelho
      critical: '#9C27B0', // Roxo
    }[alert.level];

    const payload = {
      cards: [
        {
          header: {
            title: `${emoji} ${alert.title}`,
            subtitle: `Nível: ${alert.level.toUpperCase()}`,
          },
          sections: [
            {
              widgets: [
                {
                  textParagraph: {
                    text: `<b>Mensagem:</b><br>${alert.message}`,
                  },
                },
                ...(alert.details
                  ? [
                      {
                        textParagraph: {
                          text: `<b>Detalhes:</b><br><code>${JSON.stringify(alert.details, null, 2)}</code>`,
                        },
                      },
                    ]
                  : []),
                {
                  textParagraph: {
                    text: `<b>Timestamp:</b> ${(alert.timestamp || new Date()).toLocaleString('pt-BR')}`,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ Erro ao enviar alerta ao Google Chat: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`✅ Alerta enviado ao Google Chat: ${alert.title}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar alerta ao Google Chat:', error);
    return false;
  }
}

/**
 * Enviar alerta para todos os canais configurados
 */
export async function sendAlert(alert: Alert): Promise<void> {
  const timestamp = alert.timestamp || new Date();
  const fullAlert = { ...alert, timestamp };

  // Log local sempre
  console.log(`\n🔔 ALERTA [${alert.level.toUpperCase()}]: ${alert.title}`);
  console.log(`   ${alert.message}`);
  if (alert.details) {
    console.log(`   Detalhes:`, alert.details);
  }
  console.log(`   Timestamp: ${timestamp.toISOString()}\n`);

  // Enviar para canais configurados (em paralelo)
  const promises = [
    sendEmailAlert(fullAlert),
    sendGoogleChatAlert(fullAlert),
  ];

  await Promise.allSettled(promises);
}

/**
 * Atalhos para níveis específicos
 */
export const alertInfo = (title: string, message: string, details?: Record<string, any>) =>
  sendAlert({ level: 'info', title, message, details });

export const alertWarning = (title: string, message: string, details?: Record<string, any>) =>
  sendAlert({ level: 'warning', title, message, details });

export const alertError = (title: string, message: string, details?: Record<string, any>) =>
  sendAlert({ level: 'error', title, message, details });

export const alertCritical = (title: string, message: string, details?: Record<string, any>) =>
  sendAlert({ level: 'critical', title, message, details });

/**
 * Exemplo de uso:
 *
 * // Backup falhou
 * alertError(
 *   'Backup Falhou',
 *   'Erro ao executar backup do banco de dados',
 *   { error: error.message, timestamp: new Date() }
 * );
 *
 * // Rate limit excedido
 * alertWarning(
 *   'Rate Limit Excedido',
 *   'IP 192.168.1.100 excedeu limite de tentativas de login',
 *   { ip: '192.168.1.100', attempts: 10 }
 * );
 */
