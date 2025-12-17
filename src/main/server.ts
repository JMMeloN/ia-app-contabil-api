import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Routes
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import requestRoutes from './routes/request.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import seedRoutes from './routes/seed.routes';

const app = express();

// Middlewares
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

// Static files (uploads)
app.use('/files', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/companies', companyRoutes);
app.use('/requests', requestRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/seed', seedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(env.port, () => {
  console.log(`🚀 Server is running on port ${env.port}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  console.log(`🔗 CORS Origin: ${env.corsOrigin}`);
});
