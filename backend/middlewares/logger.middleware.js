const pinoHttp = require('pino-http');
const {logger} = require('../utils/logger');

module.exports = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip
    }),
    res: (res) => ({
      status: res.statusCode,
      responseTime: res.responseTime
    }),
    err: pinoHttp.stdSerializers.err
  },
  customProps: (req) => ({
    user: req.user?.id,
    session: req.session?.id
  }),
  customLogLevel: (res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});