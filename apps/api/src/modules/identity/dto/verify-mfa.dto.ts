import { IsString, Length, Matches } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'MFA code must be 6 digits' })
  code: string;

  @IsString()
  mfaToken: string; // short-lived token issued after password check
}
