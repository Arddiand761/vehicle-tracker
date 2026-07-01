import pool from '../../config/db';
import { CreateDriverBody, UpdateDriverBody } from './drivers.types';

export const getAllDrivers = async () => {
  const result = await pool.query(`
    SELECT d.*, u.name, u.email, u.role
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
  `);
  return result.rows;
};

export const getDriverById = async (id: string) => {
  const result = await pool.query(`
    SELECT d.*, u.name, u.email, u.role
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = $1
  `, [id]);
  return result.rows[0] || null;
};

export const getDriverTripHistory = async (id: string) => {
  const result = await pool.query(`
    SELECT t.*, v.plate_number, v.brand, v.model
    FROM trips t
    JOIN vehicles v ON t.vehicle_id = v.id
    WHERE t.driver_id = $1
    ORDER BY t.created_at DESC
  `, [id]);
  return result.rows;
};

export const createDriver = async (data: CreateDriverBody) => {
  const result = await pool.query(`
    INSERT INTO drivers (user_id, license_number, phone)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [data.user_id, data.license_number, data.phone]);
  return result.rows[0];
};

export const updateDriver = async (id: string, data: UpdateDriverBody) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const result = await pool.query(`
    UPDATE drivers SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `, [...values, id]);
  return result.rows[0] || null;
};

export const deleteDriver = async (id: string) => {
  const result = await pool.query(
    'DELETE FROM drivers WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};