const path = require('path');
const dotenv = require('dotenv');

// Always load backend/.env regardless of where node is started from
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const campaignRoutes = require('./routes/campaignRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { validateHfToken } = require('./utils/validateHfToken');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ad_campaign_generator';
const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    if (isDev && isLocalDevOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
}));

app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

app.get('/api/health', async (req, res) => {
  const hfCheck = await validateHfToken(process.env.HF_TOKEN);
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    huggingface: {
      configured: hfCheck.valid,
      hint: hfCheck.valid ? undefined : hfCheck.message,
    },
  });
});

app.use('/api/campaigns', campaignRoutes);

app.use(errorHandler);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const hfCheck = await validateHfToken(process.env.HF_TOKEN);
    if (hfCheck.valid) {
      console.log('✅ Hugging Face token verified');
    } else {
      console.warn('⚠️  Hugging Face token issue:', hfCheck.message);
      console.warn('   Edit backend/.env → HF_TOKEN=hf_your_real_token');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });
