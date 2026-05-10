import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum ConversionDirection {
  AFRI_TO_XGHS = 'AFRi_to_xGHS',
  XGHS_TO_AFRI = 'xGHS_to_AFRi',
}

export class ConversionPreviewDto {
  @IsEnum(ConversionDirection)
  direction: ConversionDirection;

  @IsNumberString()
  amount: string;
}

export class ConversionDto extends ConversionPreviewDto {
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
