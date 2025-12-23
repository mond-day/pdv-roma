import { Pool } from "pg";

// Verificar se DATABASE_URL existe, mas não lançar erro imediatamente
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL não encontrada. Verifique o arquivo .env");
  console.error("⚠️ O servidor pode não funcionar corretamente sem conexão ao banco");
}

// Criar pool com tratamento de erro robusto
let pool: Pool;

try {
  if (!process.env.DATABASE_URL) {
    // Criar um pool "dummy" que falhará graciosamente nas queries
    // Isso permite que o servidor inicie mesmo sem DATABASE_URL
    pool = new Pool({
      connectionString: "postgresql://dummy:dummy@localhost:5432/dummy",
      max: 1,
    });
    console.warn("⚠️ Pool criado com DATABASE_URL dummy. Configure o .env corretamente.");
  } else {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Aumentado para 5s
      // Configurações adicionais para evitar crashes
      allowExitOnIdle: false,
    });
  }

  // Tratamento de erros do pool - CRÍTICO para evitar crashes
  pool.on("error", (err) => {
    console.error("❌ Erro no pool de conexões PostgreSQL:", err.message);
    console.error("Stack:", err.stack);
    // NUNCA re-lançar o erro aqui, isso quebraria o servidor
  });

  // Testar conexão ao inicializar (com timeout curto)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dummy")) {
    pool.query("SELECT 1").catch((err) => {
      console.error("⚠️ Aviso: Não foi possível testar conexão inicial:", err.message);
      // Não lançar erro, apenas logar - o servidor pode continuar
    });
  }
} catch (error) {
  console.error("❌ Erro FATAL ao criar pool de conexões:", error);
  // Em caso de erro crítico, criar um pool mínimo para não quebrar o servidor
  pool = new Pool({
    connectionString: "postgresql://dummy:dummy@localhost:5432/dummy",
    max: 1,
  });
  console.error("⚠️ Pool dummy criado. Configure DATABASE_URL no .env e reinicie.");
}

export { pool };

