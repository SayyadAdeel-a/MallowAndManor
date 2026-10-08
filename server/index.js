import path from 'node:path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productsRouter from './routes/products.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import postsRouter from './routes/posts.js';
import settingsRouter from './routes/settings.js';
import googleReviewsRouter from './routes/googleReviews.js';
import seoFilesRouter from './routes/seoFiles.js';
import publishScheduledRouter from './routes/publishScheduled.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ALLOWED_ORIGINS } from '../shared/origins.js';

// Resolve .env relative to this file, not process.cwd(). Previously a bare
// `dotenv.config()` meant running `node MallowAndManor/server/index.js` from
// the repo root loaded the frontend-only .env and died on a missing MONGODB_URI.
dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });

const app = express();

app.set('query parser', 'simple');
app.disable('x-powered-by');

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/posts', postsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/google-reviews', googleReviewsRouter);
app.use('/api/publish-scheduled', publishScheduledRouter);

// SEO files
app.use('/', seoFilesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 404 for unmatched /api routes (never fall through to the SPA)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});
