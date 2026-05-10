import { Currency, DecimalString, IdempotentRequest } from './common';

export interface RecipientLookup {
  id: string;
  displayName: string;
  phone: string;
  avatarInitials: string;
}

export interface TransferPreview {
  recipient: RecipientLookup;
  amount: DecimalString;
  currency: Currency;
  fee: DecimalString;
  recipientReceives: DecimalString;
  estimatedArrival: string;
  requiresTravelRule: boolean;
}

export interface CreateTransferDto extends IdempotentRequest {
  recipientId: string;
  amount: DecimalString;
  currency: Currency;
  travelRuleDisclosure?: string;
}
