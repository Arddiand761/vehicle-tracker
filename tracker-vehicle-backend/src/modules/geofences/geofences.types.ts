export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CreateGeofenceBody {
  name: string;
  polygon_coords: Coordinate[];
}

export interface UpdateGeofenceBody {
  name?: string;
  polygon_coords?: Coordinate[];
  is_active?: boolean;
}