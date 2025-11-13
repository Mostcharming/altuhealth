const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dbSelector = require('./middlewares/common/dbSelector');
const adminRouter = require('./modules/admin/route');

require('./database');
require('dotenv').config();

const config = require('./config');
const { responseFormatter } = require('./middlewares/common/responseFormatter');
const { securityMiddleware } = require('./middlewares/common/security');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(responseFormatter);
app.use(securityMiddleware);

app.use(dbSelector);

app.use(`/api/${config.apiVersion}/admin`, adminRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Altu Health ERP API',
    apiVersion: config.apiVersion,
    status: 'running'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5022;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
