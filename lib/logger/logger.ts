// Logger simples para o sistema
export function log(level: "info" | "warn" | "error", message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const logEntry: { timestamp: string; level: string; message: string; meta?: unknown } = {
    timestamp,
    level,
    message,
  };
  if (meta) {
    logEntry.meta = meta;
  }

  console.log(JSON.stringify(logEntry));
}

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};

