import pool from "../../config/db";
import { insertLocation } from "./tracking.queries";
import { SimulatorVehicle } from "./tracking.types";
import { checkGeofenceViolations } from "../geofences/geofences.queries";

const SPEED_LIMIT = 80;
const INTERVAL_MS = 5000; // update tiap 5 detik

// state simulator in-memory
const simulatorState: Map<string, SimulatorVehicle> = new Map();

// geser koordinat berdasarkan heading & speed
const moveCoordinate = (
  lat: number,
  lng: number,
  heading: number,
  speed_kmh: number,
): { latitude: number; longitude: number } => {
  const distanceKm = (speed_kmh * INTERVAL_MS) / 3600000;
  const headingRad = (heading * Math.PI) / 180;

  const deltaLat = (distanceKm / 111) * Math.cos(headingRad);
  const deltaLng =
    (distanceKm / (111 * Math.cos((lat * Math.PI) / 180))) *
    Math.sin(headingRad);

  return {
    latitude: lat + deltaLat,
    longitude: lng + deltaLng,
  };
};

// random heading drift biar gerakannya natural
const driftHeading = (heading: number): number => {
  const drift = (Math.random() - 0.5) * 20;
  return (heading + drift + 360) % 360;
};

// random speed variation
const varySpeed = (speed: number): number => {
  const variation = (Math.random() - 0.5) * 10;
  return Math.min(Math.max(speed + variation, 10), 120);
};

// generate alert kalau speeding
const checkSpeedAlert = async (vehicle_id: string, speed_kmh: number) => {
  if (speed_kmh > SPEED_LIMIT) {
    await pool.query(
      `
      INSERT INTO alerts (vehicle_id, type, message, value)
      VALUES ($1, 'speeding', $2, $3)
    `,
      [
        vehicle_id,
        `Kendaraan melebihi batas kecepatan: ${speed_kmh.toFixed(1)} km/h`,
        speed_kmh,
      ],
    );
  }
};

let simulatorInterval: NodeJS.Timeout | null = null;

export const startSimulator = () => {
  if (simulatorInterval) return;

  console.log("🚗 Tracking simulator started");

  simulatorInterval = setInterval(async () => {
    try {
      // ambil semua trip yang ongoing
      const result = await pool.query(`
        SELECT t.id as trip_id, t.vehicle_id,
          COALESCE(l.latitude, -7.7956 + (random() * 0.1 - 0.05)) as latitude,
          COALESCE(l.longitude, 110.3695 + (random() * 0.1 - 0.05)) as longitude,
          COALESCE(l.heading, random() * 360) as heading,
          COALESCE(l.speed_kmh, 40 + random() * 40) as speed_kmh
        FROM trips t
        LEFT JOIN LATERAL (
          SELECT * FROM locations
          WHERE vehicle_id = t.vehicle_id
          ORDER BY recorded_at DESC
          LIMIT 1
        ) l ON true
        WHERE t.status = 'ongoing'
      `);

      for (const row of result.rows) {
        const newHeading = driftHeading(Number(row.heading));
        const newSpeed = varySpeed(Number(row.speed_kmh));
        const { latitude, longitude } = moveCoordinate(
          Number(row.latitude),
          Number(row.longitude),
          newHeading,
          newSpeed,
        );

        await insertLocation({
          vehicle_id: row.vehicle_id,
          trip_id: row.trip_id,
          latitude,
          longitude,
          speed_kmh: newSpeed,
          heading: newHeading,
        });
        
        await checkGeofenceViolations(
          row.vehicle_id,
          row.trip_id,
          latitude,
          longitude,
        );

        await checkSpeedAlert(row.vehicle_id, newSpeed);
      }
    } catch (err) {
      console.error("Simulator error:", err);
    }
  }, INTERVAL_MS);
};

export const stopSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log("🛑 Tracking simulator stopped");
  }
};
