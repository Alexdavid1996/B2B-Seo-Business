import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import helmet from "helmet";

// Helper to track limits per user when logged in, else per IP (IPv6-safe)
const keyByUserOrIp = (req: any) =>
  req.user?.id ? `u:${req.user.id}` : ipKeyGenerator(req);

// Rate limiting for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    error: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: "Too many registration attempts, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: "Too many password reset attempts, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting - per user/IP basis with shorter windows
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute for faster recovery
  max: 500, // 500 requests per minute per user/IP
  message: {
    error: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserOrIp,
});

// Polling-specific rate limiting for frequent endpoints
export const pollLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute per user/IP (2 per second)
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserOrIp,
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],

      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://www.google.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com",
        "https://td.doubleclick.net",
        "https://connect.facebook.net",
        ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
      ],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://www.google.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com",
        "https://td.doubleclick.net",
        "https://connect.facebook.net",
        ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
      ],

      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://www.google-analytics.com",
        "https://stats.g.doubleclick.net",
        "https://www.googletagmanager.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com",
        "https://td.doubleclick.net",
        "https://www.facebook.com",
      ],

      // ⬇️ Add google.com here (use wildcard to be future-proof)
      connectSrc: [
        "'self'",
        "ws:",
        "wss:",
        "https://www.google-analytics.com",
        "https://region1.google-analytics.com",
        "https://stats.g.doubleclick.net",
        "https://www.googletagmanager.com",
        "https://www.google.com",
        "https://google.com",
        "https://www.facebook.com",
        "https://connect.facebook.net",
        "https://*.google.com", // <— add (covers /ccm/form-data, /pagead/form-data)
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com",
        "https://td.doubleclick.net",
      ],

      frameSrc: [
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google.com",
        "https://td.doubleclick.net",
      ],

      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});
