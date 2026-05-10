export interface LoginDto {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface VerifyPhoneDto {
  phone: string;
  otp: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
}
