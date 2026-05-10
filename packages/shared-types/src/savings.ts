import { DecimalString, IdempotentRequest } from './common';

export interface SavingsAccount {
  id: string;
  label: string;
  balance: DecimalString;
  targetAmount?: DecimalString;
  progressPercent?: number;
  createdAt: string;
}

export interface CreateSavingsAccountDto {
  label: string;
  targetAmount?: DecimalString;
}

export interface SavingsTransactionDto extends IdempotentRequest {
  amount: DecimalString;
}
