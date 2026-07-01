export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
};

export type Vehicle = {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  type: string;
  status: 'active' | 'idle' | 'offline';
  current_driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
};

export type Driver = {
  id: string;
  user_id: string;
  license_number: string;
  phone: string;
  status: 'available' | 'on_trip' | 'off_duty';
  name: string;
  email: string;
  created_at: string;
};

export type Trip = {
  id: string;
  vehicle_id: string;
  driver_id: string;
  plate_number: string;
  brand: string;
  model: string;
  driver_name: string;
  start_time: string;
  end_time: string | null;
  distance_km: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  route?: { lat: number; lng: number; speed: number; recorded_at: string }[];
  created_at: string;
};

export type Location = {
  id: string;
  vehicle_id: string;
  trip_id: string | null;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
  recorded_at: string;
  plate_number: string;
  brand: string;
  model: string;
  vehicle_status: 'active' | 'idle' | 'offline';
  driver_name: string | null;
};

export type Alert = {
  id: string;
  vehicle_id: string;
  trip_id: string | null;
  plate_number: string;
  brand: string;
  model: string;
  type: 'speeding' | 'geofence_violation' | 'idle_too_long' | 'signal_lost';
  message: string;
  value: number | null;
  is_read: boolean;
  triggered_at: string;
};

export type Geofence = {
  id: string;
  name: string;
  polygon_coords: { lat: number; lng: number }[];
  is_active: boolean;
  created_at: string;
};

export type DashboardSummary = {
  vehicles: {
    total: string;
    active: string;
    idle: string;
    offline: string;
  };
  drivers: {
    total: string;
    available: string;
    on_trip: string;
    off_duty: string;
  };
  trips: {
    total: string;
    ongoing: string;
    completed_today: string;
    distance_today_km: string;
  };
  alerts: {
    total: string;
    unread: string;
    today: string;
  };
};