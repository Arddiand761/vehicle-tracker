export type DriverStatus = 'available' | 'on_trip' | 'off_duty';

export interface CreateDriverBody {
  user_id: string;
  license_number: string;
  phone: string;
}

export interface UpdateDriverBody {
  license_number?: string;
  phone?: string;
  status?: DriverStatus;
}