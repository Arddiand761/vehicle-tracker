export type AlertType = 'speeding' | 'geofence_violation' | 'idle_too_long' | 'signal_lost';

export interface AlertFilter {
  vehicle_id?: string;
  type?: AlertType;
  is_read?: boolean;
}