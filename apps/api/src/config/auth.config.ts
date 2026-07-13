import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpirationSeconds: number;
  refreshTokenExpirationDays: number;
  passwordPepper: string;
  passwordPepperPrevious?: string;
  corsOrigin: string;
  googleClientId: string;
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpirationSeconds: Number(process.env.JWT_EXPIRATION_SECONDS) || 900,
    refreshTokenExpirationDays:
      Number(process.env.REFRESH_TOKEN_EXPIRATION_DAYS) || 7,
    passwordPepper: process.env.PASSWORD_PEPPER!,
    passwordPepperPrevious: process.env.PASSWORD_PEPPER_PREVIOUS,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
  }),
);
