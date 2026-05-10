import { IsEnum, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export enum TransferCurrency {
  AFRI = 'AFRi',
  XGHS = 'xGHS',
}

export class LookupRecipientDto {
  @IsString()
  identifier: string; // phone or email
}

export class CreateTransferDto {
  @IsString()
  recipientIdentifier: string;

  @IsEnum(TransferCurrency)
  currency: TransferCurrency;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
