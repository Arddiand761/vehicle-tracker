import pool from '../../config/db';
import { CreateVehicleBody, UpdateVehicleBody } from './vehicles.types';

export const getAllVehicles = async () => {
  const result = await pool.query(`
    SELECT v.*, 
      d.id as driver_id,
      u.name as driver_name,
      d.phone as driver_phone
    FROM vehicles v
    LEFT JOIN drivers d ON v.current_driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY v.created_at DESC
  `);
  return result.rows;
};

export const getVehicleById = async (id: string) => {
  const result = await pool.query(`
    SELECT v.*, 
      d.id as driver_id,
      u.name as driver_name,
      d.phone as driver_phone
    FROM vehicles v
    LEFT JOIN drivers d ON v.current_driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE v.id = $1
  `, [id]);
  return result.rows[0] || null;
};

export const createVehicle = async (data: CreateVehicleBody) => {
  const result = await pool.query(`
    INSERT INTO vehicles (plate_number, brand, model, type)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [data.plate_number, data.brand, data.model, data.type]);
  return result.rows[0];
};

export const updateVehicle = async (id: string, data: UpdateVehicleBody) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const result = await pool.query(`
    UPDATE vehicles SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `, [...values, id]);
  return result.rows[0] || null;
};

export const deleteVehicle = async (id: string) => {
  const result = await pool.query(
    'DELETE FROM vehicles WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

export const assignDriver = async (vehicleId: string, driverId: string) => {
  const result = await pool.query(`
    UPDATE vehicles SET current_driver_id = $1
    WHERE id = $2
    RETURNING *
  `, [driverId, vehicleId]);
  return result.rows[0] || null;
};

export const unassignDriver = async (vehicleId: string) => {
  const result = await pool.query(`
    UPDATE vehicles SET current_driver_id = NULL, status = 'idle'
    WHERE id = $1
    RETURNING *
  `, [vehicleId]);
  return result.rows[0] || null;
};