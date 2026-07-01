import pool from '../../config/db';
import { CreateGeofenceBody, UpdateGeofenceBody } from './geofences.types';

export const getAllGeofences = async () => {
  const result = await pool.query(`
    SELECT * FROM geofences ORDER BY created_at DESC
  `);
  return result.rows;
};

export const getGeofenceById = async (id: string) => {
  const result = await pool.query(
    'SELECT * FROM geofences WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createGeofence = async (data: CreateGeofenceBody) => {
  const result = await pool.query(`
    INSERT INTO geofences (name, polygon_coords)
    VALUES ($1, $2)
    RETURNING *
  `, [data.name, JSON.stringify(data.polygon_coords)]);
  return result.rows[0];
};

export const updateGeofence = async (id: string, data: UpdateGeofenceBody) => {
  const fields = Object.keys(data);
  const values = Object.values(data).map(v =>
    typeof v === 'object' ? JSON.stringify(v) : v
  );

  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const result = await pool.query(`
    UPDATE geofences SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `, [...values, id]);
  return result.rows[0] || null;
};

export const deleteGeofence = async (id: string) => {
  const result = await pool.query(
    'DELETE FROM geofences WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

// point-in-polygon check (ray casting algorithm)
export const isPointInPolygon = (
  lat: number,
  lng: number,
  polygon: { lat: number; lng: number }[]
): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const checkGeofenceViolations = async (
  vehicle_id: string,
  trip_id: string,
  lat: number,
  lng: number
) => {
  const geofences = await pool.query(
    'SELECT * FROM geofences WHERE is_active = true'
  );

  for (const geo of geofences.rows) {
    const polygon = geo.polygon_coords;
    const inside = isPointInPolygon(lat, lng, polygon);

    if (!inside) {
      // cek apakah alert geofence sudah ada dalam 5 menit terakhir
      const recent = await pool.query(`
        SELECT id FROM alerts
        WHERE vehicle_id = $1
          AND type = 'geofence_violation'
          AND triggered_at > NOW() - INTERVAL '5 minutes'
        LIMIT 1
      `, [vehicle_id]);

      if (recent.rows.length === 0) {
        await pool.query(`
          INSERT INTO alerts (vehicle_id, trip_id, type, message)
          VALUES ($1, $2, 'geofence_violation', $3)
        `, [
          vehicle_id,
          trip_id,
          `Kendaraan keluar dari zona: ${geo.name}`,
        ]);
      }
    }
  }
};