import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum KycDocType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  SELFIE = 'selfie',
}

export class SubmitKycDto {
  @IsEnum(KycDocType)
  documentType: KycDocType;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  issuingCountry?: string;
}

export enum KybDocType {
  BUSINESS_REGISTRATION = 'business_registration',
  DIRECTOR_ID = 'director_id',
}

export class SubmitKybDto {
  @IsEnum(KybDocType)
  documentType: KybDocType;

  @IsOptional()
  @IsString()
  documentNumber?: string;
}
