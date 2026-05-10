import { IsString, Length, Matches } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must be numeric' })
  otp: string;
}
