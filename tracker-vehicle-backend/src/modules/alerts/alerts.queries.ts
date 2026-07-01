import pool from '../../config/db';
import { AlertFilter } from './alerts.types';

export const getAllAlerts = async (filter: AlertFilter) => {
  const conditions: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (filter.vehicle_id) {
    conditions.push(`a.vehicle_id = $${i++}`);
    values.push(filter.vehicle_id);
  }
  if (filter.type) {
    conditions.push(`a.type = $${i++}`);
    values.push(filter.type);
  }
  if (filter.is_read !== undefined) {
    conditions.push(`a.is_read = $${i++}`);
    values.push(filter.is_read);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(`
    SELECT a.*,
      v.plate_number, v.brand, v.model
    FROM alerts a
    JOIN vehicles v ON a.vehicle_id = v.id
    ${where}
    ORDER BY a.triggered_at DESC
    LIMIT 100
  `, values);

  return result.rows;
};

export const markAsRead = async (id: string) => {
  const result = await pool.query(`
    UPDATE alerts SET is_read = true
    WHERE id = $1
    RETURNING *
  `, [id]);
  return result.rows[0] || null;
};

export const markAllAsRead = async () => {
  const result = await pool.query(`
    UPDATE alerts SET is_read = true
    WHERE is_read = false
    RETURNING *
  `);
  return result.rows;
};

export const getUnreadCount = async () => {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM alerts WHERE is_read = false
  `);
  return Number(result.rows[0].count);
};