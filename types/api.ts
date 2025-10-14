export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  image_uri?: string;
  user_id: number;
  user: User;
  attendance_count: number;
  is_attending: boolean;
  distance_meters?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  image_uri?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
