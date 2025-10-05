import type { IStorage } from "./storage";

/**
 * Dynamic Security System for managing Anti-DDoS protection
 * This class provides real-time security state management without hardcoded values
 */
export class SecuritySystem {
  private storage: IStorage;
  private antiDdosCache: { enabled: boolean; lastCheck: number } | null = null;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Get the current Anti-DDoS protection status with caching
   * This prevents excessive database queries while maintaining real-time updates
   */
  async isAntiDdosEnabled(): Promise<boolean> {
    const now = Date.now();
    
    // Use cache if available and not expired
    if (this.antiDdosCache && (now - this.antiDdosCache.lastCheck) < this.CACHE_DURATION) {
      return this.antiDdosCache.enabled;
    }

    // Fetch from database
    try {
      const setting = await this.storage.getSetting("antiDdosEnabled");
      const enabled = setting?.value === "true";
      
      // Update cache
      this.antiDdosCache = {
        enabled,
        lastCheck: now
      };
      
      return enabled;
    } catch (error) {
      console.error("Failed to fetch Anti-DDoS setting:", error);
      // Default to enabled for security
      return true;
    }
  }

  /**
   * Force refresh the Anti-DDoS cache
   * Call this when the setting is updated through admin panel
   */
  async refreshAntiDdosCache(): Promise<boolean> {
    this.antiDdosCache = null;
    return await this.isAntiDdosEnabled();
  }

  /**
   * Check if Anti-DDoS protection should be applied to a user
   * Only applies to regular users, not admins or employees
   * If userRole is undefined (unknown user), apply protection by default for security
   */
  async shouldApplyAntiDdos(userRole?: string): Promise<boolean> {
    // Skip protection only for confirmed admin/employee roles
    if (userRole === 'admin' || userRole === 'employee') {
      return false;
    }
    
    // Apply protection for regular users AND unknown users (undefined role)
    return await this.isAntiDdosEnabled();
  }

  /**
   * Handle failed login with Anti-DDoS logic
   */
  async handleFailedLogin(ipAddress: string, email: string, userRole?: string): Promise<string | null> {
    // Only apply Anti-DDoS to regular users when enabled
    if (!(await this.shouldApplyAntiDdos(userRole))) {
      return null;
    }

    const existingAccess = await this.storage.getSecurityLoginAccess(ipAddress);
    
    if (existingAccess) {
      const newAttemptCount = existingAccess.attemptCount + 1;
      const now = new Date();
      
      // Lock IP if this is the 3rd failed attempt
      let lockedUntil = null;
      if (newAttemptCount >= 3) {
        lockedUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      }
      
      await this.storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: newAttemptCount,
        lastAttempt: now,
        lockedUntil: lockedUntil,
        lastEmail: email
      });
      
      // If this is the 3rd attempt, return lockout message (lockUntil already set above)
      if (newAttemptCount >= 3) {
        return "Too many failed attempts. You are temporarily blocked for 1 hour.";
      }
    } else {
      // Create new access record
      await this.storage.createSecurityLoginAccess({
        ipAddress: ipAddress,
        attemptCount: 1,
        lastAttempt: new Date(),
        lastEmail: email
      });
    }
    
    return null; // No lockout message
  }

  /**
   * Check if an IP is currently locked and return lockout info
   */
  async isIpLocked(ipAddress: string, userRole?: string): Promise<boolean> {
    // Skip lockout check if Anti-DDoS is disabled or user is admin/employee
    if (!(await this.shouldApplyAntiDdos(userRole))) {
      return false;
    }

    return await this.storage.isIpLocked(ipAddress);
  }

  /**
   * Get detailed lockout information for an IP address
   * Returns null if not locked, or lockout details including countdown
   */
  async getLockoutInfo(ipAddress: string, userRole?: string): Promise<{
    isLocked: boolean;
    lockedUntil?: Date;
    remainingMinutes?: number;
    remainingSeconds?: number;
    message?: string;
  } | null> {
    // Skip lockout check if Anti-DDoS is disabled or user is admin/employee
    if (!(await this.shouldApplyAntiDdos(userRole))) {
      return { isLocked: false };
    }

    const accessRecord = await this.storage.getSecurityLoginAccess(ipAddress);
    
    if (!accessRecord || !accessRecord.lockedUntil) {
      return { isLocked: false };
    }

    const now = new Date();
    const lockedUntil = new Date(accessRecord.lockedUntil);
    
    // Check if lockout has expired
    if (now >= lockedUntil) {
      // Automatically clean up expired lockout
      await this.cleanupExpiredLockout(ipAddress);
      return { isLocked: false };
    }

    // Additional check: If attemptCount is less than 3, this shouldn't be locked
    if (accessRecord.attemptCount < 3) {
      return { isLocked: false };
    }

    // Calculate remaining time
    const remainingMs = lockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    const message = `You are temporarily locked out due to too many failed login attempts. Please wait ${remainingMinutes} minutes and ${remainingSeconds} seconds before trying again.`;

    return {
      isLocked: true,
      lockedUntil,
      remainingMinutes,
      remainingSeconds,
      message
    };
  }

  /**
   * Clean up expired lockout records
   */
  async cleanupExpiredLockout(ipAddress: string): Promise<void> {
    try {
      await this.storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: 0,
        lockedUntil: null,
        lastAttempt: new Date()
      });
      console.log(`Cleaned up expired lockout for IP: ${ipAddress}`);
    } catch (error) {
      console.error(`Failed to cleanup expired lockout for IP ${ipAddress}:`, error);
    }
  }

  /**
   * Clean up all expired lockouts (can be called periodically)
   */
  async cleanupAllExpiredLockouts(): Promise<void> {
    try {
      const now = new Date();
      await this.storage.cleanupExpiredSecurityLockouts(now);
      console.log(`Cleaned up all expired lockouts before ${now.toISOString()}`);
    } catch (error) {
      console.error("Failed to cleanup expired lockouts:", error);
    }
  }

  /**
   * Reset security access for successful login
   */
  async resetSecurityAccess(ipAddress: string, email: string, userRole?: string): Promise<void> {
    // Only reset if Anti-DDoS is enabled OR user is admin/employee (they can always clear lockouts)
    const isAntiDdosEnabled = await this.isAntiDdosEnabled();
    if (isAntiDdosEnabled || userRole === 'employee' || userRole === 'admin') {
      await this.storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: 0,
        lockedUntil: null,
        lastAttempt: new Date(),
        lastEmail: email
      });
    }
  }
}

// Export singleton instance
export let securitySystem: SecuritySystem | null = null;

export function initializeSecuritySystem(storage: IStorage): SecuritySystem {
  securitySystem = new SecuritySystem(storage);
  return securitySystem;
}

export function getSecuritySystem(): SecuritySystem {
  if (!securitySystem) {
    throw new Error("Security system not initialized. Call initializeSecuritySystem first.");
  }
  return securitySystem;
}