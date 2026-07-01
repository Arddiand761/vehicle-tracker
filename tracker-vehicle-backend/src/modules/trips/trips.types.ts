export type TripStatus = 'ongoing' | 'completed' | 'cancelled';

export interface CreateTripBody {
  vehicle_id: string;
  driver_id: string;
}

export interface EndTripBody {
  distance_km: number;
}

export interface TripFilter {
  vehicle_id?: string;
  driver_id?: string;
  status?: TripStatus;
  date_from?: string;
  date_to?: string;
}