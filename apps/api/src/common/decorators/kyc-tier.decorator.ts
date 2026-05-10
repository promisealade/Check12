import { SetMetadata } from '@nestjs/common';

export const KYC_TIER_KEY = 'kycTier';
export const RequireKycTier = (tier: 0 | 1 | 2) => SetMetadata(KYC_TIER_KEY, tier);
