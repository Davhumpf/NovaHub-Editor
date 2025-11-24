// User types for authentication and premium features

export type UserTier = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  avatar?: string;
  createdAt: Date;
  premiumExpiresAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
