export interface LocationPayload {
  vehicle_id: string;
  trip_id?: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
}

export interface SimulatorVehicle {
  vehicle_id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed_kmh: number;
}