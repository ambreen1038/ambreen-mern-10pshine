// middlewares/logger.middleware.js
const pinoHttp = require('pino-http');
const logger = require('../utils/logger');
module.exports = pinoHttp({ logger });
