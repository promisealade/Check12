import { AmlStatus, Currency, DecimalString, TransactionStatus } from './common';

export type TransactionType =
  | 'funding'
  | 'withdrawal'
  | 'conversion'
  | 'transfer_sent'
  | 'transfer_received'
  | 'collection'
  | 'savings_deposit'
  | 'savings_withdrawal';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: DecimalString;
  currency: Currency;
  fee: DecimalString;
  exchangeRate?: DecimalString;
  counterparty?: string;
  referenceId: string;
  amlStatus: AmlStatus;
  createdAt: string;
  settledAt?: string;
}

export interface TransactionListQuery {
  cursor?: string;
  limit?: number;
  type?: TransactionType;
  currency?: Currency;
  startDate?: string;
  endDate?: string;
}
