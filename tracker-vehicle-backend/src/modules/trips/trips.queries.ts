import pool from '../../config/db';
import { CreateTripBody, TripFilter } from './trips.types';

export const getAllTrips = async (filter: TripFilter) => {
  const conditions: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (filter.vehicle_id) {
    conditions.push(`t.vehicle_id = $${i++}`);
    values.push(filter.vehicle_id);
  }
  if (filter.driver_id) {
    conditions.push(`t.driver_id = $${i++}`);
    values.push(filter.driver_id);
  }
  if (filter.status) {
    conditions.push(`t.status = $${i++}`);
    values.push(filter.status);
  }
  if (filter.date_from) {
    conditions.push(`t.start_time >= $${i++}`);
    values.push(filter.date_from);
  }
  if (filter.date_to) {
    conditions.push(`t.start_time <= $${i++}`);
    values.push(filter.date_to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(`
    SELECT t.*,
      v.plate_number, v.brand, v.model,
      u.name as driver_name
    FROM trips t
    JOIN vehicles v ON t.vehicle_id = v.id
    JOIN drivers d ON t.driver_id = d.id
    JOIN users u ON d.user_id = u.id
    ${where}
    ORDER BY t.created_at DESC
  `, values);

  return result.rows;
};

export const getTripById = async (id: string) => {
  const result = await pool.query(`
    SELECT t.*,
      v.plate_number, v.brand, v.model,
      u.name as driver_name,
      json_agg(
        json_build_object(
          'lat', l.latitude,
          'lng', l.longitude,
          'speed', l.speed_kmh,
          'heading', l.heading,
          'recorded_at', l.recorded_at
        ) ORDER BY l.recorded_at ASC
      ) FILTER (WHERE l.id IS NOT NULL) as route
    FROM trips t
    JOIN vehicles v ON t.vehicle_id = v.id
    JOIN drivers d ON t.driver_id = d.id
    JOIN users u ON d.user_id = u.id
    LEFT JOIN locations l ON l.trip_id = t.id
    WHERE t.id = $1
    GROUP BY t.id, v.plate_number, v.brand, v.model, u.name
  `, [id]);
  return result.rows[0] || null;
};

export const getTripReport = async (date_from: string, date_to: string) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total_trips,
      SUM(distance_km) as total_distance_km,
      AVG(distance_km) as avg_distance_km,
      SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as total_hours,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM trips
    WHERE start_time >= $1 AND start_time <= $2
  `, [date_from, date_to]);
  return result.rows[0];
};

export const startTrip = async (data: CreateTripBody) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // cek vehicle available
    const vehicle = await client.query(
      `SELECT * FROM vehicles WHERE id = $1`,
      [data.vehicle_id]
    );
    if (!vehicle.rows[0]) throw new Error('VEHICLE_NOT_FOUND');
    if (vehicle.rows[0].status === 'active') throw new Error('VEHICLE_ON_TRIP');

    // cek driver available
    const driver = await client.query(
      `SELECT * FROM drivers WHERE id = $1`,
      [data.driver_id]
    );
    if (!driver.rows[0]) throw new Error('DRIVER_NOT_FOUND');
    if (driver.rows[0].status === 'on_trip') throw new Error('DRIVER_ON_TRIP');

    // buat trip
    const trip = await client.query(`
      INSERT INTO trips (vehicle_id, driver_id)
      VALUES ($1, $2)
      RETURNING *
    `, [data.vehicle_id, data.driver_id]);

    // update status vehicle & driver
    await client.query(
      `UPDATE vehicles SET status = 'active', current_driver_id = $1 WHERE id = $2`,
      [data.driver_id, data.vehicle_id]
    );
    await client.query(
      `UPDATE drivers SET status = 'on_trip' WHERE id = $1`,
      [data.driver_id]
    );

    await client.query('COMMIT');
    return trip.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const endTrip = async (id: string, distance_km: number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const trip = await client.query(
      `SELECT * FROM trips WHERE id = $1`,
      [id]
    );
    if (!trip.rows[0]) throw new Error('TRIP_NOT_FOUND');
    if (trip.rows[0].status !== 'ongoing') throw new Error('TRIP_NOT_ONGOING');

    // update trip
    const updated = await client.query(`
      UPDATE trips
      SET status = 'completed', end_time = NOW(), distance_km = $1
      WHERE id = $2
      RETURNING *
    `, [distance_km, id]);

    // update status vehicle & driver
    await client.query(
      `UPDATE vehicles SET status = 'idle' WHERE id = $1`,
      [trip.rows[0].vehicle_id]
    );
    await client.query(
      `UPDATE drivers SET status = 'available' WHERE id = $1`,
      [trip.rows[0].driver_id]
    );

    await client.query('COMMIT');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};