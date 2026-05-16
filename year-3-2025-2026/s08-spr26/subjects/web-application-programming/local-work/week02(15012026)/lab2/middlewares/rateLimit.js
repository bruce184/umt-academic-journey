// Chống spam cơ bản

import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 phút
  max: 100,             // 100 requests / phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: {
        code: "RATE_LIMIT",
        message: "Too many requests",
        details: null,
        traceId: req.traceId
      }
    });
  }
});

// Có thể limit chặt hơn cho login (tránh brute-force)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: {
        code: "RATE_LIMIT_AUTH",
        message: "Too many auth attempts",
        details: null,
        traceId: req.traceId
      }
    });
  }
});
