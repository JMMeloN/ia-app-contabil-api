import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const MIN_SECRET_LENGTH = 32;

/**
 * Resolves a signing secret. In production the variable is mandatory and must be
 * long enough; in development we fall back to a dev-only value and warn loudly.
 */
function resolveSecret(name: string, devFallback: string): string {
  const value = process.env[name];

  if (value && value.length >= MIN_SECRET_LENGTH) {
    return value;
  }

  if (isProduction) {
    throw new Error(
      `${name} must be set and have at least ${MIN_SECRET_LENGTH} characters in production`
    );
  }

  if (value) {
    console.warn(`⚠️  ${name} is shorter than ${MIN_SECRET_LENGTH} characters; fine for dev only`);
    return value;
  }

  console.warn(`⚠️  ${name} is not set; using an insecure development fallback`);
  return devFallback;
}

const jwtSecret = resolveSecret('JWT_SECRET', 'dev-secret-do-not-use-in-production-0000');
const refreshTokenSecret = resolveSecret(
  'REFRESH_TOKEN_SECRET',
  'dev-refresh-secret-do-not-use-in-production'
);

if (isProduction && jwtSecret === refreshTokenSecret) {
  throw new Error('REFRESH_TOKEN_SECRET must be different from JWT_SECRET in production');
}

export const env = {
  port: process.env.PORT || 3333,
  nodeEnv,
  isProduction,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret,
  // Short-lived access token; clients renew it through POST /auth/refresh.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenSecret,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  nfeioApiKey: process.env.NFEIO_API_KEY || '',
  nfeioCompanyId: process.env.NFEIO_COMPANY_ID || '',
  nfeioBaseUrl: process.env.NFEIO_BASE_URL || 'https://api.nfe.io/v1',
  nfeioEnvironment:
    process.env.NFEIO_ENVIRONMENT ||
    (isProduction ? 'Production' : 'Development'),
  listaCnaeUrl:
    process.env.LISTACNAE_URL ||
    process.env.LISTA_CNAE_URL ||
    'https://api.listacnae.com.br/v1/todosCnaes',
  listaCnaeBearerToken:
    process.env.LISTACNAE_BEARER_TOKEN ||
    process.env.LISTACNAE_TOKEN ||
    process.env.LISTA_CNAE_TOKEN ||
    '',
};
