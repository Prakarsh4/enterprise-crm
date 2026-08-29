const rateLimitMap = new Map();

const sanitizeNoSql = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeNoSql);
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) delete value[key];
      else value[key] = sanitizeNoSql(value[key]);
    });
  }
  return value;
};

const preventNoSqlInjection = (req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.query) sanitizeNoSql(req.query);
  if (req.params) sanitizeNoSql(req.params);
  next();
};

// Lightweight in-memory rate limiter
const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

module.exports = { rateLimiter, securityHeaders, preventNoSqlInjection };
