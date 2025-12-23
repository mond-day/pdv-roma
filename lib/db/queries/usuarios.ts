import { pool } from "../pool";
import { hashPassword } from "@/lib/auth/password";

export async function getUserByEmail(email: string) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    is_active: row.is_active,
  };
}

export async function getUserById(id: string) {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at::text FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export async function listUsuarios() {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at::text FROM users ORDER BY created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
  }));
}

export async function createUsuario(data: {
  name: string;
  email: string;
  role: "admin" | "faturador";
  password: string;
}) {
  const password_hash = await hashPassword(data.password);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, is_active, created_at::text
    `,
    [data.name, data.email, password_hash, data.role]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export async function updateUsuario(
  id: string,
  data: {
    name?: string;
    role?: "admin" | "faturador";
    is_active?: boolean;
    password?: string;
  }
) {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex}`);
    values.push(data.name);
    paramIndex++;
  }

  if (data.role !== undefined) {
    updates.push(`role = $${paramIndex}`);
    values.push(data.role);
    paramIndex++;
  }

  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex}`);
    values.push(data.is_active);
    paramIndex++;
  }

  if (data.password !== undefined) {
    const password_hash = await hashPassword(data.password);
    updates.push(`password_hash = $${paramIndex}`);
    values.push(password_hash);
    paramIndex++;
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, name, email, role, is_active, created_at::text
    `,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export async function deleteUsuario(id: string) {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}

