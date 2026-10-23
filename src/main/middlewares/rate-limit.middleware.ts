import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function limiter(max: number, message: string) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message, code: 'RATE_LIMITED' },
  });
}

/** Login / register: credential guessing protection. */
export const authRateLimiter = limiter(
  20,
  'Muitas tentativas de autenticação. Tente novamente em alguns minutos.'
);

/** Refresh / logout: a bit more generous, but still bounded per IP. */
export const tokenRateLimiter = limiter(
  60,
  'Muitas requisições. Tente novamente em alguns minutos.'
);

/** Everything else: coarse protection against abuse. */
export const generalRateLimiter = limiter(
  600,
  'Muitas requisições. Tente novamente em alguns minutos.'
);
