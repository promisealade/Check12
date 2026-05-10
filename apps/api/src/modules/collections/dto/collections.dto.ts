import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum CollectionCurrency {
  AFRI = 'AFRi',
  XGHS = 'xGHS',
}

export class CreatePaymentLinkDto {
  @IsNumberString()
  amount: string;

  @IsEnum(CollectionCurrency)
  currency: CollectionCurrency;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  expiresInHours?: number;
}

export class GuestPayDto {
  @IsString()
  shortCode: string;

  @IsOptional()
  @IsString()
  momoPhone?: string;

  @IsOptional()
  @IsString()
  payerReference?: string;
}
