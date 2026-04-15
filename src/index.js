require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { logger } = require('./utils/logger');
const translationRoutes = require('./routes/translation');
const healthRoutes = require('./routes/health');

// Initialize express app
const app = express();
app.set('trust proxy', true); //Express tin tưởng headers từ proxy, bao gồm X-Forwarded-For
const PORT = process.env.PORT || 3000;

// Apply security headers
app.use(helmet());

// // Set up CORS
// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, curl requests)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// Thay đổi phần cấu hình CORS
app.use(cors({
  origin: true, // Cho phép tất cả các origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set up request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Parse JSON body
app.use(express.json());

app.use((req, res, next) => {
  //logger.info(`Request received from IP: ${req.ip}, X-Forwarded-For: ${req.headers['x-forwarded-for']}`); // Log the IP address of the request
  logger.info('=============');
  logger.info(`Request received from IP: ${req.ip}, IP chain: ${req.ips.join(' -> ')}, User-Agent=${req.headers['user-agent']}`); //Log all IP addresses in the chain
  logger.info('---------------------');
  next();
});

// Apply rate limiting (express-rate-limit v8: use `limit` + `ipKeyGenerator` for IPv6 safety)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP/UA combo per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    // ipKeyGenerator handles IPv6 subnet normalization (required in v8 custom keyGenerators)
    const ipKey = ipKeyGenerator(req.ip || '');
    const userAgent = req.headers['user-agent'] || '';
    return `${ipKey}-${userAgent}`;
  },
  handler: (req, res, _next, _options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);
    res.status(429).json({ error: 'Too many requests from this IP/User-Agent, please try again later.' });
  }
});
app.use(limiter);

// Register routes
app.use('/api/health', healthRoutes);
app.use('/api/translate', translationRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Handle errors
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
