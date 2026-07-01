import pool from '../../config/db';

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const createUser = async (
  name: string,
  email: string,
  passwordHash: string,
  role: string = 'viewer'
) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
};

export const getUsersNotDriver = async () => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.email, u.role
    FROM users u
    WHERE u.id NOT IN (SELECT user_id FROM drivers)
    ORDER BY u.name ASC
  `);
  return result.rows;
};

