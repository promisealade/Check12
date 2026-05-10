import { KycStatus, KycTier, UserType } from './common';

export interface User {
  id: string;
  phone: string;
  email: string;
  type: UserType;
  tier: KycTier;
  kycStatus: KycStatus;
  businessName?: string;
  registrationNumber?: string;
  createdAt: string;
}

export interface CreateIndividualUserDto {
  phone: string;
  email: string;
  password: string;
  type: 'individual';
}

export interface CreateBusinessUserDto {
  phone: string;
  email: string;
  password: string;
  type: 'business';
  businessName: string;
  registrationNumber: string;
}

export type CreateUserDto = CreateIndividualUserDto | CreateBusinessUserDto;

export interface UserProfile extends Omit<User, 'createdAt'> {
  createdAt: string;
  notificationCount: number;
}
