import { logger } from '../utils/logger.js';

// Request monitoring middleware
export const requestMonitoring = (req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
      success: data?.success !== false
    });

    // Log slow requests
    if (duration > 2000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        userId: req.user?.id
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

// Security monitoring
export const securityMonitoring = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script|javascript:|on\w+\s*=)/i,
    /(union\s+select|drop\s+table|insert\s+into)/i,
    /(\.\.\/|\.\.\\)/,
    /(<iframe|<object|<embed)/i
  ];

  const checkSuspicious = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          logger.warn('Suspicious input detected', {
            pattern: pattern.toString(),
            value: obj.substring(0, 100),
            path: path,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
          break;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        checkSuspicious(value, path ? `${path}.${key}` : key);
      }
    }
  };

  // Check request body and query parameters
  if (req.body) checkSuspicious(req.body, 'body');
  if (req.query) checkSuspicious(req.query, 'query');

  next();
};

// Performance metrics
let metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0
  },
  responseTime: {
    total: 0,
    count: 0,
    average: 0
  },
  endpoints: new Map()
};

export const performanceMetrics = (req, res, next) => {
  const start = Date.now();
  
  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    // Update metrics
    metrics.requests.total++;
    if (res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.error++;
    }
    
    metrics.responseTime.total += duration;
    metrics.responseTime.count++;
    metrics.responseTime.average = metrics.responseTime.total / metrics.responseTime.count;
    
    // Track endpoint-specific metrics
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    if (!metrics.endpoints.has(endpoint)) {
      metrics.endpoints.set(endpoint, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        errors: 0
      });
    }
    
    const endpointMetrics = metrics.endpoints.get(endpoint);
    endpointMetrics.count++;
    endpointMetrics.totalTime += duration;
    endpointMetrics.avgTime = endpointMetrics.totalTime / endpointMetrics.count;
    if (res.statusCode >= 400) {
      endpointMetrics.errors++;
    }
    
    return originalEnd.apply(this, args);
  };

  next();
};

// Get current metrics
export const getMetrics = () => {
  return {
    ...metrics,
    endpoints: Object.fromEntries(metrics.endpoints)
  };
};

// Reset metrics
export const resetMetrics = () => {
  metrics = {
    requests: {
      total: 0,
      success: 0,
      error: 0
    },
    responseTime: {
      total: 0,
      count: 0,
      average: 0
    },
    endpoints: new Map()
  };
};
