import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/main/config/env';
import { UserRole } from '@/domain/models/user.model';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido', code: 'TOKEN_MISSING' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token inválido', code: 'TOKEN_MALFORMED' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as {
      userId: string;
      email: string;
      role: UserRole;
    };

    req.user = decoded;
    return next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }

    return res.status(401).json({ error: 'Token inválido', code: 'TOKEN_INVALID' });
  }
}
