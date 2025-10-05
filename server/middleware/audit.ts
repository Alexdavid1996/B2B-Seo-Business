import { Request, Response, NextFunction } from 'express';

export interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  additionalData?: any;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  log(entry: AuditLogEntry) {
    this.logs.push({
      ...entry,
      timestamp: new Date().toISOString()
    });

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, you'd want to write to a file or database
    console.log('[AUDIT]', JSON.stringify(entry));
  }

  getLogs(limit = 100, offset = 0): AuditLogEntry[] {
    return this.logs.slice(offset, offset + limit);
  }

  getLogsByUser(userId: string, limit = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  getLogsByAction(action: string, limit = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.action === action)
      .slice(-limit);
  }
}

export const auditLogger = new AuditLogger();

// Middleware to automatically log certain actions
export const auditMiddleware = (action: string, resource?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(data) {
      logRequest(req, res, action, resource, data);
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      logRequest(req, res, action, resource, data);
      return originalJson.call(this, data);
    };

    next();
  };
};

function logRequest(req: Request, res: Response, action: string, resource?: string, responseData?: any) {
  const user = (req.session as any)?.user;
  const success = res.statusCode >= 200 && res.statusCode < 300;
  
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId: user?.id,
    action,
    resource,
    resourceId: req.params.id,
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage: !success ? responseData?.message || responseData?.error : undefined,
    additionalData: {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    }
  });
}

// Specific audit functions for critical actions
export const auditLogin = (req: Request, success: boolean, userId?: string, errorMessage?: string) => {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId,
    action: 'LOGIN_ATTEMPT',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage,
    additionalData: {
      email: req.body.email || req.body.username
    }
  });
};

export const auditRegistration = (req: Request, success: boolean, userId?: string, errorMessage?: string) => {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId,
    action: 'REGISTRATION_ATTEMPT',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage,
    additionalData: {
      email: req.body.email,
      username: req.body.username
    }
  });
};

export const auditPasswordChange = (req: Request, userId: string, success: boolean, errorMessage?: string) => {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId,
    action: 'PASSWORD_CHANGE',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage
  });
};

export const auditSiteSubmission = (req: Request, userId: string, siteId: string, success: boolean, errorMessage?: string) => {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId,
    action: 'SITE_SUBMISSION',
    resource: 'site',
    resourceId: siteId,
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage,
    additionalData: {
      domain: req.body.domain
    }
  });
};

export const auditOrderAction = (req: Request, userId: string, orderId: string, action: string, success: boolean, errorMessage?: string) => {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId,
    action: `ORDER_${action.toUpperCase()}`,
    resource: 'order',
    resourceId: orderId,
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage
  });
};

export const auditFinancialAction = (req: Request, userId: string, action: string, amount: number, success: boolean, errorMessage?: string) => {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId,
    action: `FINANCIAL_${action.toUpperCase()}`,
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorMessage,
    additionalData: {
      amount
    }
  });
};