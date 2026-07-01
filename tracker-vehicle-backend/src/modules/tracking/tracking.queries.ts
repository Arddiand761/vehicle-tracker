import pool from '../../config/db';
import { LocationPayload } from './tracking.types';

export const getLatestAllVehicles = async () => {
  const result = await pool.query(`
    SELECT DISTINCT ON (l.vehicle_id)
      l.*,
      v.plate_number, v.brand, v.model, v.status as vehicle_status,
      u.name as driver_name
    FROM locations l
    JOIN vehicles v ON l.vehicle_id = v.id
    LEFT JOIN drivers d ON v.current_driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY l.vehicle_id, l.recorded_at DESC
  `);
  return result.rows;
};

export const getLatestByVehicle = async (vehicleId: string) => {
  const result = await pool.query(`
    SELECT DISTINCT ON (l.vehicle_id)
      l.*,
      v.plate_number, v.brand, v.model, v.status as vehicle_status,
      u.name as driver_name
    FROM locations l
    JOIN vehicles v ON l.vehicle_id = v.id
    LEFT JOIN drivers d ON v.current_driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE l.vehicle_id = $1
    ORDER BY l.vehicle_id, l.recorded_at DESC
  `, [vehicleId]);
  return result.rows[0] || null;
};

export const insertLocation = async (data: LocationPayload) => {
  const result = await pool.query(`
    INSERT INTO locations (vehicle_id, trip_id, latitude, longitude, speed_kmh, heading)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    data.vehicle_id,
    data.trip_id || null,
    data.latitude,
    data.longitude,
    data.speed_kmh,
    data.heading,
  ]);
  return result.rows[0];
};

export const getActiveTrips = async () => {
  const result = await pool.query(`
    SELECT t.id as trip_id, t.vehicle_id,
      l.latitude, l.longitude, l.heading, l.speed_kmh
    FROM trips t
    LEFT JOIN LATERAL (
      SELECT * FROM locations
      WHERE vehicle_id = t.vehicle_id
      ORDER BY recorded_at DESC
      LIMIT 1
    ) l ON true
    WHERE t.status = 'ongoing'
  `);
  return result.rows;
};