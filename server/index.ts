import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, generalLimiter, pollLimiter } from "./middleware/security";
import { createSEOMiddleware } from "./seo-middleware";

const app = express();

// Configure trust proxy for rate limiting to work correctly
app.set('trust proxy', 1);

// Apply security headers only in production, use lighter security in development
if (process.env.NODE_ENV === 'production') {
  app.use(securityHeaders);
}

// Apply general rate limiting with relaxed limits in development
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

// Apply specific polling rate limits to frequently called endpoints
app.use('/api/messages/unread-count', pollLimiter);
app.use('/api/support/notifications/count', pollLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory (for QR codes)
app.use(express.static(path.join(process.cwd(), 'public')));

// Configure PostgreSQL session store for production persistence
const PgSession = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit pool size to prevent connection exhaustion
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout connection attempts after 5 seconds
});

// Enhanced connection pool error handling
pgPool.on('error', (err) => {
  console.error('Database pool error:', err);
});

pgPool.on('connect', () => {
  console.log('Database pool connected successfully');
});

pgPool.on('remove', () => {
  console.log('Database pool connection removed');
});

// Create session store with error handling
const sessionStore = new PgSession({
  pool: pgPool,
  tableName: 'auth_session_store',
  createTableIfMissing: true,
  ttl: 48 * 60 * 60, // Extended to 48 hours for stability
  disableTouch: false, // Enable session refresh on activity
  pruneSessionInterval: 60 * 60 * 6, // Reduced frequency: clean every 6 hours instead of 15 minutes
});

// Add error handling for session store
sessionStore.on('error', (err) => {
  console.error('Session store error:', err);
  // Don't crash the app on session store errors
});

// Configure sessions with secure settings and persistent store
app.use(session({
  secret: process.env.SESSION_SECRET || 'domain-exchange-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks via document.cookie
    maxAge: 48 * 60 * 60 * 1000, // Extended to 48 hours to match TTL
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict', // More flexible for production SPA
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN || undefined : undefined // Set domain for production
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Add SEO middleware BEFORE Vite middleware for development
    app.use(createSEOMiddleware());
    await setupVite(app, server);
  } else {
    // Add SEO middleware BEFORE static serving for production
    app.use(createSEOMiddleware());
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
