import { pool } from "../lib/db/pool";
import fs from "fs";
import path from "path";

async function seedPlacas() {
  const client = await pool.connect();
  try {
    console.log("🔄 Executando seed de vínculos de placas...");

    // Ler apenas a parte do seed que adicionamos
    const seedPlacas = `
-- Inserir placas únicas (extraídas dos carregamentos)
INSERT INTO placas (placa)
SELECT DISTINCT placa
FROM carregamentos
WHERE placa IS NOT NULL
ON CONFLICT (placa) DO NOTHING;

-- Vínculos placas → motoristas (baseado nos carregamentos existentes)
INSERT INTO placas_motoristas (placa_id, motorista_id)
SELECT DISTINCT
  p.id as placa_id,
  c.motorista_id
FROM carregamentos c
JOIN placas p ON p.placa = c.placa
WHERE c.motorista_id IS NOT NULL
ON CONFLICT (placa_id, motorista_id) DO NOTHING;

-- Vínculos placas → transportadoras (baseado nos carregamentos existentes)
INSERT INTO placas_transportadoras (placa_id, transportadora_id)
SELECT DISTINCT
  p.id as placa_id,
  c.transportadora_id::text as transportadora_id
FROM carregamentos c
JOIN placas p ON p.placa = c.placa
WHERE c.transportadora_id IS NOT NULL
ON CONFLICT (placa_id, transportadora_id) DO NOTHING;

-- Adicionar alguns vínculos múltiplos para teste
-- Placa ABC-1234 vinculada a 2 motoristas
DO $$
DECLARE
  placa_abc_id INTEGER;
BEGIN
  SELECT id INTO placa_abc_id FROM placas WHERE placa = 'ABC-1234' LIMIT 1;

  IF placa_abc_id IS NOT NULL THEN
    -- Adicionar vínculo com o segundo motorista (se existir)
    INSERT INTO placas_motoristas (placa_id, motorista_id)
    SELECT placa_abc_id, id
    FROM motoristas
    WHERE id != (SELECT motorista_id FROM placas_motoristas WHERE placa_id = placa_abc_id LIMIT 1)
    LIMIT 1
    ON CONFLICT (placa_id, motorista_id) DO NOTHING;
  END IF;
END $$;

ANALYZE placas;
ANALYZE placas_motoristas;
ANALYZE placas_transportadoras;
    `;

    await client.query(seedPlacas);

    // Verificar resultados
    const placasResult = await client.query("SELECT COUNT(*) FROM placas");
    const motoristasResult = await client.query("SELECT COUNT(*) FROM placas_motoristas");
    const transportadorasResult = await client.query("SELECT COUNT(*) FROM placas_transportadoras");

    console.log("✅ Seed executado com sucesso!");
    console.log(`   - Placas: ${placasResult.rows[0].count}`);
    console.log(`   - Vínculos com motoristas: ${motoristasResult.rows[0].count}`);
    console.log(`   - Vínculos com transportadoras: ${transportadorasResult.rows[0].count}`);

    // Mostrar exemplo de placa com múltiplos vínculos
    const multiVinculo = await client.query(`
      SELECT
        p.placa,
        ARRAY_AGG(DISTINCT m.nome) as motoristas,
        COUNT(DISTINCT pm.motorista_id) as qtd_motoristas
      FROM placas p
      LEFT JOIN placas_motoristas pm ON pm.placa_id = p.id
      LEFT JOIN motoristas m ON m.id = pm.motorista_id
      GROUP BY p.placa
      HAVING COUNT(DISTINCT pm.motorista_id) > 1
      LIMIT 1
    `);

    if (multiVinculo.rows.length > 0) {
      console.log(`\n📋 Exemplo de placa com múltiplos vínculos:`);
      console.log(`   Placa: ${multiVinculo.rows[0].placa}`);
      console.log(`   Motoristas: ${multiVinculo.rows[0].motoristas.join(', ')}`);
    }

  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedPlacas();
