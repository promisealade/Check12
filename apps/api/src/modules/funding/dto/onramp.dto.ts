import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum OnrampProvider {
  MOMO_MTN = 'momo_mtn',
  MOMO_VODAFONE = 'momo_vodafone',
  MOMO_AIRTELTIGO = 'momo_airteltigo',
  BANK_TRANSFER = 'bank_transfer',
}

export enum FundCurrency {
  AFRI = 'AFRi',
  XGHS = 'xGHS',
}

export class OnrampDto {
  @IsEnum(FundCurrency)
  currency: FundCurrency;

  @IsNumberString()
  amount: string;

  @IsEnum(OnrampProvider)
  provider: OnrampProvider;

  @IsOptional()
  @IsString()
  momoPhone?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
