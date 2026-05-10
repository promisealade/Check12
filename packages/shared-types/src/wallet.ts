import { Currency, DecimalString } from './common';

export interface Wallet {
  id: string;
  userId: string;
  currency: Currency;
  balance: DecimalString;
  createdAt: string;
}

export interface WalletBalance {
  currency: Currency;
  balance: DecimalString;
  usdEquivalent: DecimalString;
  localEquivalent: DecimalString;
  localCurrencySymbol: string;
}

export interface WalletDashboard {
  wallets: WalletBalance[];
  totalUsdValue: DecimalString;
  savingsBalance: DecimalString;
}
