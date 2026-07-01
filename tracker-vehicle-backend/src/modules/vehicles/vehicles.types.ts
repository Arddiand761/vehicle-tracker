export type VehicleStatus = 'active' | 'idle' | 'offline';

export interface CreateVehicleBody {
  plate_number: string;
  brand: string;
  model: string;
  type: string;
}

export interface UpdateVehicleBody {
  plate_number?: string;
  brand?: string;
  model?: string;
  type?: string;
  status?: VehicleStatus;
}

export interface AssignDriverBody {
  driver_id: string;
}