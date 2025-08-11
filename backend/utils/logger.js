const pino = require('pino');
const pinoHttp = require('pino-http');
const crypto = require('crypto');
const { ecsFormat } = require('@elastic/ecs-pino-format');

const config = {
  level: process.env.LOG_LEVEL || 'info',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({}) // Disable default hostname/pid
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      '*.password'
    ],
    censor: '**REDACTED**'
  }
};

const transport = process.env.NODE_ENV === 'production'
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'
      }
    };

// Create the logger instance

const logger = pino({
  ...config,
  ...(process.env.NODE_ENV === 'production' ? ecsFormat() : {}),
  ...(process.env.NODE_ENV !== 'production' ? { transport } : {})
});


// Add custom audit method
logger.audit = (event, data = {}) => {
  logger.info({
    type: 'audit',
    event,
    ...data
  });
};

// HTTP logger middleware
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      headers: {
        'user-agent': req.headers['user-agent'],
        host: req.headers['host']
      }
    }),
    res: (res) => ({
      status: res.statusCode,
      responseTime: res.responseTime
    }),
   err: pinoHttp.stdSerializers.err

  },
  customLogLevel: (res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});

module.exports = {
  logger,
  httpLogger,
};
