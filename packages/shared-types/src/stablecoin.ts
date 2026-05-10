import { Currency, DecimalString, IdempotentRequest } from './common';

export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: DecimalString;
  feePercent: DecimalString;
  validUntil: string;
  oracleStatus: 'healthy' | 'degraded' | 'circuit_open';
}

export interface ConversionPreview {
  fromAmount: DecimalString;
  fromCurrency: Currency;
  toAmount: DecimalString;
  toCurrency: Currency;
  fee: DecimalString;
  rate: DecimalString;
  rateExpiresAt: string;
}

export interface ConversionDto extends IdempotentRequest {
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: DecimalString;
  rateSnapshot: DecimalString;
}
