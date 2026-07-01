import pool from '../../config/db';

export const getSummary = async () => {
  const [vehicles, alerts, trips, drivers] = await Promise.all([
    // vehicle summary
    pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'idle') as idle,
        COUNT(*) FILTER (WHERE status = 'offline') as offline
      FROM vehicles
    `),

    // alert summary
    pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread,
        COUNT(*) FILTER (WHERE triggered_at >= CURRENT_DATE) as today
      FROM alerts
    `),

    // trip summary
    pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ongoing') as ongoing,
        COUNT(*) FILTER (WHERE status = 'completed' AND DATE(start_time) = CURRENT_DATE) as completed_today,
        COALESCE(SUM(distance_km) FILTER (WHERE DATE(start_time) = CURRENT_DATE), 0) as distance_today_km
      FROM trips
    `),

    // driver summary
    pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'on_trip') as on_trip,
        COUNT(*) FILTER (WHERE status = 'off_duty') as off_duty
      FROM drivers
    `),
  ]);

  return {
    vehicles: vehicles.rows[0],
    alerts: alerts.rows[0],
    trips: trips.rows[0],
    drivers: drivers.rows[0],
  };
};

export const getFleetStats = async (days: number = 7) => {
  // trip count & distance per hari
  const dailyTrips = await pool.query(`
    SELECT
      DATE(start_time) as date,
      COUNT(*) as total_trips,
      COALESCE(SUM(distance_km), 0) as total_distance_km,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM trips
    WHERE start_time >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(start_time)
    ORDER BY date ASC
  `);

  // alert count per tipe
  const alertByType = await pool.query(`
    SELECT type, COUNT(*) as count
    FROM alerts
    WHERE triggered_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY type
    ORDER BY count DESC
  `);

  // top 5 kendaraan paling aktif
  const topVehicles = await pool.query(`
    SELECT
      v.plate_number, v.brand, v.model,
      COUNT(t.id) as total_trips,
      COALESCE(SUM(t.distance_km), 0) as total_distance_km
    FROM vehicles v
    LEFT JOIN trips t ON t.vehicle_id = v.id
      AND t.start_time >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY v.id, v.plate_number, v.brand, v.model
    ORDER BY total_trips DESC
    LIMIT 5
  `);

  // top 5 driver paling aktif
  const topDrivers = await pool.query(`
    SELECT
      u.name as driver_name,
      d.license_number,
      COUNT(t.id) as total_trips,
      COALESCE(SUM(t.distance_km), 0) as total_distance_km
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN trips t ON t.driver_id = d.id
      AND t.start_time >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY d.id, u.name, d.license_number
    ORDER BY total_trips DESC
    LIMIT 5
  `);

  return {
    daily_trips: dailyTrips.rows,
    alert_by_type: alertByType.rows,
    top_vehicles: topVehicles.rows,
    top_drivers: topDrivers.rows,
  };
};

export const getRecentAlerts = async (limit: number = 10) => {
  const result = await pool.query(`
    SELECT a.*, v.plate_number, v.brand, v.model
    FROM alerts a
    JOIN vehicles v ON a.vehicle_id = v.id
    ORDER BY a.triggered_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};