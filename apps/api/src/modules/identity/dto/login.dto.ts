import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // phone or email

  @MinLength(1)
  @IsString()
  password: string;
}
