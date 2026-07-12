import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import requestRoutes from './routes/request.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import seedRoutes from './routes/seed.routes';
import payerRoutes from './routes/payer.routes';
import cnaeRoutes from './routes/cnae.routes';
import nbsRoutes from './routes/nbs.routes';

const app = express();

function normalizeAllowedOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isDevelopmentOriginAllowed(origin: string): boolean {
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].includes(origin);
}

const configuredOrigins = normalizeAllowedOrigins(env.corsOrigin);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    if (env.nodeEnv !== 'production' && isDevelopmentOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/files', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/companies', companyRoutes);
app.use('/requests', requestRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/seed', seedRoutes);
app.use('/payers', payerRoutes);
app.use('/cnaes', cnaeRoutes);
app.use('/nbs', nbsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(env.port, () => {
  console.log(`🚀 Server is running on port ${env.port}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  console.log(`🔗 CORS Origin: ${env.corsOrigin}`);
});
