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
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://honeybeelane.vercel.app',
    'https://honeybeelane.com',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/posts', postsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});
