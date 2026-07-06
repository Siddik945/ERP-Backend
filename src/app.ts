import cors from 'cors';
import express from 'express';
import path from 'path';
import { env } from './config/env';
import { globalErrorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { apiRoutes } from './routes';

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Mini ERP API is running' });
});

app.use('/api/v1', apiRoutes);
app.use(notFound);
app.use(globalErrorHandler);
