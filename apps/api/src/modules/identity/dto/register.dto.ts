import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum AccountType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export class RegisterDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format (e.g. +233244000000)' })
  phone: string;

  @IsEmail()
  email: string;

  @MinLength(8, { message: 'password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'password must contain uppercase, lowercase, and a digit',
  })
  password: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;
}
