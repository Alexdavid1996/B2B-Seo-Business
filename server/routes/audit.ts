import express from "express";
import { auditLogger } from "../middleware/audit";

export function registerAuditRoutes(app: express.Express) {
  // Admin-only route to access audit logs (secured)
  app.get("/api/admin/audit-logs", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow admin access to audit logs
      if (sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const action = req.query.action as string;
      const userId = req.query.userId as string;
      
      let logs;
      if (action) {
        logs = auditLogger.getLogsByAction(action, limit);
      } else if (userId) {
        logs = auditLogger.getLogsByUser(userId, limit);
      } else {
        logs = auditLogger.getLogs(limit, offset);
      }
      
      res.json({
        logs,
        total: logs.length,
        limit,
        offset
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
}