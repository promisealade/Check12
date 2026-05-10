import { IsNumberString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSavingsAccountDto {
  @IsString()
  @MinLength(2)
  label: string;

  @IsOptional()
  @IsNumberString()
  targetAmount?: string;
}

export class SavingsDepositDto {
  @IsUUID()
  savingsAccountId: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class SavingsWithdrawDto {
  @IsUUID()
  savingsAccountId: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
