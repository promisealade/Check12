import { KycStatus } from './common';

export type AdminRole = 'admin' | 'compliance_officer' | 'kyc_reviewer' | 'super_admin';

export interface KycQueueItem {
  id: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  documentType: string;
  submittedAt: string;
  status: KycStatus;
  documentUrl?: string;
}

export interface KycDecisionDto {
  decision: 'approved' | 'rejected' | 'requires_more_info';
  notes?: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  mau: number;
  totalVolumeUsd: string;
  totalCollectionsUsd: string;
  pendingKycCount: number;
  pendingAmlCount: number;
}

export interface ReserveReport {
  date: string;
  circulatingAfri: string;
  goldOz: string;
  goldPriceUsd: string;
  reserveValueUsd: string;
  backingRatioPct: string;
  discrepancyPct: string;
  withinTolerance: boolean;
}
