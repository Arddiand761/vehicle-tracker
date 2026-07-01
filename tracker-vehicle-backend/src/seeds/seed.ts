import pool from "../config/db";
import bcrypt from "bcryptjs";

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log("🌱 Seeding started...");

    // ==================== CLEAR DATA ====================
    await client.query("DELETE FROM alerts");
    await client.query("DELETE FROM locations");
    await client.query("DELETE FROM trips");
    await client.query("DELETE FROM vehicles");
    await client.query("DELETE FROM drivers");
    await client.query("DELETE FROM geofences");
    await client.query("DELETE FROM users");
    console.log("🗑️  Cleared existing data");

    // ==================== USERS ====================
    const passwordHash = await bcrypt.hash("password123", 10);

    const usersResult = await client.query(
      `
      INSERT INTO users (name, email, password_hash, role) VALUES
        ('Admin Fleet', 'admin@fleet.com', $1, 'admin'),
        ('Operator Satu', 'operator1@fleet.com', $1, 'operator'),
        ('Operator Dua', 'operator2@fleet.com', $1, 'operator'),
        ('Budi Santoso', 'budi@fleet.com', $1, 'viewer'),
        ('Andi Wijaya', 'andi@fleet.com', $1, 'viewer'),
        ('Siti Rahayu', 'siti@fleet.com', $1, 'viewer'),
        ('Joko Susilo', 'joko@fleet.com', $1, 'viewer'),
        ('Dewi Putri', 'dewi@fleet.com', $1, 'viewer')
      RETURNING id, name, role
    `,
      [passwordHash],
    );

    const users = usersResult.rows;
    console.log(`✅ Users seeded: ${users.length}`);

    // ambil user yang jadi driver (viewer)
    const driverUsers = users.filter((u) => u.role === "viewer");

    // ==================== DRIVERS ====================
    const driversResult = await client.query(
      `
      INSERT INTO drivers (user_id, license_number, phone, status) VALUES
        ($1, 'SIM-A-001234', '081234567890', 'available'),
        ($2, 'SIM-A-005678', '081234567891', 'available'),
        ($3, 'SIM-B-009012', '081234567892', 'available'),
        ($4, 'SIM-A-003456', '081234567893', 'available')
      RETURNING id, license_number
    `,
      [
        driverUsers[0].id,
        driverUsers[1].id,
        driverUsers[2].id,
        driverUsers[3].id,
      ],
    );

    const drivers = driversResult.rows;
    console.log(`✅ Drivers seeded: ${drivers.length}`);

    // ==================== VEHICLES ====================
    const vehiclesResult = await client.query(`
      INSERT INTO vehicles (plate_number, brand, model, type, status) VALUES
        ('AB 1234 CD', 'Toyota', 'Avanza', 'MPV', 'idle'),
        ('AB 5678 EF', 'Honda', 'Brio', 'Hatchback', 'idle'),
        ('AB 9012 GH', 'Mitsubishi', 'L300', 'Van', 'idle'),
        ('AB 3456 IJ', 'Isuzu', 'Elf', 'Minibus', 'idle'),
        ('AB 7890 KL', 'Toyota', 'Hilux', 'Pickup', 'offline'),
        ('AB 2345 MN', 'Daihatsu', 'Gran Max', 'Van', 'idle')
      RETURNING id, plate_number
    `);

    const vehicles = vehiclesResult.rows;
    console.log(`✅ Vehicles seeded: ${vehicles.length}`);

    // ==================== LOKASI DUMMY UNTUK IDLE VEHICLES ====================
    // vehicles index 0,1,2 = idle (yang tidak ongoing)
    const idleVehicles = [vehicles[0], vehicles[1], vehicles[2], vehicles[5]];
    const baseCoords = [
      { lat: -7.7956, lng: 110.3695 }, // Yogyakarta kota
      { lat: -7.8014, lng: 110.3647 }, // Kraton
      { lat: -7.7829, lng: 110.3671 }, // Tugu
      { lat: -7.75, lng: 110.38 }, // Sleman
    ];

    for (let i = 0; i < idleVehicles.length; i++) {
      await client.query(
        `
    INSERT INTO locations (vehicle_id, trip_id, latitude, longitude, speed_kmh, heading)
    VALUES ($1, NULL, $2, $3, 0, 0)
  `,
        [
          idleVehicles[i].id,
          baseCoords[i].lat + (Math.random() * 0.01 - 0.005),
          baseCoords[i].lng + (Math.random() * 0.01 - 0.005),
        ],
      );
    }
    console.log("✅ Lokasi idle vehicles seeded");
    // ==================== GEOFENCES ====================
    // area sekitar Yogyakarta
    await client.query(
      `
      INSERT INTO geofences (name, polygon_coords, is_active) VALUES
        ('Zona Kota Yogyakarta', $1, true),
        ('Zona Sleman', $2, true),
        ('Zona Bantul', $3, true)
    `,
      [
        JSON.stringify([
          { lat: -7.78, lng: 110.35 },
          { lat: -7.78, lng: 110.42 },
          { lat: -7.83, lng: 110.42 },
          { lat: -7.83, lng: 110.35 },
        ]),
        JSON.stringify([
          { lat: -7.68, lng: 110.32 },
          { lat: -7.68, lng: 110.45 },
          { lat: -7.75, lng: 110.45 },
          { lat: -7.75, lng: 110.32 },
        ]),
        JSON.stringify([
          { lat: -7.85, lng: 110.3 },
          { lat: -7.85, lng: 110.43 },
          { lat: -7.92, lng: 110.43 },
          { lat: -7.92, lng: 110.3 },
        ]),
      ],
    );
    console.log("✅ Geofences seeded: 3");

    // ==================== TRIPS (completed) ====================
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    for (let i = 0; i < 3; i++) {
      const startTime = new Date(yesterday);
      startTime.setHours(8 + i * 2);
      const endTime = new Date(startTime);
      endTime.setHours(
        startTime.getHours() + 1 + Math.floor(Math.random() * 2),
      );

      await client.query(
        `
        INSERT INTO trips (vehicle_id, driver_id, start_time, end_time, distance_km, status)
        VALUES ($1, $2, $3, $4, $5, 'completed')
      `,
        [
          vehicles[i].id,
          drivers[i].id,
          startTime.toISOString(),
          endTime.toISOString(),
          (10 + Math.random() * 40).toFixed(2),
        ],
      );
    }
    console.log("✅ Completed trips seeded: 3");

    // ==================== TRIPS (ongoing) ====================
    for (let i = 0; i < 2; i++) {
      const tripResult = await client.query(
        `
        INSERT INTO trips (vehicle_id, driver_id, status)
        VALUES ($1, $2, 'ongoing')
        RETURNING id
      `,
        [vehicles[i + 3].id, drivers[i].id],
      );

      const tripId = tripResult.rows[0].id;

      // update vehicle & driver status
      await client.query(
        `UPDATE vehicles SET status = 'active', current_driver_id = $1 WHERE id = $2`,
        [drivers[i].id, vehicles[i + 3].id],
      );
      await client.query(
        `UPDATE drivers SET status = 'on_trip' WHERE id = $1`,
        [drivers[i].id],
      );

      // seed lokasi awal
      const baseLat = -7.7956 + (Math.random() * 0.1 - 0.05);
      const baseLng = 110.3695 + (Math.random() * 0.1 - 0.05);

      await client.query(
        `
        INSERT INTO locations (vehicle_id, trip_id, latitude, longitude, speed_kmh, heading)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          vehicles[i + 3].id,
          tripId,
          baseLat,
          baseLng,
          40 + Math.random() * 40,
          Math.random() * 360,
        ],
      );
    }
    console.log("✅ Ongoing trips seeded: 2");

    // ==================== ALERTS ====================
    await client.query(
      `
      INSERT INTO alerts (vehicle_id, type, message, value, is_read) VALUES
        ($1, 'speeding', 'Kendaraan melebihi batas kecepatan: 95.3 km/h', 95.3, false),
        ($2, 'idle_too_long', 'Kendaraan idle terlalu lama: 45 menit', 45, false),
        ($3, 'signal_lost', 'Sinyal kendaraan terputus', null, true),
        ($1, 'geofence_violation', 'Kendaraan keluar dari zona: Zona Kota Yogyakarta', null, false)
    `,
      [vehicles[0].id, vehicles[1].id, vehicles[4].id],
    );
    console.log("✅ Alerts seeded: 4");

    await client.query("COMMIT");
    console.log("\n🎉 Seeding completed!");
    console.log("----------------------------");
    console.log("📧 Login credentials (semua sama):");
    console.log("   Password: password123");
    console.log("   Admin   : admin@fleet.com");
    console.log("   Operator: operator1@fleet.com");
    console.log("   Driver  : budi@fleet.com");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
    throw err;
  } finally {
    client.release();
    process.exit(0);
  }
};

seed();
