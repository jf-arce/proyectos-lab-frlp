import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  REFRESH_TOKEN_EXPIRATION_DAYS: Joi.number().default(7),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  RESEND_API_KEY: Joi.string().optional().allow(''),
  RESEND_FROM: Joi.string().default('Portal Lab FRLP <no-reply@resend.dev>'),
});
