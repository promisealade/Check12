import { create } from 'zustand';

export type KycTier = 0 | 1 | 2;
export type UserType = 'individual' | 'business';
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'requires_more_info';

export interface User {
  id: string;
  phone: string;
  email: string;
  type: UserType;
  role?: string;
  tier: KycTier;
  kycStatus: KycStatus;
  businessName?: string;
  registrationNumber?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
