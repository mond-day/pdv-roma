import { pool } from "../pool";
import { encrypt, decrypt, maskSecret } from "@/lib/crypto/encrypt";

const SECRET_KEYS = [
  "N8N_TOKEN",
  "NIBO_TOKEN",
  "GC_TOKEN",
  "SMTP_PASS",
];

export async function getConfiguracoes() {
  const result = await pool.query(`SELECT key, value_encrypted, value_plain FROM configuracoes`);

  return result.rows.map((row) => {
    const isSecret = SECRET_KEYS.includes(row.key);
    let value: string | undefined;
    let masked = false;

    if (isSecret && row.value_encrypted) {
      try {
        value = decrypt(row.value_encrypted);
        masked = false; // Admin pode ver o valor real
      } catch {
        value = undefined;
      }
    } else if (row.value_plain) {
      value = row.value_plain;
    }

    // Para exibição, mascarar segredos
    const displayValue = isSecret && value ? maskSecret(value) : value;

    return {
      key: row.key,
      value: displayValue,
      masked: isSecret && !!value,
    };
  });
}

export async function getConfigValue(key: string, decryptValue = false): Promise<string | null> {
  const result = await pool.query(
    `SELECT value_encrypted, value_plain FROM configuracoes WHERE key = $1`,
    [key]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const isSecret = SECRET_KEYS.includes(key);

  if (isSecret && row.value_encrypted) {
    if (decryptValue) {
      try {
        return decrypt(row.value_encrypted);
      } catch {
        return null;
      }
    }
    return maskSecret(decrypt(row.value_encrypted));
  }

  return row.value_plain || null;
}

export async function setConfigValue(key: string, value: string) {
  const isSecret = SECRET_KEYS.includes(key);
  const encrypted = isSecret ? encrypt(value) : null;
  const plain = isSecret ? null : value;

  await pool.query(
    `
    INSERT INTO configuracoes (key, value_encrypted, value_plain)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) 
    DO UPDATE SET 
      value_encrypted = EXCLUDED.value_encrypted,
      value_plain = EXCLUDED.value_plain,
      updated_at = NOW()
    `,
    [key, encrypted, plain]
  );
}

export async function setConfiguracoes(items: Array<{ key: string; value: string }>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let updated = 0;
    for (const item of items) {
      await setConfigValue(item.key, item.value);
      updated++;
    }

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

