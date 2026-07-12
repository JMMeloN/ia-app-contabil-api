import crypto from 'crypto';

const DURATION_PATTERN = /^(\d+)([smhd])$/;

export function hashToken(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function parseDurationToDate(duration: string): Date {
  const match = duration.match(DURATION_PATTERN);
  if (!match) {
    throw new Error(`Formato de duração inválido: ${duration}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const now = Date.now();

  const factor =
    unit === 's' ? 1000 :
    unit === 'm' ? 60 * 1000 :
    unit === 'h' ? 60 * 60 * 1000 :
    24 * 60 * 60 * 1000;

  return new Date(now + amount * factor);
}
