const promClient = require('prom-client');
const responseTime = require('response-time');

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const restResponseTime = responseTime((req, res, time) => {
  httpRequestDurationMicroseconds
    .labels(req.method, req.route.path, res.statusCode)
    .observe(time / 1000);
});

const metricsMiddleware = async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
};

module.exports = { restResponseTime, metricsMiddleware };