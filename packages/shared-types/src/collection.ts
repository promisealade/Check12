import { Currency, DecimalString } from './common';

export type PaymentLinkStatus = 'active' | 'paid' | 'expired';
export type PaymentLinkExpiry = '1h' | '24h' | '7d';

export interface PaymentLink {
  id: string;
  shortCode: string;
  url: string;
  qrCodeUrl: string;
  amount: DecimalString;
  currency: Currency;
  description?: string;
  status: PaymentLinkStatus;
  expiresAt: string;
  paidAt?: string;
  createdAt: string;
}

export interface CreatePaymentLinkDto {
  amount: DecimalString;
  currency: Currency;
  description?: string;
  expiry: PaymentLinkExpiry;
}

export interface GuestPaymentDto {
  phone: string;
  provider: 'mtn' | 'vodafone' | 'airteltigo';
}
