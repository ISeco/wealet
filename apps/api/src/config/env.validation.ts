import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DATABASE_URL: Joi.string().optional(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_SECONDS: Joi.number().default(900),
  REFRESH_TOKEN_EXPIRATION_DAYS: Joi.number().default(7),
  PASSWORD_PEPPER: Joi.string().required(),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  BREVO_API_KEY: Joi.string().required(),
  BREVO_FROM_EMAIL: Joi.string().email().required(),
  FRONTEND_URL: Joi.string().uri().required(),
});
