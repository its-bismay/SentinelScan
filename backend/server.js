import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import passport from 'passport';
import { serve } from 'inngest/express';

dotenv.config();

import connectDB from './src/config/db.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import errorHandler from './src/middleware/errorHandler.js';
import { setupPassport } from './src/controllers/auth.controller.js';

import authRoutes from './src/routes/auth.routes.js';
import scanRoutes from './src/routes/scan.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';

import { inngest } from './src/services/inngest.js';
import { scanJob } from './src/inngest/functions/scanJob.js';

const app = express();

// Connect Database
connectDB();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allow all origins with credentials
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Passport
setupPassport();
app.use(passport.initialize());

// Health check
app.get('/', (req, res) => res.json({ success: true, message: 'SentinelScan API is running 🛡️' }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'healthy', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Inngest handler
app.use(
  '/api/inngest',
  serve({ client: inngest, functions: [scanJob] })
);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.path} not found` }));

// Error handler
app.use(errorHandler);

export default app;
