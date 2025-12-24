import { pool } from "../pool";
import type { CarregamentoResumoSchema } from "@/lib/validators/carregamentos";
import type { z } from "zod";

export async function listCarregamentos(params: {
  date?: string;
  dateFim?: string;
  status?: string;
  cliente?: string;
  transportadora?: string;
  motorista?: string;
  placa?: string;
  contrato?: string;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;
  // Se dateFim for fornecido, usar range, senão usar data única
  let conditions: string[];
  let values: unknown[];
  let paramIndex: number;
  
  // Se a data não foi fornecida, não filtrar por data (mostrar todos)
  if (!params.date) {
    conditions = [];
    values = [];
    paramIndex = 1; // LIMIT será $1, OFFSET será $2
  } else if (params.dateFim) {
    // Quando dateFim é fornecido, sempre usar range (mesmo que seja igual a date)
    // Como data_carregamento já é DATE, podemos comparar diretamente
    conditions = ["c.data_carregamento >= $1::date AND c.data_carregamento <= $2::date"];
    values = [params.date, params.dateFim];
    paramIndex = 3; // LIMIT será $3, OFFSET será $4
  } else {
    // Comparar diretamente, já que data_carregamento é DATE
    conditions = ["c.data_carregamento = $1::date"];
    values = [params.date];
    paramIndex = 2; // LIMIT será $2, OFFSET será $3
  }

  if (params.status) {
    conditions.push(`c.status = $${paramIndex}`);
    values.push(params.status);
    paramIndex++;
  }

  if (params.cliente) {
    conditions.push(`(v.nome_cliente ILIKE $${paramIndex} OR c.cliente_nome ILIKE $${paramIndex})`);
    values.push(`%${params.cliente}%`);
    paramIndex++;
  }

  if (params.transportadora) {
    conditions.push(`t.nome ILIKE $${paramIndex}`);
    values.push(`%${params.transportadora}%`);
    paramIndex++;
  }

  if (params.motorista) {
    conditions.push(`m.nome ILIKE $${paramIndex}`);
    values.push(`%${params.motorista}%`);
    paramIndex++;
  }

  if (params.placa) {
    conditions.push(`c.placa ILIKE $${paramIndex}`);
    values.push(`%${params.placa}%`);
    paramIndex++;
  }

  if (params.contrato) {
    conditions.push(`(v.codigo ILIKE $${paramIndex} OR c.contrato_codigo ILIKE $${paramIndex})`);
    values.push(`%${params.contrato}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Fazer JOINs com vendas, transportadoras e motoristas
  // transportadora_id (BIGINT) → transportadoras.id_gc (TEXT) via cast
  const countQuery = `
    SELECT COUNT(*)
    FROM carregamentos c
    LEFT JOIN vendas v ON v.id_gc = c.id_gc
    LEFT JOIN produtos_venda pv ON pv.id = c.produto_venda_id
    LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
    LEFT JOIN motoristas m ON m.id = c.motorista_id
    ${whereClause}
  `;
  const dataQuery = `
    SELECT
      c.id,
      c.data_carregamento::text as data_carregamento,
      c.placa,
      COALESCE(v.nome_cliente, c.cliente_nome, '') as cliente_nome,
      COALESCE(v.codigo, c.contrato_codigo, '') as contrato_codigo,
      COALESCE(pv.nome_produto, '') as produto_nome,
      CASE
        WHEN c.peso_final_total IS NOT NULL AND c.tara_total IS NOT NULL
        THEN (c.peso_final_total - c.tara_total)
        ELSE NULL
      END as liquido_kg,
      c.status,
      i.status as integracao_status,
      t.nome as transportadora_nome,
      m.nome as motorista_nome
    FROM carregamentos c
    LEFT JOIN vendas v ON v.id_gc = c.id_gc
    LEFT JOIN produtos_venda pv ON pv.id = c.produto_venda_id
    LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
    LEFT JOIN motoristas m ON m.id = c.motorista_id
    LEFT JOIN integracoes_n8n i ON i.carregamento_id = c.id
    ${whereClause}
    ORDER BY c.data_carregamento DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Preparar valores para a query (incluindo LIMIT e OFFSET)
  const queryValues = [...values, params.pageSize, offset];

  try {
    console.log("listCarregamentos - Params:", { date: params.date, dateFim: params.dateFim, page: params.page, pageSize: params.pageSize });
    console.log("listCarregamentos - Count Query:", countQuery);
    console.log("listCarregamentos - Data Query:", dataQuery);
    console.log("listCarregamentos - Count Values:", values);
    console.log("listCarregamentos - Data Values:", queryValues);
    
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, values),
      pool.query(dataQuery, queryValues),
    ]);

    console.log("listCarregamentos - Count result:", countResult.rows[0]?.count);
    console.log("listCarregamentos - Data result rows:", dataResult.rows.length);
    if (dataResult.rows.length === 0) {
      console.log("listCarregamentos - Nenhum resultado encontrado para os filtros aplicados");
    }
    if (dataResult.rows.length > 0) {
      console.log("listCarregamentos - Primeira linha:", JSON.stringify(dataResult.rows[0], null, 2));
    }

    const items = dataResult.rows.map((row) => {
      const item = {
        id: row.id,
        data_carregamento: row.data_carregamento,
        placa: row.placa || '',
        cliente_nome: row.cliente_nome || '',
        contrato_codigo: row.contrato_codigo || '',
        produto_nome: row.produto_nome || '',
        liquido_kg: row.liquido_kg ? parseInt(String(row.liquido_kg), 10) : null,
        status: row.status || 'standby',
        integracao_status: row.integracao_status || null,
        transportadora_nome: row.transportadora_nome || null,
        motorista_nome: row.motorista_nome || null,
      };
      return item;
    });

    console.log("listCarregamentos - Items mapeados:", items.length);
    if (items.length > 0) {
      console.log("listCarregamentos - Primeiro item mapeado:", JSON.stringify(items[0], null, 2));
    }

    return {
      total: parseInt(countResult.rows[0]?.count || '0', 10),
      items,
    };
  } catch (error) {
    console.error("❌ Erro em listCarregamentos:", error);
    console.error("Query count:", countQuery);
    console.error("Query data:", dataQuery);
    console.error("Values:", values);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    throw error;
  }
}

export async function getCarregamentoById(id: number) {
  const result = await pool.query(
    `
    SELECT
      c.*,
      c.data_carregamento::text as data_carregamento,
      COALESCE(v.nome_cliente, c.cliente_nome) as nome_cliente,
      COALESCE(v.codigo, c.contrato_codigo) as contrato_codigo,
      jsonb_build_object(
        'status', i.status,
        'ultima_mensagem', i.ultima_mensagem,
        'tentativas', i.tentativas,
        'ultimo_envio_em', i.ultimo_envio_em::text,
        'idempotency_key', i.idempotency_key
      ) as integracao
    FROM carregamentos c
    LEFT JOIN vendas v ON v.id_gc = c.id_gc
    LEFT JOIN integracoes_n8n i ON i.carregamento_id = c.id
    WHERE c.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  // Converter tara_eixos e peso_final_eixos de array JSONB para objeto numerado
  const taraEixosObj: Record<number, number> = {};
  if (row.tara_eixos && Array.isArray(row.tara_eixos)) {
    row.tara_eixos.forEach((peso: number, index: number) => {
      taraEixosObj[index + 1] = peso;
    });
  }
  
  const finalEixosObj: Record<number, number> = {};
  if (row.peso_final_eixos && Array.isArray(row.peso_final_eixos)) {
    row.peso_final_eixos.forEach((peso: number, index: number) => {
      finalEixosObj[index + 1] = peso;
    });
  }

  return {
    id: row.id,
    status: row.status,
    placa: row.placa,
    cliente_nome: row.nome_cliente || '',
    contrato_codigo: row.contrato_codigo || '',
    id_gc: row.id_gc,
    venda_id: row.venda_id,
    transportadora_id: row.transportadora_id,
    motorista_id: row.motorista_id,
    produto_venda_id: row.produto_venda_id,
    produto_nome: row.detalhes_produto || '',
    qtd_desejada: row.qtd_desejada,
    tara_total: row.tara_total ? parseFloat(row.tara_total) : null,
    peso_final_total: row.peso_final_total ? parseFloat(row.peso_final_total) : null,
    eixos: row.eixos,
    tara_eixos_kg: Object.keys(taraEixosObj).length > 0 ? taraEixosObj : null,
    final_eixos_kg: Object.keys(finalEixosObj).length > 0 ? finalEixosObj : null,
    observacoes: row.observacoes,
    finalizado_em: row.finalizado_em ? row.finalizado_em.toISOString() : null,
    cancelado_em: row.cancelado_em ? row.cancelado_em.toISOString() : null,
    cancelamento_motivo: row.cancelamento_motivo,
    integracao: row.integracao?.status ? row.integracao : null,
  };
}

export async function finalizarCarregamento(
  id: number,
  data: {
    peso_final_total: number; // em gramas (NUMERIC)
    final_eixos_kg?: number[];
    idempotency_key: string;
    n8n_payload?: unknown;
  }
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Atualizar carregamento com peso_final_total em gramas
    await client.query(
      `
      UPDATE carregamentos
      SET
        status = 'finalizado',
        peso_final_total = $1,
        peso_final_eixos = $2,
        finalizado_em = NOW()
      WHERE id = $3 AND status = 'standby'
      `,
      [
        data.peso_final_total,
        data.final_eixos_kg ? JSON.stringify(data.final_eixos_kg) : null,
        id,
      ]
    );

    // Criar/atualizar integração
    await client.query(
      `
      INSERT INTO integracoes_n8n (carregamento_id, idempotency_key, status, payload)
      VALUES ($1, $2, 'pendente', $3)
      ON CONFLICT (idempotency_key) DO NOTHING
      `,
      [id, data.idempotency_key, data.n8n_payload ? JSON.stringify(data.n8n_payload) : null]
    );

    await client.query("COMMIT");

    // Buscar status da integração
    const integResult = await pool.query(
      `SELECT status FROM integracoes_n8n WHERE carregamento_id = $1`,
      [id]
    );

    return {
      status: "finalizado" as const,
      integracao_status: (integResult.rows[0]?.status || "pendente") as "pendente" | "enviado" | "erro",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createCarregamento(data: {
  venda_id: string;
  placa: string;
  detalhes_produto?: string;
  qtd_desejada?: string;
  tara_total?: number; // em gramas (NUMERIC)
  eixos?: number;
  tara_eixos?: number[]; // array de pesos em kg
  observacoes?: string;
  transportadora_id?: number | string;
  motorista_id?: number;
}) {
  // Converter tara_eixos de array para JSONB array
  const taraEixosJsonb = data.tara_eixos ? JSON.stringify(data.tara_eixos) : null;
  
  const result = await pool.query(
    `
    INSERT INTO carregamentos (
      venda_id,
      placa,
      detalhes_produto,
      qtd_desejada,
      tara_total,
      eixos,
      tara_eixos,
      observacoes,
      transportadora_id,
      motorista_id,
      status,
      data_carregamento
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'standby', CURRENT_TIMESTAMP)
    RETURNING id, status, placa
    `,
    [
      data.venda_id,
      data.placa,
      data.detalhes_produto || null,
      data.qtd_desejada || null,
      data.tara_total || null,
      data.eixos || null,
      taraEixosJsonb,
      data.observacoes || null,
      data.transportadora_id || null,
      data.motorista_id || null,
    ]
  );

  return {
    id: result.rows[0].id,
    status: result.rows[0].status,
    placa: result.rows[0].placa,
  };
}

export async function cancelarCarregamento(
  id: number,
  motivo: string
) {
  const result = await pool.query(
    `
    UPDATE carregamentos
    SET 
      status = 'cancelado',
      cancelado_em = NOW(),
      cancelamento_motivo = $1,
      updated_at = NOW()
      WHERE id = $2 AND status IN ('standby', 'finalizado')
    RETURNING id, status
    `,
    [motivo, id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    status: result.rows[0].status,
  };
}

