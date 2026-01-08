const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const dbSelector = require('./middlewares/common/dbSelector');
const adminRouter = require('./modules/admin/route');
const providerRouter = require('./modules/provider/route');

require('./database');
require('dotenv').config();

const config = require('./config');
const { responseFormatter } = require('./middlewares/common/responseFormatter');

const app = express();

// Security: Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://provider.altuhealth.com', 'https://admin.altuhealth.com', 'http://localhost:3001', 'http://localhost:3002', 'http://192.168.1.191:3001', 'http://192.168.1.191:3002', 'http://192.168.43.84:3001', 'http://192.168.43.84:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Rate limiting to prevent DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/' && req.method === 'GET';
  },
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use(limiter);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Security: Prevent HTTP Parameter Pollution attacks
app.use(hpp({
  whitelist: ['sort', 'fields', 'filter', 'limit', 'page', 'skip'], // Allow query string duplication for these params
}));

app.use(responseFormatter);

app.use(dbSelector);

// Security: Disable powered by header to prevent information disclosure
app.disable('x-powered-by');

// Security: Add security headers middleware
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Disable iframe embedding
  res.setHeader('X-Frame-Options', 'DENY');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Security: Serve uploaded files at /upload with strict options
// serve uploaded files at /upload so stored URLs like /upload/<filename> are accessible
if (config && config.uploads && config.uploads.profileDir) {
  app.use('/upload', express.static(config.uploads.profileDir, {
    maxAge: '1d',
    etag: false, // Disable ETags to prevent cache validation timing attacks
    lastModified: false, // Don't expose last modified time
    setHeaders: (res, path) => {
      // Prevent execution of scripts in uploads
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'");
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));
}

app.use(`/api/${config.apiVersion}/admin`, adminRouter);
app.use(`/api/${config.apiVersion}/provider`, providerRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Altu Health ERP API',
    apiVersion: config.apiVersion,
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  // Security: Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = isDevelopment ? err.message : 'Internal Server Error';
  const errorStatus = err.status || err.statusCode || 500;

  // Sanitize error responses to prevent information disclosure
  res.status(errorStatus).json({
    error: 'Something went wrong!',
    message: errorMessage,
    ...(isDevelopment && { stack: err.stack }), // Only expose stack trace in development
  });
});

const PORT = process.env.PORT || 5022;
const HOST = process.env.HOST || '0.0.0.0';

// Security: Graceful shutdown handling
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Set server timeout to prevent long-running requests
server.setTimeout(30000); // 30 seconds

module.exports = app;
