export type Currency = 'AFRi' | 'xGHS';

export type KycTier = 0 | 1 | 2;

export type UserType = 'individual' | 'business';

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'requires_more_info';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export type AmlStatus = 'pending' | 'cleared' | 'flagged' | 'escalated';

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IdempotentRequest {
  idempotencyKey: string;
}

/** Decimal amounts are transmitted as strings to preserve precision */
export type DecimalString = string;
