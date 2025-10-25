import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { startPoolSync } from './jobs/poolSync.job'; // Add this

// Import routes
import authRoutes from './routes/auth.routes';
import walletRoutes from './routes/wallet.routes';
import poolRoutes from './routes/pool.routes';
import stakeRoutes from './routes/stake.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';
import chatHistoryRoutes from './routes/chatHistory.routes';
import chatbotRoutes from './routes/chatbot.routes';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = config.frontendUrls;

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list or matches Vercel preview pattern
    if (allowedOrigins.includes(origin) ||
        origin.match(/^https:\/\/yield-farming.*\.vercel\.app$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/pools', poolRoutes);
app.use('/api/stake', stakeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat-history', chatHistoryRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint for chat history (temporary)
app.get('/api/test-chat', (req, res) => {
  res.json({ message: 'Chat history route is working!', success: true });
});

// Error handler
app.use(errorHandler);

// Start cron jobs
startPoolSync(); // Add this

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);

  // Debug: Log registered routes
  console.log('\n📋 Registered API Routes:');
  console.log('  /api/auth');
  console.log('  /api/wallet');
  console.log('  /api/pools');
  console.log('  /api/stake');
  console.log('  /api/dashboard');
  console.log('  /api/ai');
  console.log('  /api/chat-history');
  console.log('  /api/chatbot  <-- NEW');
  console.log('');
});