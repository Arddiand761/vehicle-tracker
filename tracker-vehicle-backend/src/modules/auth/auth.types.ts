export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'operator' | 'viewer';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}