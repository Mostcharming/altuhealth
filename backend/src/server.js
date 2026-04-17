const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const dbSelector = require('./middlewares/common/dbSelector');
const jobRunnerMiddleware = require('./middlewares/common/jobRunner');
const adminRouter = require('./modules/admin/route');
const providerRouter = require('./modules/provider/route');
const enrolleeRouter = require('./modules/enrollee/route');
const { initializeJobs } = require('./jobs');

require('./database');
require('dotenv').config();

const config = require('./config');
const { responseFormatter } = require('./middlewares/common/responseFormatter');
const defineModels = require('./database/models');
const { masterSequelize, slaveSequelize } = require('./database');

const app = express();

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
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://provider.altuhealth.com', 'https://admin.altuhealth.com', 'https://enrollee.altuhealth.com', 'https://retail.altuhealth.com', 'https://doctors.altuhealth.com', 'http://localhost:3003', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3007', 'http://192.168.1.147:3001', 'http://192.168.1.147:3002', 'http://192.168.1.147:3007', 'http://192.168.43.84:3001', 'http://192.168.43.84:3002', 'http://192.168.43.84:3007'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/' && req.method === 'GET';
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use(limiter);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(hpp({
  whitelist: ['sort', 'fields', 'filter', 'limit', 'page', 'skip'],
}));

app.use(responseFormatter);

app.use(dbSelector);

app.use(jobRunnerMiddleware);

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

if (config && config.uploads && config.uploads.profileDir) {
  app.use('/upload', express.static(config.uploads.profileDir, {
    maxAge: '1d',
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
      // Allow images to be loaded from cross-origin
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));
}

if (config && config.uploads && config.uploads.ticketDir) {
  app.use('/upload', express.static(config.uploads.ticketDir, {
    maxAge: '1d',
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
      // Allow images to be loaded from cross-origin
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));
}

app.use(`/api/${config.apiVersion}/admin`, adminRouter);
app.use(`/api/${config.apiVersion}/provider`, providerRouter);
app.use(`/api/${config.apiVersion}/enrollee`, enrolleeRouter);

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

  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = isDevelopment ? err.message : 'Internal Server Error';
  const errorStatus = err.status || err.statusCode || 500;

  res.status(errorStatus).json({
    error: 'Something went wrong!',
    message: errorMessage,
    ...(isDevelopment && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5022;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);

  // Initialize scheduled jobs
  try {


    const sequelizeInstance = slaveSequelize || masterSequelize;
    if (!sequelizeInstance) {
      throw new Error('Sequelize instance not available');
    }
    const models = defineModels(sequelizeInstance);
    await initializeJobs(models);
    console.log('✅ Scheduled jobs initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize scheduled jobs:', err);
    // Don't exit, continue running even if jobs fail to initialize
  }
});

process.on('SIGTERM', () => {
  console.log('📛 SIGTERM signal received: closing HTTP server');
  const { stopAllJobs } = require('./jobs');
  stopAllJobs();
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT signal received: closing HTTP server');
  const { stopAllJobs } = require('./jobs');
  stopAllJobs();
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

server.setTimeout(30000);

module.exports = app;
