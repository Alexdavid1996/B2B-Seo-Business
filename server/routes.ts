import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { passwordResetLimiter } from "./middleware/security";
import { auditLogin, auditRegistration, auditPasswordChange, auditSiteSubmission, auditOrderAction, auditFinancialAction, auditLogger } from "./middleware/audit";

function formatCurrency(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}
import { 
  insertUserSchema, 
  insertSiteSchema, 
  insertSiteCategorySchema,
  insertExchangeSchema, 
  insertMessageSchema, 
  insertNotificationSchema,
  insertListingSchema,
  insertOrderSchema,
  insertTransactionSchema,
  insertWalletTransactionSchema,
  insertSupportMessageSchema,
  insertSupportTicketSchema,
  insertFeeRecordSchema,
  insertRejectionReasonSchema,
  insertSmtpSystemSchema,
  insertEmailVerificationTokenSchema,
  insertRefCommissionSchema
} from "@shared/schema";
import { z } from "zod";
import { initializeSecuritySystem, getSecuritySystem } from "./security-system";
import { emailService } from "./email-service";
import { ReminderEmailService } from "./reminder-email-service";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { uploadAvatar, processAvatarImage, getAvatarUrl } from "./file-storage";
import express from 'express';

// Security validation function for input sanitization
const sanitizeInput = (input: string): string => {
  if (!input) return input;
  // Remove HTML tags and dangerous characters
  const cleaned = input.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
  // Trim and limit length
  return cleaned.trim();
};

// Generate secure verification token
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex'); // 64-character hex string
};

const sanitizeNumericInput = (input: any): number => {
  if (typeof input === 'number') return input;
  const parsed = parseInt(String(input).replace(/[^0-9]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};



export async function registerRoutes(app: Express): Promise<Server> {
  // Static files are served from index.ts - removed duplicate route
  // Initialize security system with storage
  const { storage } = await import("./storage");
  const { db } = await import("./db");
  const { refCommissions, users } = await import("@shared/schema");
  const { eq, and, desc, sql } = await import("drizzle-orm");
  initializeSecuritySystem(storage);
  
  // Initialize reminder email service with storage
  const reminderEmailService = new ReminderEmailService(storage);
  
  // Auth routes with rate limiting and audit logging
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Sanitize input data before validation
      const sanitizedBody = {
        ...req.body,
        username: sanitizeInput(req.body.username),
        email: sanitizeInput(req.body.email),
        firstName: sanitizeInput(req.body.firstName),
        lastName: sanitizeInput(req.body.lastName),
        company: req.body.company ? sanitizeInput(req.body.company) : undefined,
        bio: req.body.bio ? sanitizeInput(req.body.bio) : undefined
      };
      
      const userData = insertUserSchema.parse(sanitizedBody);
      const clientIp = req.ip || 'unknown';
      
      // Check if IP is banned
      const isIPBanned = await storage.isIPBanned(clientIp);
      if (isIPBanned) {
        auditRegistration(req, false, undefined, "Banned IP attempted registration");
        return res.status(403).json({ message: "Access denied. Your IP address has been banned." });
      }

      // Check if email is banned
      const isEmailBanned = await storage.isEmailBanned(userData.email);
      if (isEmailBanned) {
        auditRegistration(req, false, undefined, "Banned email attempted registration");
        return res.status(403).json({ message: "Access denied. This email address has been banned." });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        auditRegistration(req, false, undefined, "Email already registered");
        return res.status(400).json({ message: "This email address is already registered. Please use a different email or try signing in." });
      }

      // Check if username is taken
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        auditRegistration(req, false, undefined, "Username already taken");
        return res.status(400).json({ message: "This username is already taken. Please choose a different username." });
      }
      
      // Hash the password before storing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Check for referral code
      const referralCode = req.body.referralCode || req.headers['x-referral-code'] || req.query.ref;
      let referrerId = null;
      
      if (referralCode) {
        // Find the user by referral code (try both username and user ID)
        let referrer = await storage.getUserByUsername(referralCode);
        if (!referrer) {
          referrer = await storage.getUser(referralCode);
        }
        if (referrer) {
          referrerId = referrer.id;
          console.log(`User ${userData.username} was referred by ${referrer.username} (referral code: ${referralCode})`);
        }
      }

      // Check if email verification is required
      const requiresEmailVerification = await storage.isEmailVerificationRequired();
      console.log('Email verification required:', requiresEmailVerification);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword, // Store hashed password
        registrationIp: req.ip,
        referredBy: referrerId, // Track who referred this user
        emailVerified: !requiresEmailVerification // If verification is not required, mark as verified immediately
      });
      
      // Log successful registration
      auditRegistration(req, true, user.id);
      
      // Store signup activity for admin dashboard
      await storage.createAdminActivity({
        type: 'signup',
        data: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          ipAddress: req.ip,
          timestamp: new Date().toISOString(),
          username: user.username
        })
      });

      // Create referral commission record if user was referred
      if (referrerId) {
        try {
          await storage.createReferralRecord(user.id, referrerId, user.username);
          console.log(`Referral record created for ${user.username}`);
        } catch (error) {
          console.error("Error creating referral record:", error);
          // Don't fail registration if referral record creation fails
        }
      }

      // If email verification is not required, user goes straight to dashboard
      if (!requiresEmailVerification) {
        console.log('Email verification not required, logging user in immediately');
        // Store user in session for immediate login
        (req.session as any).user = user;
        
        const platformName = await storage.getPlatformName();
        res.json({ 
          message: `Registration successful! Welcome to ${platformName}.`,
          requiresVerification: false,
          user: user
        });
        return;
      }
      
      console.log('Email verification required, sending verification email');
      
      // If email verification is required, send verification email
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      try {
        await storage.createEmailVerificationToken({
          userId: user.id,
          email: user.email,
          token: verificationToken,
          expiresAt: expiresAt
        });

        // Check if SMTP is enabled before sending email
        const isSmtpEnabled = await storage.isSmtpEnabled();
        if (isSmtpEnabled) {
          await emailService.sendVerificationLink(user.email, verificationToken, user.firstName);
        }

        res.json({ 
          message: "A link has been sent successfully to your email for confirmation",
          requiresVerification: true,
          email: user.email,
          smtpEnabled: isSmtpEnabled
        });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Still return success but indicate email couldn't be sent
        res.json({ 
          message: "Registration successful! However, there was an issue sending the verification link. Please contact support.",
          requiresVerification: true,
          email: user.email,
          smtpEnabled: false
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = (error as Error).message;
      
      // Provide specific error messages for common issues
      let userMessage = "Registration failed. Please check your information and try again.";
      if (errorMessage.includes("duplicate key") || errorMessage.includes("already exists")) {
        if (errorMessage.includes("email")) {
          userMessage = "This email address is already registered. Please use a different email or try signing in.";
        } else if (errorMessage.includes("username")) {
          userMessage = "This username is already taken. Please choose a different username.";
        }
      }
      
      auditRegistration(req, false, undefined, "Registration failed: " + errorMessage);
      res.status(400).json({ message: userMessage });
    }
  });

  // Separate User Login (only for regular users)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIp = req.ip;
      
      // Check if IP is banned
      const isIPBanned = await storage.isIPBanned(clientIp || 'unknown');
      if (isIPBanned) {
        auditLogin(req, false, undefined, "Banned IP attempted login");
        return res.status(403).json({ message: "Access denied. Your IP address has been banned." });
      }

      // Check if email is banned
      const isEmailBanned = await storage.isEmailBanned(email);
      if (isEmailBanned) {
        auditLogin(req, false, undefined, "Banned email attempted login");
        return res.status(403).json({ message: "Access denied. This email address has been banned." });
      }
      
      // Get user first to check their role before applying Anti-DDoS
      const user = await storage.getUserByEmail(email);
      const securitySystem = getSecuritySystem();
      
      // Check if IP is locked using dynamic security system with detailed info
      const lockoutInfo = await securitySystem.getLockoutInfo(clientIp || 'unknown', user?.role);
      if (lockoutInfo && lockoutInfo.isLocked) {
        auditLogin(req, false, undefined, "IP address is temporarily locked");
        return res.status(423).json({ 
          message: lockoutInfo.message,
          lockedUntil: lockoutInfo.lockedUntil,
          remainingMinutes: lockoutInfo.remainingMinutes,
          remainingSeconds: lockoutInfo.remainingSeconds,
          isLocked: true
        });
      }
      
      // Explicitly reject admin role users on user login endpoint
      if (user && user.role === "admin") {
        auditLogin(req, false, user.id, "Admin user attempted regular login");
        await securitySystem.handleFailedLogin(clientIp || 'unknown', email, user.role);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user) {
        auditLogin(req, false, undefined, "User not found");
        await securitySystem.handleFailedLogin(clientIp || 'unknown', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      

      
      // Validate password using bcrypt
      if (!password) {
        auditLogin(req, false, user.id, "No password provided");
        await securitySystem.handleFailedLogin(clientIp || 'unknown', email, user.role);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For legacy users with unhashed passwords, handle backward compatibility
      let passwordValid = false;
      if (user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          // Password is already hashed, use bcrypt.compare
          passwordValid = await bcrypt.compare(password, user.password);
        } else {
          // Legacy plaintext password - compare directly and then hash it
          passwordValid = user.password === password;
          if (passwordValid) {
            // Update to hashed password
            const hashedPassword = await bcrypt.hash(password, 12);
            await storage.updateUser(user.id, { password: hashedPassword });
          }
        }
      } else {
        // Users without stored password - require password reset
        passwordValid = false;
      }

      if (!passwordValid) {
        auditLogin(req, false, user.id, "Invalid password");
        await securitySystem.handleFailedLogin(clientIp || 'unknown', email, user.role);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if email is verified (only if email verification is required)
      const requiresEmailVerification = await storage.isEmailVerificationRequired();
      if (requiresEmailVerification && !user.emailVerified) {
        auditLogin(req, false, user.id, "Email not verified");
        return res.status(403).json({ 
          message: "Please verify your email address before logging in. Check your email for a verification link.",
          requiresVerification: true,
          email: user.email
        });
      }
      
      // Reset security access for successful login using dynamic security system
      await securitySystem.resetSecurityAccess(clientIp || 'unknown', email, user.role);
      
      // Update user's last login IP
      await storage.updateUser(user.id, {
        lastLoginIp: req.ip,
        lastLoginAt: new Date()
      });

      // Store user in session
      (req.session as any).user = user;
      
      // Log successful login
      auditLogin(req, true, user.id);
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      auditLogin(req, false, undefined, "Login error: " + (error as Error).message);
      res.status(400).json({ message: "Login failed" });
    }
  });



  // Separate Admin Login (only for admin users) - No Anti-DDoS protection
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIp = req.ip;
      
      // Check if IP is banned (admins are not exempt from IP bans for security)
      const isIPBanned = await storage.isIPBanned(clientIp || 'unknown');
      if (isIPBanned) {
        auditLogin(req, false, undefined, "Banned IP attempted admin login");
        return res.status(403).json({ message: "Access denied. Your IP address has been banned." });
      }

      // Check if email is banned
      const isEmailBanned = await storage.isEmailBanned(email);
      if (isEmailBanned) {
        auditLogin(req, false, undefined, "Banned email attempted admin login");
        return res.status(403).json({ message: "Access denied. This email address has been banned." });
      }
      
      // Get user by provided email (no hardcoded email restriction)
      const adminUser = await storage.getUserByEmail(email);
      if (!adminUser) {
        return res.status(401).json({ message: "Admin user not found" });
      }
      
      // Verify admin role
      if (adminUser.role !== "admin") {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Validate admin password using bcrypt
      let passwordValid = false;
      if (adminUser.password) {
        if (adminUser.password.startsWith('$2a$') || adminUser.password.startsWith('$2b$')) {
          // Password is already hashed, use bcrypt.compare
          passwordValid = await bcrypt.compare(password, adminUser.password);
        } else {
          // Legacy plaintext password - compare directly and then hash it
          passwordValid = adminUser.password === password;
          if (passwordValid) {
            // Update to hashed password
            const hashedPassword = await bcrypt.hash(password, 12);
            await storage.updateUser(adminUser.id, { password: hashedPassword });
          }
        }
      } else {
        // For users with unhashed passwords, require password reset
        passwordValid = false;
      }

      if (!passwordValid) {
        auditLogin(req, false, adminUser.id, "Invalid admin password");
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // Update admin's last login IP
      await storage.updateUser(adminUser.id, {
        lastLoginIp: req.ip,
        lastLoginAt: new Date()
      });

      // Store admin user in session
      (req.session as any).user = adminUser;
      
      // Log successful admin login
      auditLogin(req, true, adminUser.id);
      
      const { password: _, ...adminWithoutPassword } = adminUser;
      res.json({ user: adminWithoutPassword });
    } catch (error) {
      auditLogin(req, false, undefined, "Admin login error: " + (error as Error).message);
      res.status(400).json({ message: "Admin login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Clear user from session first
      if (req.session) {
        delete (req.session as any).user;
      }
      
      // Then destroy session completely
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        // Clear all session-related cookies
        res.clearCookie('connect.sid', { 
          path: '/',
          httpOnly: true,
          secure: false // Set to true in production with HTTPS
        });
        
        console.log('Logout successful - session destroyed');
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Email verification endpoint using verification link (ONLY checks, doesn't consume token)
  app.get("/api/auth/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.redirect(`/auth?verified=false&error=missing_token`);
      }

      // ONLY check if token exists, don't consume it yet (let frontend handle the actual verification)
      const tokenData = await storage.getEmailVerificationToken(token);
      
      if (!tokenData) {
        return res.redirect(`/verify-email?token=${token}&error=invalid`);
      }

      // Redirect to frontend verification page that will handle the actual token consumption
      res.redirect(`/verify-email?token=${token}`);
    } catch (error) {
      console.error("Email verification error:", error);
      res.redirect(`/auth?verified=false&error=verification_failed`);
    }
  });

  // API endpoint for frontend verification check
  app.get("/api/auth/verify-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ success: false, message: "Verification token is required" });
      }

      // Verify the token
      const isValid = await storage.verifyEmailToken(token);
      if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
      }

      return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ success: false, message: "An error occurred during verification" });
    }
  });



  // Resend verification link endpoint
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Check if user has a recent token (within 10 minutes)
      const latestToken = await storage.getLatestVerificationTokenForUser(user.id);
      if (latestToken && latestToken.createdAt) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (latestToken.createdAt > tenMinutesAgo) {
          const remainingTime = Math.ceil((10 * 60 * 1000 - (Date.now() - latestToken.createdAt.getTime())) / 1000 / 60);
          return res.status(429).json({ 
            message: `Please wait ${remainingTime} more minutes before requesting a new verification link`,
            canResendAt: new Date(latestToken.createdAt.getTime() + 10 * 60 * 1000)
          });
        }
      }

      // Generate new verification token (this will automatically delete old ones)
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      await storage.createEmailVerificationToken({
        userId: user.id,
        email: user.email,
        token: verificationToken,
        expiresAt: expiresAt
      });

      // Check if SMTP is enabled before sending email
      const isSmtpEnabled = await storage.isSmtpEnabled();
      if (isSmtpEnabled) {
        await emailService.sendVerificationLink(user.email, verificationToken, user.firstName);
        res.json({ 
          message: "A new verification link has been sent to your email",
          smtpEnabled: true
        });
      } else {
        res.json({ 
          message: "Verification link generated but email service is not configured. Please contact support.",
          smtpEnabled: false
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification link" });
    }
  });

  // Password Reset endpoints
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return success even if user doesn't exist for security
        return res.json({ 
          message: "If an account with that email exists, a password reset link has been sent.",
          emailSent: true
        });
      }

      // Generate password reset token
      const resetToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      await storage.createPasswordResetToken({
        userId: user.id,
        email: user.email,
        token: resetToken,
        isUsed: false,
        expiresAt: expiresAt
      });

      // Check if SMTP is enabled before sending email
      const isSmtpEnabled = await storage.isSmtpEnabled();
      if (isSmtpEnabled) {
        await emailService.sendPasswordResetLink(user.email, resetToken, user.firstName);
      }

      res.json({ 
        message: "If an account with that email exists, a password reset link has been sent.",
        emailSent: isSmtpEnabled
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Get and validate the reset token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user password
      const updatedUser = await storage.updateUser(resetToken.userId, { 
        password: hashedPassword 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Mark token as used
      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // SMTP Configuration endpoints (admin only)
  app.get("/api/admin/smtp-config", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const config = await storage.getSmtpConfig();
      // Return config without sensitive fields (now stored in environment variables)
      res.json(config || null);
    } catch (error) {
      console.error("Error getting SMTP config:", error);
      res.status(500).json({ message: "Failed to get SMTP configuration" });
    }
  });

  app.post("/api/admin/smtp-config", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const configData = insertSmtpSystemSchema.parse(req.body);
      const config = await storage.updateSmtpConfig(configData);
      
      // Test connection if enabled
      if (config.enabled) {
        const isConnected = await emailService.testConnection();
        if (!isConnected) {
          return res.status(400).json({ 
            message: "SMTP configuration saved but connection test failed. Please check your settings." 
          });
        }
      }

      res.json({ 
        message: "SMTP configuration updated successfully",
        config: config
      });
    } catch (error) {
      console.error("Error updating SMTP config:", error);
      res.status(500).json({ message: "Failed to update SMTP configuration" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      // Add no-cache headers to prevent session caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // Debug session information
      const sessionId = req.sessionID;
      const sessionUser = (req.session as any).user;
      
      if (!sessionUser) {
        console.log(`Session check failed - ID: ${sessionId}, Session exists: ${!!req.session}, User in session: ${!!sessionUser}`);
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { password, ...userWithoutPassword } = sessionUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Auth me error:', error);
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own data or admin to fetch any user
      if (sessionUser.id !== req.params.id && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access this user data" });
      }
      
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user can only update their own profile
      if (sessionUser.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }
      
      const updates = req.body;
      console.log("Updating user profile:", req.params.id, updates);
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update session with new user data
      (req.session as any).user = user;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.put("/api/users/:id/password", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user can only update their own password
      if (sessionUser.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized to update this password" });
      }
      
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      // Get the user and verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password using bcrypt
      let passwordValid = false;
      if (user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          passwordValid = await bcrypt.compare(currentPassword, user.password);
        } else {
          passwordValid = user.password === currentPassword;
        }
      }
      
      if (!passwordValid) {
        auditPasswordChange(req, userId, false, "Invalid current password");
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash the new password before storing
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      const updatedUser = await storage.updateUser(userId, { password: hashedNewPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log successful password change
      auditPasswordChange(req, userId, true);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      // Log failed password change
      const sessionUser = (req.session as any).user;
      auditPasswordChange(req, sessionUser?.id || 'unknown', false, (error as Error).message);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Site routes
  app.get("/api/sites/user/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own sites or admin to fetch any user's sites
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these sites" });
      }
      
      const sites = await storage.getSitesByUserId(req.params.userId);
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.get("/api/sites/directory", async (req, res) => {
    try {
      const sites = await storage.getAllApprovedSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directory" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Sanitize input data before validation
      const sanitizedBody = {
        ...req.body,
        domain: sanitizeInput(req.body.domain),
        title: sanitizeInput(req.body.title),
        description: req.body.description ? sanitizeInput(req.body.description) : undefined,
        category: sanitizeInput(req.body.category),
        language: sanitizeInput(req.body.language),
        domainAuthority: sanitizeNumericInput(req.body.domainAuthority),
        drScore: sanitizeNumericInput(req.body.drScore),
        monthlyTraffic: sanitizeNumericInput(req.body.monthlyTraffic),
        price: req.body.price ? sanitizeNumericInput(req.body.price) : undefined,
        turnaroundTime: req.body.turnaroundTime ? sanitizeNumericInput(req.body.turnaroundTime) : undefined
      };
      
      const siteData = insertSiteSchema.parse(sanitizedBody);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Ensure user can only create sites for themselves
      if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to create site for this user" });
      }
      
      // Convert price to cents if provided (frontend sends dollars, backend stores cents)
      if (siteData.price !== undefined && siteData.price !== null) {
        siteData.price = siteData.price; // Keep as dollars
      }
      
      const site = await storage.createSite({ ...siteData, userId });
      
      // Log successful site submission
      auditSiteSubmission(req, userId, site.id, true);
      
      res.json(site);
    } catch (error: any) {
      console.log("Site creation error:", error.message);
      
      // Log failed site submission
      const sessionUser = (req.session as any).user;
      auditSiteSubmission(req, sessionUser?.id || 'unknown', 'unknown', false, error.message);
      
      // Check if it's a duplicate domain error
      if (error?.message && (
        error.message.includes("already added") || 
        error.message.includes("under review") ||
        error.message.includes("approved") ||
        error.message.includes("rejected")
      )) {
        return res.status(409).json({ message: error.message });
      }
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Please check your site information and try again." });
      }
      
      res.status(400).json({ message: error.message || "Invalid site data" });
    }
  });

  app.put("/api/sites/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the site to check ownership
      const existingSite = await storage.getSite(req.params.id);
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Only allow site owner or admin to update
      if (sessionUser.id !== existingSite.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to update this site" });
      }
      
      const updates = { ...req.body };
      
      // Convert price to cents if provided (frontend sends dollars, backend stores cents)
      if (updates.price !== undefined && updates.price !== null) {
        updates.price = updates.price; // Keep as dollars
      }
      
      const site = await storage.updateSite(req.params.id, updates);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site" });
    }
  });

  app.delete("/api/sites/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the site to check ownership
      const existingSite = await storage.getSite(req.params.id);
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Only allow site owner or admin to delete
      if (sessionUser.id !== existingSite.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to delete this site" });
      }
      
      const success = await storage.deleteSite(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete site" });
    }
  });

  // Admin site management routes (moved after requireAdminOrEmployee definition)
  // These endpoints are defined later in the file after requireAdminOrEmployee middleware

  // REFERRAL COMMISSION ROUTES
  app.get("/api/referrals/:userId/history/:status?/:page?/:limit?", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own referral history
      if (sessionUser.id !== req.params.userId) {
        return res.status(403).json({ message: "Unauthorized to access this referral data" });
      }
      
      const status = req.params.status || 'pending';
      const page = parseInt(req.params.page || '1');
      const limit = parseInt(req.params.limit || '5');
      
      // Validate status parameter
      if (!['pending', 'paid'].includes(status)) {
        return res.status(400).json({ message: "Invalid status parameter" });
      }
      
      const result = await storage.getRefCommissionsByUserId(req.params.userId, status, page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching referral history:", error);
      res.status(500).json({ message: "Failed to fetch referral history" });
    }
  });

  app.get("/api/referrals/:userId/stats", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own referral stats
      if (sessionUser.id !== req.params.userId) {
        return res.status(403).json({ message: "Unauthorized to access this referral data" });
      }
      
      const stats = await storage.getReferralStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Get referral link for user
  app.get("/api/referrals/:userId/link", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { userId } = req.params;
      
      // Verify user is requesting their own referral link
      if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get commission amount from settings
      const commissionAmount = await storage.getReferralCommissionAmount();
      const commissionInUSDT = commissionAmount.toFixed(2);

      // Get user's username for the referral code
      const user = await storage.getUser(userId);
      const referralCode = user ? user.username : userId;

      res.json({
        referralCode: referralCode,
        referralLink: `${req.protocol}://${req.get('host')}/register?ref=${referralCode}`,
        commissionAmount: commissionInUSDT,
        message: `Share this link to earn $${commissionInUSDT} USDT for each new user's first order`
      });
    } catch (error) {
      console.error("Error getting referral link:", error);
      res.status(500).json({ message: "Failed to get referral link" });
    }
  });

  app.post("/api/referrals/commission", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertRefCommissionSchema.parse(req.body);
      const commission = await storage.createRefCommission(validatedData);
      res.status(201).json(commission);
    } catch (error) {
      console.error("Error creating referral commission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create referral commission" });
    }
  });

  app.put("/api/referrals/commission/:id/status", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'paid'].includes(status)) {
        return res.status(400).json({ message: "Valid status required (pending or paid)" });
      }
      
      const commission = await storage.updateRefCommissionStatus(req.params.id, status);
      if (!commission) {
        return res.status(404).json({ message: "Referral commission not found" });
      }
      
      res.json(commission);
    } catch (error) {
      console.error("Error updating referral commission status:", error);
      res.status(500).json({ message: "Failed to update referral commission status" });
    }
  });

  // Site Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllSiteCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow admin access for category management
      if (sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const categoryData = insertSiteCategorySchema.parse(req.body);
      const category = await storage.createSiteCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow admin access for category management
      if (sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const updates = req.body;
      const category = await storage.updateSiteCategory(req.params.id, updates);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow admin access for category management
      if (sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const success = await storage.deleteSiteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Exchange routes
  app.get("/api/exchanges/user/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own exchanges or admin to fetch any user's exchanges
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these exchanges" });
      }
      
      const exchanges = await storage.getExchangesByUserId(req.params.userId);
      
      // Enrich exchanges with site and user data
      const enrichedExchanges = await Promise.all(
        exchanges.map(async (exchange) => {
          const requesterSite = await storage.getSite(exchange.requesterSiteId);
          const requestedSite = await storage.getSite(exchange.requestedSiteId);
          const requester = await storage.getUser(exchange.requesterId);
          const requestedUser = await storage.getUser(exchange.requestedUserId);
          
          return {
            ...exchange,
            requesterSite,
            requestedSite,
            requester: requester ? { id: requester.id, firstName: requester.firstName, lastName: requester.lastName } : null,
            requestedUser: requestedUser ? { id: requestedUser.id, firstName: requestedUser.firstName, lastName: requestedUser.lastName } : null,
          };
        })
      );
      
      res.json(enrichedExchanges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchanges" });
    }
  });

  app.post("/api/exchanges", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Sanitize input data before validation
      const sanitizedBody = {
        ...req.body,
        message: req.body.message ? sanitizeInput(req.body.message) : undefined
      };
      
      const exchangeData = insertExchangeSchema.parse(sanitizedBody);
      
      // Ensure user can only create exchanges where they are the requester
      if (sessionUser.id !== exchangeData.requesterId) {
        return res.status(403).json({ message: "Unauthorized to create exchange for another user" });
      }
      
      const exchange = await storage.createExchange(exchangeData);
      
      // Get requester information for notification
      const requester = await storage.getUser(exchangeData.requesterId);
      
      // Create notification for the requested user about pending exchange
      await storage.createNotification({
        userId: exchangeData.requestedUserId,
        type: "exchange_pending",
        title: "New Exchange Request",
        message: requester ? `You have received a new exchange request from ${requester.firstName} ${requester.lastName}` : "You have received a new exchange request",
        isRead: false,
        relatedEntityId: exchange.id,
        section: "exchange",
        subTab: "ongoing",
        priority: "high",
      });
      
      res.json(exchange);
    } catch (error) {
      res.status(400).json({ message: "Invalid exchange data" });
    }
  });

  app.put("/api/exchanges/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updates = req.body;
      const currentExchange = await storage.getExchange(req.params.id);
      if (!currentExchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Only allow participants of the exchange or admin to update it
      const isParticipant = sessionUser.id === currentExchange.requesterId || 
                           sessionUser.id === currentExchange.requestedUserId;
      if (!isParticipant && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to update this exchange" });
      }

      let updateData = { ...updates };

      // Handle delivery status update
      if (updates.status === "delivered") {
        // Prevent duplicate delivery marking
        if (currentExchange.status === "delivered" && currentExchange.deliveredBy === updates.userId) {
          return res.status(400).json({ message: "You have already marked this exchange as delivered" });
        }
        updateData.deliveredBy = updates.userId;
        updateData.deliveredAt = new Date();
      }

      // Handle completion logic - update user-specific completion flags
      if (updates.status === "completed") {
        // Prevent duplicate completion by the same user
        const isRequester = updates.userId === currentExchange.requesterId;
        if (isRequester && currentExchange.requesterCompleted) {
          return res.status(400).json({ message: "You have already marked this exchange as completed" });
        }
        if (!isRequester && currentExchange.requestedUserCompleted) {
          return res.status(400).json({ message: "You have already marked this exchange as completed" });
        }
        
        if (isRequester) {
          updateData.requesterCompleted = true;
        } else {
          updateData.requestedUserCompleted = true;
        }

        // Check if both users have completed
        const bothCompleted = (isRequester ? true : currentExchange.requesterCompleted) && 
                             (!isRequester ? true : currentExchange.requestedUserCompleted);
        
        // Only mark as completed if both parties have confirmed
        if (bothCompleted) {
          updateData.status = "completed";
        } else {
          // Keep status as active until both parties confirm
          updateData.status = "active";
        }
      }

      const exchange = await storage.updateExchange(req.params.id, updateData);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Create notifications based on status change
      if (updates.status === "active") {
        await storage.createNotification({
          userId: exchange.requesterId,
          type: "exchange_accepted",
          title: "Exchange Accepted",
          message: "Your exchange request has been accepted",
          isRead: false,
          relatedEntityId: exchange.id,
          section: "exchange",
          subTab: "ongoing",
          priority: "high",
        });
      } else if (updates.status === "delivered") {
        const otherUserId = exchange.requesterId === updates.userId ? exchange.requestedUserId : exchange.requesterId;
        await storage.createNotification({
          userId: otherUserId,
          type: "exchange_delivered",
          title: "Exchange Delivered",
          message: "Content has been delivered for your exchange",
          isRead: false,
          relatedEntityId: exchange.id,
        });
      } else if (updates.status === "completed" && exchange.status === "completed") {
        // Notify both parties when exchange is fully completed
        await storage.createNotification({
          userId: exchange.requesterId,
          type: "exchange_completed",
          title: "Exchange Completed",
          message: "Your exchange has been successfully completed",
          isRead: false,
          relatedEntityId: exchange.id,
          section: "exchange",
          subTab: "completed",
          priority: "normal",
        });
        await storage.createNotification({
          userId: exchange.requestedUserId,
          type: "exchange_completed",
          title: "Exchange Completed", 
          message: "Your exchange has been successfully completed",
          isRead: false,
          relatedEntityId: exchange.id,
          section: "exchange",
          subTab: "completed",
          priority: "normal",
        });
      } else if (updates.status === "cancelled" || updates.status === "declined") {
        const isRequester = updates.userId === currentExchange.requesterId;
        const otherUserId = exchange.requesterId === updates.userId ? exchange.requestedUserId : exchange.requesterId;
        const isRejection = updates.status === "cancelled" && !isRequester; // When requested user rejects
        
        await storage.createNotification({
          userId: otherUserId,
          type: isRejection ? "exchange_rejected" : "exchange_cancelled",
          title: isRejection ? "Exchange Rejected" : "Exchange Cancelled", 
          message: isRejection ? "Your exchange request has been rejected" : "An exchange has been cancelled",
          isRead: false,
          relatedEntityId: exchange.id,
        });
      }
      
      res.json(exchange);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exchange" });
    }
  });

  // Message routes
  app.get("/api/messages/exchange/:exchangeId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Verify user is participant in the exchange
      const exchange = await storage.getExchange(req.params.exchangeId);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      const isParticipant = sessionUser.id === exchange.requesterId || 
                           sessionUser.id === exchange.requestedUserId;
      if (!isParticipant && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these messages" });
      }
      
      const messages = await storage.getMessagesByExchangeId(req.params.exchangeId);
      
      // Enrich messages with sender data
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          return {
            ...message,
            sender: sender ? { id: sender.id, firstName: sender.firstName, lastName: sender.lastName } : null,
          };
        })
      );
      
      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/order/:orderId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Verify user is participant in the order
      const order = await storage.getOrderById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const isParticipant = sessionUser.id === order.buyerId || 
                           sessionUser.id === order.sellerId;
      if (!isParticipant && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these messages" });
      }
      
      const messages = await storage.getMessagesByOrderId(req.params.orderId);
      
      // Enrich messages with sender data
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          return {
            ...message,
            sender: sender ? { id: sender.id, firstName: sender.firstName, lastName: sender.lastName } : null,
          };
        })
      );
      
      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get unread message count for current user
  app.get("/api/messages/unread-count", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const count = await storage.getUnreadMessageCount(sessionUser.id);
      res.json({ count });
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });

  // Mark messages as read when user opens a chat
  app.post("/api/messages/mark-read", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { exchangeId, orderId } = req.body;
      
      // Verify user is participant before marking as read
      if (exchangeId) {
        const exchange = await storage.getExchange(exchangeId);
        if (!exchange) {
          return res.status(404).json({ message: "Exchange not found" });
        }
        
        const isParticipant = sessionUser.id === exchange.requesterId || 
                             sessionUser.id === exchange.requestedUserId;
        if (!isParticipant && sessionUser.role !== 'admin') {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (orderId) {
        const order = await storage.getOrderById(orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        const isParticipant = sessionUser.id === order.buyerId || 
                             sessionUser.id === order.sellerId;
        if (!isParticipant && sessionUser.role !== 'admin') {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }
      
      await storage.markMessagesAsRead(sessionUser.id, exchangeId, orderId);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Mark orders section as viewed (for sidebar notification clearing)
  app.post("/api/orders/mark-section-viewed", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // For now, we'll just return success to trigger cache invalidation
      // This can be expanded later to track "viewed" timestamps
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking orders section as viewed:", error);
      res.status(500).json({ message: "Failed to mark section as viewed" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Sanitize input data before validation
      const sanitizedBody = {
        ...req.body,
        content: sanitizeInput(req.body.content)
      };
      
      const messageData = insertMessageSchema.parse(sanitizedBody);
      
      // Ensure user can only send messages as themselves
      if (sessionUser.id !== messageData.senderId) {
        return res.status(403).json({ message: "Unauthorized to send message as another user" });
      }
      
      // Verify user is participant in the exchange or order
      if (messageData.exchangeId) {
        const exchange = await storage.getExchange(messageData.exchangeId);
        if (!exchange) {
          return res.status(404).json({ message: "Exchange not found" });
        }
        
        const isParticipant = sessionUser.id === exchange.requesterId || 
                             sessionUser.id === exchange.requestedUserId;
        if (!isParticipant && sessionUser.role !== 'admin') {
          return res.status(403).json({ message: "Unauthorized to send message in this exchange" });
        }
      } else if (messageData.orderId) {
        const order = await storage.getOrderById(messageData.orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        const isParticipant = sessionUser.id === order.buyerId || 
                             sessionUser.id === order.sellerId;
        if (!isParticipant && sessionUser.role !== 'admin') {
          return res.status(403).json({ message: "Unauthorized to send message in this order" });
        }
      }
      
      const message = await storage.createMessage(messageData);
      
      let otherUserId = null;
      let notificationMessage = "You have a new message";
      
      // Get exchange or order to find the other participant
      if (messageData.exchangeId) {
        const exchange = await storage.getExchange(messageData.exchangeId);
        if (exchange) {
          otherUserId = exchange.requesterId === messageData.senderId ? exchange.requestedUserId : exchange.requesterId;
          notificationMessage = "You have a new message in your exchange";
        }
      } else if (messageData.orderId) {
        const order = await storage.getOrderById(messageData.orderId);
        if (order) {
          otherUserId = order.buyerId === messageData.senderId ? order.sellerId : order.buyerId;
          notificationMessage = "You have a new message in your order";
        }
      }
      
      if (otherUserId) {
        // Determine section based on whether it's exchange or order
        const section = messageData.exchangeId ? "exchange" : "guest_post";
        
        // Create notification for the other user
        await storage.createNotification({
          userId: otherUserId,
          type: "message",
          title: "New Message",
          message: notificationMessage,
          isRead: false,
          relatedEntityId: message.id,
          section: section,
          subTab: "ongoing", // Messages always relate to ongoing conversations
          priority: "normal",
        });
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Notification routes
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own notifications or admin to fetch any user's notifications
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these notifications" });
      }
      
      const notifications = await storage.getNotificationsByUserId(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      // Only allow users to mark their own notifications as read or admin to mark any user's notifications
      if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to mark these notifications as read" });
      }
      
      console.log("Marking all notifications as read for user:", userId);
      await storage.markAllNotificationsAsRead(userId);
      console.log("Successfully marked all notifications as read for user:", userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read", error: (error as Error).message });
    }
  });

  app.put("/api/notifications/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the notification to check ownership
      const existingNotification = await storage.getNotification(req.params.id);
      if (!existingNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only allow notification owner or admin to update
      if (sessionUser.id !== existingNotification.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to update this notification" });
      }
      
      const updates = req.body;
      const notification = await storage.updateNotification(req.params.id, updates);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the notification to check ownership
      const existingNotification = await storage.getNotification(req.params.id);
      if (!existingNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only allow notification owner or admin to mark as read
      if (sessionUser.id !== existingNotification.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to mark this notification as read" });
      }
      
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });



  // Admin middleware to check if user is admin
  const requireAdmin = (req: any, res: any, next: any) => {
    console.log('requireAdmin check:', {
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      userRole: req.session?.user?.role,
      userId: req.session?.user?.id
    });
    
    if (!req.session?.user?.role || req.session.user.role !== 'admin') {
      console.log('Admin access denied for session:', req.session?.user);
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Admin or Employee middleware
  const requireAdminOrEmployee = (req: any, res: any, next: any) => {
    console.log('requireAdminOrEmployee check:', {
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      userRole: req.session?.user?.role,
      userId: req.session?.user?.id
    });
    
    if (!req.session?.user?.role || (req.session.user.role !== 'admin' && req.session.user.role !== 'employee')) {
      console.log('Admin or Employee access denied for session:', req.session?.user);
      return res.status(403).json({ error: 'Admin or employee access required' });
    }
    next();
  };

  // Admin Routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });


  // Admin recent activity endpoint
  app.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getRecentAdminActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin recent activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { search } = req.query;
      const users = await storage.getAllUsers();
      
      // Filter users by search term if provided
      let filteredUsers = users;
      if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase();
        filteredUsers = users.filter(user => 
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          (user.company && user.company.toLowerCase().includes(searchTerm))
        );
      }
      
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create employee account endpoint
  app.post("/api/admin/users/create-employee", requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const newEmployee = await storage.createUser({
        username: email.split('@')[0] + '_employee',
        email,
        password,
        firstName,
        lastName,
        role: 'employee',
        status: 'active'
      });

      const { password: _, ...employeeWithoutPassword } = newEmployee;
      res.json(employeeWithoutPassword);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee account" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, amount } = req.body;
      const success = await storage.updateUserBalance(id, action, amount);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, { status: 'banned' });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/sites", requireAdminOrEmployee, async (req, res) => {
    try {
      const sites = await storage.getAllSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  // Employee endpoint for guest post sites only
  app.get("/api/admin/sites/guest-posts", requireAdminOrEmployee, async (req, res) => {
    try {
      const sites = await storage.getAllSites();
      // Filter only guest post sites (purpose includes "sales")
      const guestPostSites = sites.filter(site => site.purpose === 'sales');
      res.json(guestPostSites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guest post sites" });
    }
  });

  app.patch("/api/admin/sites/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const site = await storage.updateSite(id, updates);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to update site" });
    }
  });

  // Site approval/rejection endpoints for employees
  app.post("/api/admin/sites/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const employeeUsername = (req.session as any)?.user?.username;
      const site = await storage.approveSite(id, employeeUsername);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve site" });
    }
  });

  app.post("/api/admin/sites/:id/reject", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const employeeUsername = (req.session as any)?.user?.username;
      const site = await storage.rejectSite(id, rejectionReason || "Rejected by staff review", employeeUsername);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject site" });
    }
  });

  // Admin reminder email endpoints
  app.post("/api/admin/reminders/guest-post/:orderId", requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const adminId = (req.session as any)?.user?.id;
      
      // Get order details with buyer and seller information
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Check if reminder already sent for this order with current status
      const reminderExists = await storage.checkEmailReminderExists('guest_post', order.status, orderId);
      if (reminderExists) {
        return res.status(400).json({ error: `Reminder already sent for this order in ${order.status} status` });
      }
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get buyer and seller user details
      const buyer = await storage.getUserById(order.buyerId);
      const seller = await storage.getUserById(order.sellerId);
      const site = await storage.getSiteById(order.siteId);

      if (!buyer || !seller || !site) {
        return res.status(404).json({ error: "Required data not found" });
      }

      // Prepare order data for email template
      const orderData = {
        orderId: order.displayId || order.id.slice(0, 8),
        buyerName: `${buyer.firstName} ${buyer.lastName}`,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        siteDomain: site.domain,
        createdDate: new Date(order.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        orderLink: `${process.env.BASE_URL || 'http://localhost:5000'}/dashboard?tab=orders&orderId=${order.id}`
      };

      // Send reminder emails to both parties
      const result = await reminderEmailService.sendGuestPostReminder(
        buyer.email,
        seller.email,
        orderData
      );

      // Create reminder record in database
      await storage.createEmailReminder({
        type: 'guest_post',
        orderId: orderId,
        status: order.status,
        sentBy: adminId,
        recipientEmails: JSON.stringify([buyer.email, seller.email]),
        emailResults: JSON.stringify(result)
      });

      res.json({ 
        success: true, 
        message: "Reminder emails sent successfully",
        emailResults: result 
      });

    } catch (error) {
      console.error("Error sending guest post reminder:", error);
      res.status(500).json({ error: "Failed to send reminder email" });
    }
  });

  app.post("/api/admin/reminders/exchange/:exchangeId", requireAdmin, async (req, res) => {
    try {
      const { exchangeId } = req.params;
      const adminId = (req.session as any)?.user?.id;
      
      // Get exchange details with requester and requested user information
      const exchange = await storage.getExchangeById(exchangeId);
      if (!exchange) {
        return res.status(404).json({ error: "Exchange not found" });
      }
      
      // Check if reminder already sent for this exchange with current status
      const reminderExists = await storage.checkEmailReminderExists('exchange', exchange.status, undefined, exchangeId);
      if (reminderExists) {
        return res.status(400).json({ error: `Reminder already sent for this exchange in ${exchange.status} status` });
      }

      // Get user details
      const requester = await storage.getUserById(exchange.requesterId);
      const requested = await storage.getUserById(exchange.requestedUserId);
      const requesterSite = await storage.getSiteById(exchange.requesterSiteId);
      const requestedSite = await storage.getSiteById(exchange.requestedSiteId);

      if (!requester || !requested || !requesterSite || !requestedSite) {
        return res.status(404).json({ error: "Required data not found" });
      }

      // Prepare exchange data for email template
      const exchangeData = {
        exchangeId: exchange.displayId || exchange.id.slice(0, 8),
        requesterName: `${requester.firstName} ${requester.lastName}`,
        partnerName: `${requested.firstName} ${requested.lastName}`,
        siteA: requesterSite.domain,
        siteB: requestedSite.domain,
        status: exchange.status as 'pending' | 'active',
        createdDate: new Date(exchange.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        exchangeLink: `${process.env.BASE_URL || 'http://localhost:5000'}/dashboard?tab=orders&subtab=exchanges&exchangeId=${exchange.id}`
      };

      // Send reminder emails to both parties
      const result = await reminderEmailService.sendExchangeReminder(
        requester.email,
        requested.email,
        exchangeData
      );

      // Create reminder record in database
      await storage.createEmailReminder({
        type: 'exchange',
        exchangeId: exchangeId,
        status: exchange.status,
        sentBy: adminId,
        recipientEmails: JSON.stringify([requester.email, requested.email]),
        emailResults: JSON.stringify(result)
      });

      res.json({ 
        success: true, 
        message: "Reminder emails sent successfully",
        emailResults: result 
      });

    } catch (error) {
      console.error("Error sending exchange reminder:", error);
      res.status(500).json({ error: "Failed to send reminder email" });
    }
  });

  app.get("/api/admin/exchanges", requireAdmin, async (req, res) => {
    try {
      const exchanges = await storage.getAllExchanges();
      res.json(exchanges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exchanges" });
    }
  });

  app.get("/api/admin/exchanges/pending", requireAdminOrEmployee, async (req, res) => {
    try {
      const pendingExchanges = await storage.getPendingExchanges();
      res.json(pendingExchanges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending exchanges" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/pending", requireAdminOrEmployee, async (req, res) => {
    try {
      const pendingOrders = await storage.getPendingOrders();
      res.json(pendingOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending orders" });
    }
  });

  // Pending activities endpoint - only truly pending/ongoing items
  app.get("/api/admin/pending-activities", requireAdmin, async (req, res) => {
    try {
      const pendingActivities = await storage.getAllPendingActivities();
      res.json(pendingActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending activities" });
    }
  });

  // New delivered activities endpoint
  app.get("/api/admin/delivered-activities", requireAdmin, async (req, res) => {
    try {
      const deliveredActivities = await storage.getDeliveredActivities();
      res.json(deliveredActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivered activities" });
    }
  });

  // New rejected activities endpoint
  app.get("/api/admin/rejected-activities", requireAdmin, async (req, res) => {
    try {
      const rejectedActivities = await storage.getRejectedActivities();
      res.json(rejectedActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rejected activities" });
    }
  });

  // Delete order with refund
  app.delete("/api/admin/orders/:id/delete", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const result = await storage.deleteOrderWithRefund(orderId);
      
      if (!result.success) {
        return res.status(404).json({ error: result.message || "Order not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Order deleted and buyer refunded successfully",
        refundAmount: result.refundAmount 
      });
    } catch (error) {
      console.error("Delete order error:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Delete exchange
  app.delete("/api/admin/exchanges/:id/delete", requireAdmin, async (req, res) => {
    try {
      const exchangeId = req.params.id;
      const result = await storage.deleteExchange(exchangeId);
      
      if (!result) {
        return res.status(404).json({ error: "Exchange not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Exchange deleted successfully" 
      });
    } catch (error) {
      console.error("Delete exchange error:", error);
      res.status(500).json({ error: "Failed to delete exchange" });
    }
  });

  // Admin-specific deletion for pending activities with reminder cleanup
  app.delete("/api/admin/pending-activities/orders/:id/delete", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const result = await storage.adminDeletePendingOrder(orderId);
      
      if (!result.success) {
        return res.status(404).json({ error: result.message || "Order not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Order deleted and buyer refunded successfully",
        refundAmount: result.refundAmount 
      });
    } catch (error) {
      console.error("Delete pending order error:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  app.delete("/api/admin/pending-activities/exchanges/:id/delete", requireAdmin, async (req, res) => {
    try {
      const exchangeId = req.params.id;
      const result = await storage.adminDeletePendingExchange(exchangeId);
      
      if (!result) {
        return res.status(404).json({ error: "Exchange not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Exchange deleted successfully" 
      });
    } catch (error) {
      console.error("Delete pending exchange error:", error);
      res.status(500).json({ error: "Failed to delete exchange" });
    }
  });

  app.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      const activity = [];
      
      // Get recent successful registrations from audit logs
      const registrationLogs = auditLogger.getLogsByAction("REGISTRATION_ATTEMPT", 50)
        .filter(log => log.success)
        .slice(0, 5); // Get latest 5 registrations
        
      // Add registration activities
      registrationLogs.forEach(log => {
        activity.push({
          id: `registration-${log.userId}`,
          type: "user_registration",
          description: `New user ${log.additionalData?.username} (${log.additionalData?.email}) registered`,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress,
          createdAt: log.timestamp
        });
      });
      
      // Get recent site submissions
      const siteSubmissionLogs = auditLogger.getLogsByAction("SITE_SUBMISSION", 50)
        .filter(log => log.success)
        .slice(0, 5); // Get latest 5 site submissions
        
      // Add site submission activities  
      siteSubmissionLogs.forEach(log => {
        activity.push({
          id: `site-${log.resourceId}`,
          type: "site_submission", 
          description: `Site ${log.additionalData?.domain} submitted for approval`,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress,
          createdAt: log.timestamp
        });
      });
      
      // Sort by timestamp (most recent first) and limit to 10 items
      const sortedActivity = (activity as any[])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
        
      res.json(sortedActivity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/admin/support-chats", requireAdmin, async (req, res) => {
    try {
      const chats: any[] = [];
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support chats" });
    }
  });

  app.get("/api/admin/support-messages/:userId", requireAdmin, async (req, res) => {
    try {
      const messages: any[] = [];
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support messages" });
    }
  });

  app.post("/api/admin/support-messages", requireAdmin, async (req, res) => {
    try {
      const { userId, message } = req.body;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });



  // User dashboard stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own stats or admin to fetch any user's stats
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these stats" });
      }
      
      const userId = req.params.userId;
      
      // Get user's sites - only count approved sites for total
      const userSites = await storage.getSitesByUserId(userId);
      const approvedSites = userSites.filter(site => site.status === "approved");
      const totalSites = approvedSites.length;
      const pendingSites = userSites.filter(site => site.status === "pending").length;
      
      // Get user's exchanges
      const userExchanges = await storage.getExchangesByUserId(userId);
      
      // Calculate completed exchanges (both parties marked as completed)
      const completedExchanges = userExchanges.filter(exchange => 
        exchange.status === "completed" && 
        exchange.requesterCompleted === true && 
        exchange.requestedUserCompleted === true
      ).length;

      // Get user's sales (completed orders where they are the seller)
      const userOrders = await storage.getOrdersByUserId(userId);
      const completedSales = userOrders.filter(order => 
        order.sellerId === userId && order.status === "completed"
      );
      const totalSales = completedSales.reduce((sum, order) => sum + (order.sellerAmount || 0), 0);
      
      res.json({
        totalSites,
        completedExchanges,
        pendingApproval: pendingSites,
        totalSales
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Payment Gateway routes
  app.get("/api/payment-gateways", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const gateways = await storage.getActivePaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ message: "Failed to fetch payment gateways" });
    }
  });

  app.get("/api/payment-gateways/:id", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const gateway = await storage.getPaymentGateway(req.params.id);
      if (!gateway) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ message: "Failed to fetch payment gateway" });
    }
  });

  // Wallet routes
  app.get("/api/wallet", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const wallet = await storage.getWallet(user.id);
      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await storage.createWallet(user.id);
        return res.json({
          ...newWallet,
          usdtBalance: newWallet.balance, // Already in dollars
          balance: newWallet.balance
        });
      }
      
      res.json({
        ...wallet,
        usdtBalance: wallet.balance, // Already in dollars
        balance: wallet.balance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get("/api/wallets/user/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own wallet or admin to fetch any user's wallet
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access this wallet" });
      }
      
      const wallet = await storage.getWallet(req.params.userId);
      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await storage.createWallet(req.params.userId);
        return res.json(newWallet);
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.post("/api/wallet/:userId/add-funds", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow admin to manually add funds to wallets
      if (sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Sanitize input data
      const sanitizedBody = {
        ...req.body,
        description: req.body.description ? sanitizeInput(req.body.description) : undefined
      };
      
      const { amount, description } = sanitizedBody;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const success = await storage.addFunds(req.params.userId, amount, description || "Funds added");
      if (!success) {
        return res.status(400).json({ message: "Failed to add funds" });
      }

      const wallet = await storage.getWallet(req.params.userId);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  // Top-up with fee
  app.post("/api/wallet/topup", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { amount, currency, method, fee, txId } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Validate and sanitize TxID for crypto deposits
      if (method === "crypto") {
        if (!txId || !txId.trim()) {
          return res.status(400).json({ message: "Transaction ID (TxID) is required for crypto deposits" });
        }
        
        // Security: Sanitize TxID - only allow alphanumeric characters, min 10, max 128 chars
        const sanitizedTxId = txId.trim().replace(/[^A-Za-z0-9]/g, '');
        if (sanitizedTxId.length < 10 || sanitizedTxId.length > 128) {
          return res.status(400).json({ message: "Invalid Transaction ID format. Must be 10-128 alphanumeric characters." });
        }
        req.body.txId = sanitizedTxId; // Replace with sanitized version
      }

      // Find the payment gateway for this method  
      const gateways = await storage.getActivePaymentGateways();
      const gateway = gateways.find(g => g.name === "crypto" || g.name === method);
      
      if (!gateway) {
        console.log("Available gateways:", gateways.map(g => g.name));
        console.log("Requested method:", method);
        return res.status(400).json({ message: "Invalid payment method" });
      }

      // Get both minimum and maximum from payment gateway configuration
      const minAmount = gateway.minDepositAmount;
      const maxAmount = gateway.maxDepositAmount;

      if (amount < minAmount) {
        return res.status(400).json({ message: `Minimum deposit amount is $${minAmount.toFixed(2)}` });
      }

      if (amount > maxAmount) {
        return res.status(400).json({ message: `Maximum deposit amount is $${maxAmount.toFixed(2)}` });
      }

      // For top-ups, no balance validation is needed - funds are being added, not removed
      // Only check that wallet exists
      const wallet = await storage.getWallet(user.id);
      if (!wallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }

      // For top-ups, no balance deduction needed - request goes to admin for approval
      // Top-ups add funds, so no pre-deduction is required

      // Create wallet transaction with processing status (requires admin approval)
      const walletTransaction = await storage.createWalletTransaction({
        userId: user.id,
        type: "top_up",
        amount: amount, // Store dollars directly
        fee: fee || 0, // Store fee in dollars directly
        gatewayId: gateway.id,
        paymentMethod: `${formatCurrency(amount)} via ${gateway.displayName}`,
        txId: txId ? txId.trim() : null, // Store user's transaction ID
        status: "processing"
      });

      // Also store TxID in the separate cryptoTxIds table if provided
      if (txId) {
        await storage.createCryptoTxId({
          txId: txId.trim(),
          username: user.username,
          userId: user.id,
          walletTransactionId: walletTransaction.id,
        });
      }

      res.json({ 
        message: "Top-up submitted for processing", 
        transactionId: walletTransaction.transactionId,
        status: "processing"
      });
    } catch (error) {
      console.error("Top-up error:", error);
      res.status(500).json({ message: "Failed to process top-up" });
    }
  });

  // Withdrawal with fee
  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Sanitize input data before validation
      const sanitizedBody = {
        ...req.body,
        walletAddress: req.body.walletAddress ? req.body.walletAddress.replace(/[^A-Za-z0-9]/g, '').slice(0, 45) : undefined,
        network: req.body.network ? req.body.network.replace(/[^A-Za-z0-9]/g, '').slice(0, 20) : undefined
      };
      
      const { amount, currency, method, walletAddress, network, fee } = sanitizedBody;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Enhanced validation for wallet address and network
      if (!walletAddress || walletAddress.length < 10 || walletAddress.length > 45) {
        return res.status(400).json({ message: "Invalid wallet address. Must be 10-45 alphanumeric characters." });
      }
      
      if (!network || !["TRC20"].includes(network)) {
        return res.status(400).json({ message: "Invalid network. Only TRC20 is supported." });
      }

      // Find the payment gateway for this method
      const gateways = await storage.getActivePaymentGateways();
      const gateway = gateways.find(g => g.name === "crypto" || g.name === method);
      
      if (!gateway) {
        console.log("Available gateways:", gateways.map(g => g.name));
        console.log("Requested method:", method);
        return res.status(400).json({ message: "Invalid payment method" });
      }

      // Get both minimum and maximum from payment gateway configuration
      const minAmount = gateway.minWithdrawalAmount;
      const maxAmount = gateway.maxWithdrawalAmount;

      if (amount < minAmount) {
        return res.status(400).json({ message: `Minimum withdrawal amount is $${minAmount.toFixed(2)}` });
      }

      if (amount > maxAmount) {
        return res.status(400).json({ message: `Maximum withdrawal amount is $${maxAmount.toFixed(2)}` });
      }

      const wallet = await storage.getWallet(user.id);
      const totalAmount = amount + (fee || 0);
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // SECURITY FIX: Immediately deduct the full amount (amount + fee) from user's balance
      // This prevents multiple submissions and ensures the user can't withdraw more than they have
      const deductionSuccess = await storage.deductFunds(
        user.id,
        totalAmount,
        `Withdrawal submitted for processing: $${formatCurrency(amount)} (Fee: $${formatCurrency(fee || 0)})`
      );

      if (!deductionSuccess) {
        return res.status(500).json({ message: "Failed to process withdrawal - unable to deduct funds" });
      }

      // Create wallet transaction with processing status (requires admin approval)
      // Note: Balance already deducted above - this is just for admin tracking
      const walletTransaction = await storage.createWalletTransaction({
        userId: user.id,
        type: "withdrawal",
        amount: amount,
        fee: fee || 0,
        gatewayId: gateway.id,
        withdrawalMethod: `${formatCurrency(amount)} via ${gateway.displayName} to ${walletAddress} (${network})`,
        status: "processing"
      });

      res.json({ 
        message: "Withdrawal submitted for processing", 
        transactionId: walletTransaction.transactionId,
        status: "processing"
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const listings = await storage.getAllListings();
      
      // Enrich listings with site data
      const enrichedListings = await Promise.all(
        listings.map(async (listing) => {
          const site = await storage.getSite(listing.siteId);
          return { ...listing, site };
        })
      );
      
      res.json(enrichedListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Marketplace listings - combines both listings and sites with sales purpose
  app.get("/api/listings/marketplace", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const currentUserId = user?.id;

      // Get platform fee settings
      const platformFeeSetting = await storage.getSetting('platformFee');
      const platformFeeTypeSetting = await storage.getSetting('platformFeeType');
      const platformFeeAmount = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 5; // Default 5
      const platformFeeType = platformFeeTypeSetting?.value || 'percentage'; // Default percentage

      const [listings, salesSites, allOrders] = await Promise.all([
        storage.getAllListings(),
        storage.getAllApprovedSites(),
        storage.getAllOrders()
      ]);

      // Enrich listings with site data and filter out current user's listings only
      const enrichedListings = await Promise.all(
        listings
          .filter(listing => listing.userId !== currentUserId)
          .map(async (listing) => {
            const site = await storage.getSite(listing.siteId);
            return { 
              ...listing, 
              site,
              type: listing.type || 'link_placement' // Default to link_placement for sales sites
            };
          })
      );

      // Get sites that already have regular listings to prevent duplication
      const sitesWithRegularListings = new Set(listings.map(listing => listing.siteId));

      // Convert sales sites to listing format, but exclude sites that already have regular listings
      // and filter out current user's sites
      const salesListings = salesSites
        .filter(site => 
          site.purpose === 'sales' && 
          site.price && 
          site.deliveryTime && 
          site.userId !== currentUserId &&
          !sitesWithRegularListings.has(site.id) // Prevent duplication - don't create site-listing if regular listing exists
        )
        .map(site => ({
          id: `site-listing-${site.id}`,
          userId: site.userId,
          siteId: site.id,
          type: 'link_placement',
          price: site.price,
          serviceFee: platformFeeType === 'percentage' 
            ? (site.price || 0) * (platformFeeAmount / 100) // Percentage of seller's price
            : platformFeeAmount, // Fixed amount in dollars
          isActive: true,
          requirements: site.description || "Contact seller for requirements",
          turnaround_time: site.deliveryTime,
          createdAt: site.createdAt,
          updatedAt: site.updatedAt,
          site: site
        }));

      // Combine and return all marketplace listings
      const allMarketplaceListings = [...enrichedListings, ...salesListings];
      res.json(allMarketplaceListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketplace listings" });
    }
  });

  app.get("/api/listings/user/:userId", async (req, res) => {
    try {
      const listings = await storage.getListingsByUserId(req.params.userId);
      
      // Enrich listings with site data
      const enrichedListings = await Promise.all(
        listings.map(async (listing) => {
          const site = await storage.getSite(listing.siteId);
          return { ...listing, site };
        })
      );
      
      res.json(enrichedListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      // Sanitize input data before validation
      const sanitizedBody = {
        ...req.body,
        requirements: req.body.requirements ? sanitizeInput(req.body.requirements) : undefined
      };
      
      const listingData = insertListingSchema.parse(sanitizedBody);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get platform fee from settings
      const platformFeeSetting = await storage.getSetting('platformFee');
      const platformFeeTypeSetting = await storage.getSetting('platformFeeType');
      const platformFeeAmount = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 5; // Default 5
      const platformFeeType = platformFeeTypeSetting?.value || 'percentage'; // Default percentage
      
      // Calculate service fee based on type and amount
      // For percentage: fee calculated so seller gets their full listed price
      // For fixed: add fixed amount on top of seller price
      const serviceFee = platformFeeType === 'percentage' 
        ? listingData.price * (platformFeeAmount / (100 - platformFeeAmount))
        : platformFeeAmount; // Fixed amount in dollars
      
      const listing = await storage.createListing({ ...listingData, userId, serviceFee });
      res.json(listing);
    } catch (error) {
      res.status(400).json({ message: "Invalid listing data" });
    }
  });

  // Order routes
  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own orders or admin to fetch any user's orders
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these orders" });
      }
      
      const { type } = req.query;
      const orders = await storage.getOrdersByUserId(req.params.userId, type as 'buyer' | 'seller');
      
      // Enrich orders with listing and site data
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const listing = await storage.getListingById(order.listingId);
          const buyer = await storage.getUser(order.buyerId);
          const seller = await storage.getUser(order.sellerId);
          
          // Get site data for the listing
          let site = null;
          if (listing && listing.siteId) {
            site = await storage.getSite(listing.siteId);
          }
          
          return {
            ...order,
            listing: listing ? { ...listing, site } : null,
            buyer: buyer ? { id: buyer.id, firstName: buyer.firstName, lastName: buyer.lastName } : null,
            seller: seller ? { id: seller.id, firstName: seller.firstName, lastName: seller.lastName } : null,
          };
        })
      );
      
      res.json(enrichedOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Sanitize input data before processing
      const sanitizedData = {
        listingId: sanitizeInput(req.body.listingId),
        googleDocLink: req.body.googleDocLink ? sanitizeInput(req.body.googleDocLink) : undefined,
        targetLink: req.body.targetLink ? sanitizeInput(req.body.targetLink) : undefined,
        requirements: req.body.requirements ? sanitizeInput(req.body.requirements) : undefined
      };
      
      const { listingId, googleDocLink, targetLink, requirements } = sanitizedData;
      
      // Handle both regular listings and site-based listings
      let listing;
      let listingSite;
      
      if (listingId.startsWith('site-listing-')) {
        // This is a site-based listing
        const siteId = listingId.replace('site-listing-', '');
        listingSite = await storage.getSite(siteId);
        
        if (!listingSite || listingSite.purpose !== 'sales') {
          return res.status(400).json({ message: "Site listing not found" });
        }
        
        // Create a virtual listing object for site-based listings
        listing = {
          id: listingId,
          userId: listingSite.userId,
          siteId: listingSite.id,
          type: 'link_placement',
          price: listingSite.price || 0,
          site: listingSite
        };
      } else {
        // This is a regular listing
        listing = await storage.getListingById(listingId);
        
        if (!listing) {
          return res.status(400).json({ message: "Listing not found" });
        }
        
        // Get site information for regular listings
        listingSite = await storage.getSite(listing.siteId);
      }

      // Get seller information
      const seller = await storage.getUser(listing.userId);
      if (!seller) {
        return res.status(400).json({ message: "Seller not found" });
      }

      // Check if buyer has sufficient funds
      const buyerWallet = await storage.getWallet(user.id);
      
      if (!buyerWallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }

      // Get platform fee from settings  
      const platformFeeSetting = await storage.getSetting('platformFee');
      const platformFeeTypeSetting = await storage.getSetting('platformFeeType');
      const platformFeeAmount = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 5; // Default 5
      const platformFeeType = platformFeeTypeSetting?.value || 'percentage'; // Default percentage
      
      // Calculate service fee based on current platform settings 
      // NEW APPROACH: Buyer pays exactly what seller listed (no additional fees to buyer)
      // Platform fee is deducted from seller's earnings
      const listingPrice = listing.price || 0;
      const serviceFee = platformFeeType === 'percentage' 
        ? listingPrice * (platformFeeAmount / 100) // Percentage of seller's price
        : platformFeeAmount; // Fixed amount in dollars

      const totalAmount = listingPrice; // Buyer pays exactly the listing price
      if (buyerWallet.balance < totalAmount) {
        console.log("Balance check failed:", {
          buyerBalance: buyerWallet.balance,
          listingPrice: listingPrice,
          totalAmount,
          serviceFee
        });
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Seller receives listing price minus platform fee
      const sellerAmount = listingPrice - serviceFee;
      
      // Deduct funds from buyer's wallet immediately
      const deductSuccess = await storage.deductFunds(
        user.id, 
        totalAmount, 
        `Order payment for listing ${listing.id}`
      );
      
      if (!deductSuccess) {
        return res.status(400).json({ message: "Failed to process payment" });
      }

      // For site-based listings, create a regular listing
      let finalListingId = listing.id;
      
      if (listingId.startsWith('site-listing-') && listingSite) {
        // Create a proper listing record for this site-based order
        const newListing = await storage.createListing({
          userId: listingSite.userId,
          siteId: listingSite.id,
          type: 'link_placement',
          price: listingSite.price || 0,
          serviceFee: serviceFee,
          requirements: requirements || `Link placement order for ${listingSite.domain}`,
          turnaroundTime: listingSite.deliveryTime || 7
        });
        finalListingId = newListing.id;
      }

      // Create order with on_going status (orders go straight to work)
      const orderCount = await storage.getAllOrders();
      const orderId = `#ORDER-${String(orderCount.length + 1).padStart(3, '0')}`;
      
      const order = await storage.createOrder({
        buyerId: user.id,
        sellerId: listing.userId,
        listingId: finalListingId,
        orderId,
        amount: totalAmount,
        serviceFee: serviceFee,
        sellerAmount: sellerAmount,
        status: "on_going", // Orders go straight to on_going status
        requirements: requirements || `Order for ${listing.type === 'guest_post' ? 'guest post' : 'link placement'} on ${listingSite?.domain || 'site'}`,
        googleDocLink,
        targetLink
      });

      // Create notifications for both buyer and seller
      await storage.createNotification({
        userId: user.id,
        type: "order_created",
        title: "Order Created",
        message: `Your order ${orderId} has been created and is now in progress`,
        isRead: false,
        relatedEntityId: order.id,
        section: "guest_post",
        subTab: "ongoing",
        priority: "normal",
      });

      await storage.createNotification({
        userId: listing.userId,
        type: "order_received",
        title: "New Order Received",
        message: `You have received a new order ${orderId} from ${user.firstName} ${user.lastName} - now in progress`,
        isRead: false,
        relatedEntityId: order.id,
        section: "guest_post",
        subTab: "ongoing",
        priority: "high",
      });
      
      // Log successful order creation
      auditOrderAction(req, user.id, order.id, 'CREATE', true);
      auditFinancialAction(req, user.id, 'ORDER_PAYMENT', totalAmount, true);
      
      res.json(order);
    } catch (error) {
      const sessionUser = (req.session as any).user;
      auditOrderAction(req, sessionUser?.id || 'unknown', 'unknown', 'CREATE', false, (error as Error).message);
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.put("/api/orders/:id/accept", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the order to check ownership
      const existingOrder = await storage.getOrderById(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow seller to accept their orders
      if (sessionUser.id !== existingOrder.sellerId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to accept this order" });
      }
      
      const order = await storage.updateOrder(req.params.id, { status: "accepted" });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Notify buyer that order was accepted
      await storage.createNotification({
        userId: order.buyerId,
        type: "order_accepted",
        title: "Order Accepted",
        message: `Your order ${order.orderId || order.id} has been accepted and work will begin soon`,
        isRead: false,
        relatedEntityId: order.id,
      });

      // Log order acceptance
      auditOrderAction(req, sessionUser.id, order.id, 'ACCEPT', true);

      res.json(order);
    } catch (error) {
      const sessionUser = (req.session as any).user;
      auditOrderAction(req, sessionUser?.id || 'unknown', req.params.id, 'ACCEPT', false, error.message);
      res.status(500).json({ message: "Failed to accept order" });
    }
  });

  app.put("/api/orders/:id/decline", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow seller to decline their orders
      if (sessionUser.id !== order.sellerId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to decline this order" });
      }

      // Refund full amount (including platform fee) to buyer
      const refundSuccess = await storage.addFunds(
        order.buyerId,
        order.amount,
        `Refund for cancelled order ${order.orderId || order.id}`
      );

      if (!refundSuccess) {
        return res.status(500).json({ message: "Failed to process refund" });
      }

      const updatedOrder = await storage.updateOrder(req.params.id, { status: "cancelled" });
      
      // Notify buyer of cancellation and refund
      await storage.createNotification({
        userId: order.buyerId,
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Your order ${order.orderId || order.id} has been cancelled and you have been fully refunded`,
        isRead: false,
        relatedEntityId: order.id,
      });

      // Log order decline and refund
      auditOrderAction(req, sessionUser.id, order.id, 'DECLINE', true);
      auditFinancialAction(req, sessionUser.id, 'REFUND', order.amount, true);

      res.json(updatedOrder);
    } catch (error) {
      const sessionUser = (req.session as any).user;
      auditOrderAction(req, sessionUser?.id || 'unknown', req.params.id, 'DECLINE', false, (error as Error).message);
      res.status(500).json({ message: "Failed to decline order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Sanitize input data
      const sanitizedBody = {
        ...req.body,
        deliveryUrl: req.body.deliveryUrl ? sanitizeInput(req.body.deliveryUrl) : undefined
      };
      
      const { status, deliveryUrl, userId, action } = sanitizedBody;
      const currentUserId = sessionUser.id;
      
      const order = await storage.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow participants of the order or admin to update it
      const isParticipant = sessionUser.id === order.buyerId || 
                           sessionUser.id === order.sellerId;
      if (!isParticipant && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to update this order" });
      }

      let updateData: Partial<any> = {};
      
      if (action === "delivered" && userId === order.sellerId) {
        // Seller marking as delivered
        updateData = {
          status: "delivered",
          deliveryUrl,
          sellerDelivered: true
        };
        
        // Notify buyer that work is delivered
        await storage.createNotification({
          userId: order.buyerId,
          type: "order_delivered",
          title: "Order Delivered",
          message: `Your order ${order.orderId || order.id} has been delivered. Please review and confirm completion.`,
          isRead: false,
          relatedEntityId: order.id,
        });
        
      } else if (action === "confirm_completed" && userId === order.buyerId) {
        // Buyer confirming completion
        updateData = {
          status: "completed",
          buyerCompleted: true
        };
        
        // Transfer seller amount to seller (fees were already deducted during order creation)
        await storage.addFunds(
          order.sellerId,
          order.sellerAmount, // This already has platform fees deducted
          `Payment for completed order ${order.orderId || order.id} (after platform fee)`
        );
        
        // Platform fee was already recorded during order creation
        // No additional fee recording needed here

        // Process referral commission if this is buyer's first order
        try {
          const commissionProcessed = await storage.processReferralCommission(order.id, order.buyerId);
          if (commissionProcessed) {
            console.log(`Referral commission processed for order ${order.id}`);
          }
        } catch (error) {
          console.error("Error processing referral commission:", error);
          // Don't fail the order completion if referral commission fails
        }

        // Increment purchase count for the site (for Top Performing Sites ranking)
        const listing = await storage.getListingById(order.listingId);
        console.log(`[ORDER COMPLETION] Order ${order.id} completed, listing:`, listing?.id, 'site:', listing?.siteId);
        if (listing?.siteId) {
          const incrementResult = await storage.incrementSitePurchaseCount(listing.siteId);
          console.log(`[ORDER COMPLETION] Purchase count increment result:`, incrementResult);
        } else {
          console.error(`[ORDER COMPLETION] No listing or siteId found for order ${order.id}`);
        }
        
        // Notify seller of completion and payment
        await storage.createNotification({
          userId: order.sellerId,
          type: "order_completed",
          title: "Order Completed",
          message: `Order ${order.orderId || order.id} has been marked as completed and you have received payment.`,
          isRead: false,
          relatedEntityId: order.id,
          section: "guest_post",
          subTab: "completed",
          priority: "normal",
        });
        
      } else if (action === "cancel" && userId === order.sellerId) {
        // Seller cancelling order
        const refundSuccess = await storage.addFunds(
          order.buyerId,
          order.amount,
          `Refund for cancelled order ${order.orderId || order.id}`
        );

        if (!refundSuccess) {
          return res.status(500).json({ message: "Failed to process refund" });
        }

        updateData = { status: "cancelled" };
        
        await storage.createNotification({
          userId: order.buyerId,
          type: "order_cancelled",
          title: "Order Cancelled",
          message: `Order ${order.orderId || order.id} has been cancelled by the seller and you have been fully refunded`,
          isRead: false,
          relatedEntityId: order.id,
        });
      }
      
      // Handle direct status updates (for simple cases)
      if (status && !action) {
        if (status === "completed" && (order.buyerId === currentUserId || order.buyerId === userId)) {
          // Prevent duplicate completion
          if (order.status === "completed") {
            return res.status(400).json({ message: "Order already completed" });
          }
          
          // Buyer marking as completed - transfer funds to seller
          await storage.addFunds(
            order.sellerId,
            order.sellerAmount || order.amount,
            `Payment for completed order ${order.orderId || order.id}`
          );

          // Increment purchase count for the site (for Top Performing Sites ranking)
          const listing = await storage.getListingById(order.listingId);
          console.log(`[ORDER COMPLETION] Order ${order.id} completed via direct status, listing:`, listing?.id, 'site:', listing?.siteId);
          if (listing?.siteId) {
            const incrementResult = await storage.incrementSitePurchaseCount(listing.siteId);
            console.log(`[ORDER COMPLETION] Purchase count increment result:`, incrementResult);
          } else {
            console.error(`[ORDER COMPLETION] No listing or siteId found for order ${order.id}`);
          }
          
          updateData = { status: "completed" };
          
          await storage.createNotification({
            userId: order.sellerId,
            type: "order_completed",
            title: "Order Completed",
            message: `Order ${order.orderId || order.id} has been marked as completed and you have received payment.`,
            isRead: false,
            relatedEntityId: order.id,
          });
        } else if (status === "refunded" && (order.sellerId === currentUserId || order.sellerId === userId)) {
          // Prevent duplicate refund
          if (order.status === "refunded" || order.status === "cancelled") {
            return res.status(400).json({ message: "Order already refunded or cancelled" });
          }
          
          // Seller issuing refund
          const refundSuccess = await storage.addFunds(
            order.buyerId,
            order.amount,
            `Refund for order ${order.orderId || order.id}`
          );

          if (!refundSuccess) {
            return res.status(500).json({ message: "Failed to process refund" });
          }

          updateData = { status: "refunded" };
          
          await storage.createNotification({
            userId: order.buyerId,
            type: "order_refunded",
            title: "Order Refunded",
            message: `Order ${order.orderId || order.id} has been refunded by the seller`,
            isRead: false,
            relatedEntityId: order.id,
          });
        } else {
          updateData = { status };
        }
      }

      const updatedOrder = await storage.updateOrder(req.params.id, updateData);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only allow users to fetch their own transactions or admin to fetch any user's transactions
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these transactions" });
      }
      
      const transactions = await storage.getTransactionsByUserId(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Wallet transactions endpoints
  app.get("/api/wallet-transactions", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const requestedLimit = parseInt(req.query.limit as string);
      
      // Use hardcoded limit if no limit specified (simplified pagination)
      const limit = requestedLimit || 5;
      const offset = (page - 1) * limit;

      console.log(`Wallet transactions API: user=${user.id}, page=${page}, limit=${limit}, offset=${offset}`);

      const { transactions, total } = await storage.getWalletTransactionsByUserIdPaginated(user.id, limit, offset);
      
      console.log(`Wallet transactions result: total=${total}, transactions=${transactions.length}`);
      
      res.json({
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  app.get("/api/admin/wallet-transactions", requireAdminOrEmployee, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;

      const { transactions, total } = await storage.getAllWalletTransactionsPaginated(limit, offset, status);
      
      res.json({
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  // Admin approve/reject wallet transactions
  app.patch("/api/admin/wallet-transactions/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { status, adminNote } = req.body;
      const admin = (req.session as any)?.user;
      
      if (!["approved", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const result = await storage.processWalletTransaction(
        req.params.id, 
        status, 
        admin.id, 
        adminNote,
        req.body.rejectionReason
      );

      if (!result) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json({ message: `Transaction ${status} successfully`, transaction: result });
    } catch (error) {
      console.error("Process wallet transaction error:", error);
      res.status(500).json({ message: "Failed to process transaction" });
    }
  });

  // Public settings endpoint (no auth required for essential settings like maintenance mode)
  app.get("/api/settings/public", async (req, res) => {
    try {
      const settingsArray = await storage.getPlatformSettings();
      
      // Convert array to object for easier access
      const settingsObj: any = {};
      settingsArray.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      // Only return public settings including timezone for app-wide consistency
      const publicSettings = {
        maintenanceMode: settingsObj.maintenanceMode || 'false',
        maintenanceMessage: settingsObj.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
        platformFee: settingsObj.platformFee || '5',
        platformFeeType: settingsObj.platformFeeType || 'percentage',
        topUpFee: settingsObj.topUpFee || '200',
        withdrawalFee: settingsObj.withdrawalFee || '200',
        minimumSalesPrice: settingsObj.minimumSalesPrice || '10',
        
        // Platform branding
        platformName: settingsObj.platform_name || 'CollabPro',

        // Include timezone settings for app-wide timezone management
        appTimezone: settingsObj.appTimezone || 'UTC',
        adminTimezone: settingsObj.adminTimezone || 'UTC',

        // Referral system settings
        referralCommission: settingsObj.Referral_Commission || '3'
      };
      res.json(publicSettings);
    } catch (error) {
      console.error("Error fetching public settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });



  // Admin password reset route
  app.post("/api/admin/reset-password", requireAdmin, async (req, res) => {
    try {
      const { userIdentifier, newPassword } = req.body;
      const admin = (req.session as any)?.user;
      
      if (!userIdentifier || !newPassword) {
        return res.status(400).json({ message: "User identifier and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Find user by username or email
      let user = await storage.getUserByUsername(userIdentifier);
      if (!user) {
        user = await storage.getUserByEmail(userIdentifier);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash the new password with bcrypt (12 salt rounds for security)
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user's password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Log the password reset action
      console.log(`[ADMIN ACTION] Password reset for user ${user.username} (${user.email}) by admin ${admin.username} at ${new Date().toISOString()}`);
      
      res.json({ 
        message: "Password reset successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Admin user search route
  app.get("/api/admin/search-users", requireAdmin, async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const searchTerm = q.trim().toLowerCase();
      if (searchTerm.length < 2) {
        return res.status(400).json({ message: "Search term must be at least 2 characters" });
      }
      
      // Get all users and filter by username or email
      const allUsers = await storage.getAllUsers();
      const matchingUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      ).slice(0, 10); // Limit to 10 results
      
      // Return user info without sensitive data
      const safeUsers = matchingUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error('User search error:', error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithWallets = await Promise.all(
        users.map(async (user) => {
          const wallet = await storage.getWallet(user.id);
          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, balance: wallet?.balance || 0 };
        })
      );
      res.json(usersWithWallets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  app.get("/api/admin/sites", requireAdminOrEmployee, async (req, res) => {
    try {
      const sites = await storage.getAllSites();
      
      // Enrich sites with user data
      const enrichedSites = await Promise.all(
        sites.map(async (site) => {
          const user = await storage.getUser(site.userId);
          return {
            ...site,
            user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
          };
        })
      );
      
      res.json(enrichedSites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin sites" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Enrich orders with user and listing data
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const buyer = await storage.getUser(order.buyerId);
          const seller = await storage.getUser(order.sellerId);
          
          return {
            ...order,
            buyer: buyer ? { id: buyer.id, firstName: buyer.firstName, lastName: buyer.lastName, email: buyer.email } : null,
            seller: seller ? { id: seller.id, firstName: seller.firstName, lastName: seller.lastName, email: buyer.email } : null,
          };
        })
      );
      
      res.json(enrichedOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin orders" });
    }
  });

  app.put("/api/admin/orders/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.put("/api/admin/users/:id/balance", async (req, res) => {
    try {
      const { action, amount } = req.body;
      if (!['add', 'deduct'].includes(action) || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid balance update data" });
      }

      const success = await storage.updateUserBalance(req.params.id, action, amount);
      if (!success) {
        return res.status(400).json({ message: "Failed to update balance" });
      }

      // Create transaction record
      await storage.createTransaction({
        userId: req.params.id,
        type: action === 'add' ? 'deposit' : 'withdrawal',
        amount: action === 'add' ? amount : -amount,
        description: `Admin ${action === 'add' ? 'added' : 'deducted'} funds`,
        orderId: null,
      });

      const wallet = await storage.getWallet(req.params.id);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user balance" });
    }
  });

  app.put("/api/admin/sites/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const site = await storage.updateSite(req.params.id, req.body);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site" });
    }
  });

  app.put("/api/admin/sites/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const site = await storage.approveSite(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve site" });
    }
  });

  app.put("/api/admin/sites/:id/reject", requireAdminOrEmployee, async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const site = await storage.rejectSite(req.params.id, reason);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject site" });
    }
  });

  // User balance management endpoint
  app.post("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    try {
      const { action, amount } = req.body;
      const userId = req.params.id;
      
      if (!action || !amount || (action !== 'add' && action !== 'deduct')) {
        return res.status(400).json({ message: "Invalid action or amount" });
      }
      
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      // Keep as dollars - no conversion needed
      const amountInDollars = numAmount;
      
      // Get current wallet
      let wallet = await storage.getWallet(userId);
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await storage.createWallet(userId);
      }
      
      // Calculate new balance
      let newBalance;
      if (action === 'add') {
        newBalance = wallet.balance + amountInDollars;
      } else {
        newBalance = wallet.balance - amountInDollars;
        if (newBalance < 0) {
          return res.status(400).json({ message: "Insufficient balance for deduction" });
        }
      }
      
      // Update wallet balance
      const updatedWallet = await storage.updateWalletBalance(userId, newBalance);
      if (!updatedWallet) {
        return res.status(404).json({ message: "Failed to update wallet" });
      }
      
      // Create transaction record for audit trail
      await storage.createTransaction({
        userId,
        type: action === 'add' ? 'admin_credit' : 'admin_debit',
        amount,
        description: `Admin ${action === 'add' ? 'added' : 'deducted'} $${numAmount.toFixed(2)}`,
        orderId: null
      });
      
      res.json({ 
        message: `Successfully ${action === 'add' ? 'added' : 'deducted'} $${numAmount.toFixed(2)}`,
        newBalance: updatedWallet.balance
      });
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  // User balance search endpoint for admin
  app.post("/api/admin/user-balance-by-email", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's wallet
      const wallet = await storage.getWallet(user.id) || { balance: 0 };
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        balance: wallet.balance
      });
    } catch (error) {
      console.error("Error searching user by email:", error);
      res.status(500).json({ message: "Failed to search user" });
    }
  });

  // User balance update endpoint for admin
  app.post("/api/admin/user-balance", requireAdmin, async (req, res) => {
    try {
      const { userId, amount, operation } = req.body;
      
      if (!userId || !amount || !operation) {
        return res.status(400).json({ message: "UserId, amount, and operation are required" });
      }
      
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }
      
      if (!['add', 'subtract'].includes(operation)) {
        return res.status(400).json({ message: "Operation must be 'add' or 'subtract'" });
      }
      
      // Get or create user's wallet
      let wallet = await storage.getWallet(userId);
      if (!wallet) {
        wallet = await storage.createWallet(userId);
      }
      
      let newBalance;
      if (operation === 'add') {
        newBalance = wallet.balance + amount;
      } else {
        newBalance = Math.max(0, wallet.balance - amount); // Prevent negative balance
      }
      
      // Update wallet balance
      await storage.updateWalletBalance(userId, newBalance);
      
      // Create transaction record
      await storage.createTransaction({
        userId,

        type: operation === 'add' ? 'admin_credit' : 'admin_debit',
        amount: amount,
        description: `Admin ${operation === 'add' ? 'added' : 'deducted'} $${amount.toFixed(2)} ${operation === 'add' ? 'to' : 'from'} user balance`,
        orderId: null
      });
      
      res.json({ 
        message: "Balance updated successfully", 
        newBalance,
        operation,
        amount 
      });
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Payment Gateway Management Routes for Admin
  app.put("/api/admin/payment-gateways/:id/limits", requireAdmin, async (req, res) => {
    try {
      const { minDepositAmount, maxDepositAmount, minWithdrawalAmount, maxWithdrawalAmount } = req.body;
      
      // Validate the amounts
      if (minDepositAmount < 0 || maxDepositAmount < 0 || minWithdrawalAmount < 0 || maxWithdrawalAmount < 0) {
        return res.status(400).json({ message: "Amounts must be non-negative" });
      }
      
      if (minDepositAmount > maxDepositAmount || minWithdrawalAmount > maxWithdrawalAmount) {
        return res.status(400).json({ message: "Minimum amounts cannot exceed maximum amounts" });
      }
      
      const gateway = await storage.updatePaymentGatewayLimits(req.params.id, {
        minDepositAmount: parseInt(minDepositAmount),
        maxDepositAmount: parseInt(maxDepositAmount),
        minWithdrawalAmount: parseInt(minWithdrawalAmount),
        maxWithdrawalAmount: parseInt(maxWithdrawalAmount)
      });
      
      if (!gateway) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      
      res.json(gateway);
    } catch (error) {
      console.error("Error updating payment gateway limits:", error);
      res.status(500).json({ message: "Failed to update gateway limits" });
    }
  });

  // Financial Management API Routes for Admin Dashboard
  app.get("/api/admin/transactions", requireAdminOrEmployee, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactionsWithUsers();
      const walletTransactions = await storage.getAllWalletTransactionsWithUsers();
      
      // Combine and format all transactions
      const allTransactions = [
        ...transactions.map(t => ({
          ...t,
          fee: 0, // Regular transactions don't have fees
          transactionType: 'regular'
        })),
        ...walletTransactions.map(wt => ({
          ...wt,
          transactionType: 'wallet',
          type: wt.type === 'top_up' ? 'wallet_deposit' : 'wallet_withdrawal',
          description: `${wt.type === 'top_up' ? 'Wallet deposit' : 'Wallet withdrawal'} - ${wt.status}`
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allTransactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/wallet-transactions/:type/:status", requireAdminOrEmployee, async (req, res) => {
    try {
      const { type, status } = req.params;
      const transactions = await storage.getWalletTransactionsByStatus(status, type);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  app.get("/api/admin/wallet-transactions/:status", requireAdminOrEmployee, async (req, res) => {
    try {
      const { status } = req.params;
      const transactions = await storage.getWalletTransactionsByStatus(status);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions by status:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  app.get("/api/admin/fee-records", requireAdminOrEmployee, async (req, res) => {
    try {
      const feeRecords = await storage.getAllFeeRecords();
      res.json(feeRecords);
    } catch (error) {
      console.error("Error fetching fee records:", error);
      res.status(500).json({ message: "Failed to fetch fee records" });
    }
  });

  // Admin Crypto TxIDs - Get all crypto transaction IDs with user details
  app.get("/api/admin/crypto-txids", requireAdmin, async (req, res) => {
    try {
      const cryptoTxIds = await storage.getAllCryptoTxIds();
      res.json(cryptoTxIds);
    } catch (error) {
      console.error("Error fetching crypto TxIDs:", error);
      res.status(500).json({ message: "Failed to fetch crypto TxIDs" });
    }
  });

  // Admin API Routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/recent-activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Admin Users Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = await storage.updateUser(id, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/admin/users/:id/adjust-balance", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;
      const result = await storage.adjustUserBalance(id, amount, reason);
      res.json(result);
    } catch (error) {
      console.error("Error adjusting balance:", error);
      res.status(500).json({ message: "Failed to adjust balance" });
    }
  });

  // Admin Orders Management
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Admin Domains Management
  app.get("/api/admin/domains", requireAdminOrEmployee, async (req, res) => {
    try {
      const domains = await storage.getAllSites();
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  app.patch("/api/admin/domains/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const site = await storage.updateSiteApproval(id, approved);
      res.json(site);
    } catch (error) {
      console.error("Error updating site approval:", error);
      res.status(500).json({ message: "Failed to update site" });
    }
  });

  // Admin Settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      
      // Add email verification setting from SMTP system table
      const smtpConfig = await storage.getSmtpConfig();
      const emailVerificationSetting = {
        id: 'smtp-email-verification',
        key: 'emailVerificationEnabled',
        value: smtpConfig?.requireEmailVerification ? 'true' : 'false',
        description: 'Whether email verification is required for new user registrations'
      };
      
      res.json([...settings, emailVerificationSetting]);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settingsData = req.body;
      const settings = await storage.updatePlatformSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      // Handle single setting update
      if (key && value !== undefined) {
        // Special handling for email verification toggle - update smtp_system table
        if (key === 'emailVerificationEnabled') {
          const requireVerification = value === 'true';
          await storage.updateSmtpEmailVerificationSetting(requireVerification);
          
          res.json({ 
            success: true, 
            setting: { 
              key: 'emailVerificationEnabled', 
              value, 
              description: 'Email verification requirement updated in SMTP system' 
            } 
          });
        } else {
          const setting = await storage.setSetting({ key, value, description });
          
          // If Anti-DDoS setting was updated, refresh the security system cache
          if (key === 'antiDdosEnabled') {
            const securitySystem = getSecuritySystem();
            await securitySystem.refreshAntiDdosCache();
          }
          
          res.json({ success: true, setting });
        }
      } else {
        // Handle bulk settings update
        const settingsData = req.body;
        const settings = await storage.updatePlatformSettings(settingsData);
        res.json(settings);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Admin Support Chat
  app.get("/api/admin/support-messages", requireAdminOrEmployee, async (req, res) => {
    try {
      const messages = await storage.getAllSupportMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching support messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/admin/support-messages", requireAdmin, async (req, res) => {
    try {
      const messageData = insertSupportMessageSchema.parse({
        ...req.body,
        isFromAdmin: true
      });
      const message = await storage.createSupportMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating support message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Audit logs route for admin access (secured)
  app.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
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

  // ===== SUPPORT TICKET SYSTEM ROUTES =====

  // User Support Ticket Routes
  app.post("/api/support/tickets", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: sessionUser.id
      });

      const ticket = await storage.createSupportTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({ message: "Failed to create support ticket" });
    }
  });

  app.get("/api/support/tickets/user/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Users can only view their own tickets, admins can view any user's tickets
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to access these tickets" });
      }

      const tickets = await storage.getSupportTicketsByUserId(req.params.userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get("/api/support/tickets/:ticketId/messages", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messages = await storage.getSupportMessagesByTicketId(req.params.ticketId);
      
      // Filter messages to show "Support Team" for admin messages to users
      const filteredMessages = messages.map(msg => ({
        ...msg,
        senderName: msg.sender === 'admin' && sessionUser.role !== 'admin' ? 'Support Team' : msg.sender
      }));

      res.json(filteredMessages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ message: "Failed to fetch ticket messages" });
    }
  });

  app.post("/api/support/tickets/:ticketId/messages", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageData = insertSupportMessageSchema.parse({
        ...req.body,
        ticketId: req.params.ticketId,
        userId: sessionUser.id,
        sender: (sessionUser.role === 'admin' || sessionUser.role === 'employee') ? 'admin' : 'user'
      });

      const message = await storage.createSupportMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating support message:", error);
      res.status(400).json({ message: "Failed to create support message" });
    }
  });

  // Admin Support Ticket Routes
  app.get("/api/admin/support/tickets", requireAdminOrEmployee, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching admin tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get("/api/admin/support/tickets/:status/:priority/:category", requireAdminOrEmployee, async (req, res) => {
    try {
      const { status, priority, category } = req.params;
      let tickets = await storage.getAllSupportTickets();
      
      // Apply filters if they're not 'all'
      if (status !== 'all') {
        tickets = tickets.filter(ticket => ticket.status === status);
      }
      if (priority !== 'all') {
        tickets = tickets.filter(ticket => ticket.priority === priority);
      }
      if (category !== 'all') {
        tickets = tickets.filter(ticket => ticket.category === category);
      }
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching filtered admin tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.put("/api/admin/support/tickets/:ticketId/status", requireAdminOrEmployee, async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { status } = req.body;
      if (!['open', 'replied', 'investigating', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const ticket = await storage.updateSupportTicketStatus(
        req.params.ticketId, 
        status, 
        sessionUser.id
      );

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  app.post("/api/admin/support/tickets/:ticketId/reply", requireAdminOrEmployee, async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      const messageData = {
        ticketId: req.params.ticketId,
        userId: sessionUser.id, // This will be the admin's user ID for tracking
        message: message.trim(),
        sender: 'admin' as const
      };

      const supportMessage = await storage.createSupportMessage(messageData);
      res.json(supportMessage);
    } catch (error) {
      console.error("Error creating admin reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  // Support Notification Routes
  app.get("/api/support/notifications/count/:userId", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Ensure user can only access their own notifications
      if (sessionUser.id !== req.params.userId && sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const count = await storage.getSupportNotificationCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.post("/api/support/notifications/mark-read", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { ticketId } = req.body;
      if (!ticketId) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }

      await storage.markSupportNotificationsAsRead(sessionUser.id, ticketId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // User Deposit Session API routes
  app.post("/api/deposit/create-session", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { amount } = req.body;
      if (!amount || amount < 10) { // Minimum $10.00 in dollars
        return res.status(400).json({ message: "Minimum deposit amount is $10.00" });
      }

      // Check if user has an active session
      const existingSession = await storage.getUserDepositSessionByUserId(sessionUser.id);
      if (existingSession) {
        return res.json(existingSession);
      }

      // Get crypto payment gateway configuration
      const cryptoGateway = await storage.getPaymentGatewayByName('crypto');
      if (!cryptoGateway || !cryptoGateway.isActive) {
        return res.status(400).json({ message: "Cryptocurrency payments are currently unavailable" });
      }

      // Create new session with 25-minute expiry
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 25 * 60 * 1000); // 25 minutes
      const sessionId = `deposit-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Parse instructions from gateway configuration
      let instructionsText = "";
      if (cryptoGateway.instructions) {
        try {
          const instructionsArray = JSON.parse(cryptoGateway.instructions);
          if (Array.isArray(instructionsArray)) {
            instructionsText = instructionsArray.map((inst: any, index: number) => 
              `${index + 1}. ${typeof inst === 'string' ? inst : inst.text || inst}`
            ).join('\n');
          } else {
            instructionsText = cryptoGateway.instructions;
          }
        } catch (e) {
          // Fallback to raw text if not JSON
          instructionsText = cryptoGateway.instructions;
        }
      }

      // Use actual QR code path if available and QR is enabled, convert to public objects URL
      let qrCodeData = "";
      if (cryptoGateway.qrEnabled && cryptoGateway.qrCodeImagePath && cryptoGateway.qrCodeImagePath.trim() !== "") {
        // Convert object storage path to public URL
        let imagePath = cryptoGateway.qrCodeImagePath;
        if (imagePath.startsWith('/')) {
          imagePath = imagePath.substring(1);
        }
        // Clean up any duplicate qr-code/ prefixes
        while (imagePath.includes('qr-code/qr-code/')) {
          imagePath = imagePath.replace('qr-code/qr-code/', 'qr-code/');
        }
        // Handle legacy qr-codes/ prefix (from cloud storage) and convert to local qr-code/
        if (imagePath.startsWith('qr-codes/')) {
          imagePath = imagePath.replace('qr-codes/', 'qr-code/');
        }
        // Ensure it starts with qr-code/ if it doesn't already (for local storage)
        if (!imagePath.startsWith('qr-code/') && !imagePath.startsWith('/qr-code/')) {
          imagePath = `qr-code/${imagePath}`;
        }
        qrCodeData = `/${imagePath}`;
      } else {
        // If QR is disabled or no image available, provide empty QR code data
        qrCodeData = "";
      }

      const session = await storage.createUserDepositSession({
        userId: sessionUser.id,
        sessionId,
        amount: amount, // Store dollars directly
        walletAddress: cryptoGateway.walletAddress || "TUXp9Zpq7Eot6C3k453gM2uCkV6v8jdM2L",
        qrCodeData,
        instructions: instructionsText || "Please follow the payment instructions provided.",
        expiresAt,
        isActive: true
      });

      // Log deposit session creation
      auditFinancialAction(req, sessionUser.id, 'DEPOSIT_SESSION_CREATE', amount, true);

      // Add qrEnabled flag to response for frontend conditional rendering
      const sessionWithQrFlag = {
        ...session,
        qrEnabled: cryptoGateway.qrEnabled || false
      };

      res.json(sessionWithQrFlag);
    } catch (error) {
      const sessionUser = (req.session as any).user;
      auditFinancialAction(req, sessionUser?.id || 'unknown', 'DEPOSIT_SESSION_CREATE', 0, false, (error as Error).message);
      res.status(500).json({ message: "Failed to create deposit session" });
    }
  });

  app.get("/api/deposit/session", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const session = await storage.getUserDepositSessionByUserId(sessionUser.id);
      if (!session) {
        return res.status(404).json({ message: "No active deposit session" });
      }

      // Get crypto payment gateway to check qrEnabled flag
      const cryptoGateway = await storage.getPaymentGatewayByName('crypto');
      
      // Add qrEnabled flag to response for frontend conditional rendering
      const sessionWithQrFlag = {
        ...session,
        qrEnabled: cryptoGateway?.qrEnabled || false
      };

      res.json(sessionWithQrFlag);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposit session" });
    }
  });

  app.delete("/api/deposit/session", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const session = await storage.getUserDepositSessionByUserId(sessionUser.id);
      if (session) {
        await storage.expireUserDepositSession(session.id);
      }

      res.json({ message: "Session closed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to close session" });
    }
  });

  // Finance Settings routes
  app.get("/api/admin/finance-settings", requireAdminOrEmployee, async (req, res) => {
    try {
      const settings = await storage.getAllFinanceSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching finance settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/finance-settings/:type", requireAdminOrEmployee, async (req, res) => {
    try {
      const { type } = req.params;
      const settings = await storage.getFinanceSettingsByType(type);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching finance settings by type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin crypto TxID endpoint
  app.get("/api/admin/crypto-txids", requireAdmin, async (req, res) => {
    try {
      // Get all crypto TxIDs from the database
      const query = `
        SELECT ct.*, u.username, u.first_name, u.last_name, wt.amount, wt.status, wt.created_at as transaction_date
        FROM crypto_txids ct
        LEFT JOIN users u ON ct.user_id = u.id
        LEFT JOIN wallet_transactions wt ON ct.wallet_transaction_id = wt.id
        ORDER BY ct.created_at DESC
      `;
      
      const { db } = await import("./db");
      const result = await db.execute(query);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching crypto TxIDs:", error);
      res.status(500).json({ error: "Failed to fetch crypto TxIDs" });
    }
  });

  app.post("/api/admin/finance-settings", requireAdminOrEmployee, async (req, res) => {
    try {
      const settingData = req.body;
      const setting = await storage.createFinanceSetting(settingData);
      res.json(setting);
    } catch (error) {
      console.error("Error creating finance setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/finance-settings/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const setting = await storage.updateFinanceSetting(id, updates);
      if (!setting) {
        return res.status(404).json({ error: "Finance setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error updating finance setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/finance-settings/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteFinanceSetting(id);
      if (!success) {
        return res.status(404).json({ error: "Finance setting not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting finance setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Employee-specific transaction approval endpoints
  app.post("/api/admin/wallet-transactions/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      // auditLogger(req, "TRANSACTION_APPROVE", { transactionId: req.params.id });
      
      const transactionId = req.params.id;
      const transaction = await storage.getWalletTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== 'processing') {
        return res.status(400).json({ error: "Only processing transactions can be approved" });
      }

      // Use existing processWalletTransaction method
      const employeeUsername = (req.session as any)?.user?.username;
      const updatedTransaction = await storage.processWalletTransaction(
        transactionId, 
        'approved', 
        (req.session as any)?.user?.id || 'employee',
        employeeUsername
      );
      
      if (!updatedTransaction) {
        return res.status(500).json({ error: "Failed to process transaction" });
      }

      res.json({ message: "Transaction approved successfully" });
    } catch (error) {
      console.error("Error approving transaction:", error);
      res.status(500).json({ error: "Failed to approve transaction" });
    }
  });

  app.post("/api/admin/wallet-transactions/:id/reject", requireAdminOrEmployee, async (req, res) => {
    try {
      // auditLogger(req, "TRANSACTION_REJECT", { transactionId: req.params.id, reason: req.body.reason });
      
      const transactionId = req.params.id;
      const { reasonId, customReason } = req.body;
      
      // Build the rejection reason
      let finalReason = customReason;
      if (reasonId && !customReason) {
        const rejectionReasons = await storage.getRejectionReasons();
        const rejectionReason = rejectionReasons.find(r => r.id === reasonId);
        finalReason = rejectionReason?.reasonText || 'Transaction rejected';
      }
      
      if (!finalReason || !finalReason.trim()) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const transaction = await storage.getWalletTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== 'processing') {
        return res.status(400).json({ error: "Only processing transactions can be rejected" });
      }

      // Use existing processWalletTransaction method for rejection
      const employeeUsername = (req.session as any)?.user?.username;
      const updatedTransaction = await storage.processWalletTransaction(
        transactionId, 
        'failed', 
        (req.session as any)?.user?.id || 'employee',
        employeeUsername,
        finalReason.trim()
      );
      
      if (!updatedTransaction) {
        return res.status(500).json({ error: "Failed to process transaction" });
      }

      res.json({ message: "Transaction rejected successfully" });
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      res.status(500).json({ error: "Failed to reject transaction" });
    }
  });

  // Order Messaging Routes
  app.get("/api/messages/order/:orderId", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { orderId } = req.params;
      
      // Check if user has access to this order
      const order = await storage.getOrderById(orderId);
      if (!order || (order.buyerId !== user.id && order.sellerId !== user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await storage.getMessagesByOrderId(orderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching order messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/order/:orderId", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { orderId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Check if user has access to this order
      const order = await storage.getOrderById(orderId);
      if (!order || (order.buyerId !== user.id && order.sellerId !== user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const message = await storage.createOrderMessage({
        orderId,
        senderId: user.id,
        content: content.trim()
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating order message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const order = await storage.getOrderById(id);
      
      if (!order || (order.buyerId !== user.id && order.sellerId !== user.id)) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Enhanced Admin Users Routes
  
  // Get user summary stats for admin view details
  app.get("/api/admin/users/:userId/summary", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.userId;
      
      // Get user's sites
      const userSites = await storage.getSitesByUserId(userId);
      const activeDomains = userSites.filter(site => site.status === 'approved').length;
      
      // Get user's exchanges
      const userExchanges = await storage.getExchangesByUserId(userId);
      const totalExchanges = userExchanges.filter(exchange => 
        exchange.status === "completed" && 
        exchange.requesterCompleted === true && 
        exchange.requestedUserCompleted === true
      ).length;
      
      // Get user's orders (sales)
      const userOrders = await storage.getOrdersByUserId(userId);
      const totalSales = userOrders.filter(order => 
        order.sellerId === userId && order.status === "completed"
      ).length;
      
      // Get user's wallet balance
      const wallet = await storage.getWallet(userId);
      const balance = wallet ? wallet.balance : 0;
      
      res.json({
        totalSales,
        totalExchanges,
        activeDomains,
        balance: balance / 100 // Convert cents to dollars
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user summary" });
    }
  });

  // User balance management by email search
  app.post("/api/admin/user-balance-by-email", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const users = await storage.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === sanitizeInput(email).toLowerCase());
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const wallet = await storage.getWallet(user.id);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        balance: wallet ? wallet.balance / 100 : 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user balance" });
    }
  });

  // Get banned IPs
  app.get("/api/admin/banned-ips", requireAdmin, async (req, res) => {
    try {
      const bannedIPs = await storage.getAllBannedIPs();
      res.json(bannedIPs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banned IPs" });
    }
  });

  // Get banned emails
  app.get("/api/admin/banned-emails", requireAdmin, async (req, res) => {
    try {
      const bannedEmails = await storage.getAllBannedEmails();
      res.json(bannedEmails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banned emails" });
    }
  });

  // Ban IP address
  app.post("/api/admin/ban-ip", requireAdmin, async (req, res) => {
    try {
      const { ipAddress, reason } = req.body;
      const sessionUser = (req.session as any).user;
      
      if (!ipAddress || !reason) {
        return res.status(400).json({ message: "IP address and reason are required" });
      }

      const bannedIP = await storage.banIP(ipAddress, reason, sessionUser.id);
      
      // Terminate any active sessions from this IP (future enhancement)
      await storage.terminateSessionsByIP(ipAddress);
      
      res.json(bannedIP);
    } catch (error) {
      console.error("Failed to ban IP address:", error);
      res.status(500).json({ message: "Failed to ban IP address" });
    }
  });

  // Ban email address
  app.post("/api/admin/ban-email", requireAdmin, async (req, res) => {
    try {
      const { email, reason } = req.body;
      const sessionUser = (req.session as any).user;
      
      if (!email || !reason) {
        return res.status(400).json({ message: "Email and reason are required" });
      }

      const bannedEmail = await storage.banEmail(email, reason, sessionUser.id);
      
      // Automatically terminate all sessions for this banned email
      await storage.terminateSessionsByEmail(email);
      
      res.json(bannedEmail);
    } catch (error) {
      console.error("Failed to ban email address:", error);
      res.status(500).json({ message: "Failed to ban email address" });
    }
  });

  // Unban IP address
  app.delete("/api/admin/banned-ips/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.unbanIP(id);
      
      if (!success) {
        return res.status(404).json({ message: "Banned IP not found" });
      }
      
      res.json({ message: "IP address unbanned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban IP address" });
    }
  });

  // Unban email address
  app.delete("/api/admin/banned-emails/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.unbanEmail(id);
      
      if (!success) {
        return res.status(404).json({ message: "Banned email not found" });
      }
      
      res.json({ message: "Email address unbanned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban email address" });
    }
  });

  // Security Login Access Routes (Anti-DDoS Brute Force protection)
  app.get("/api/admin/security/locked-ips", requireAdmin, async (req, res) => {
    try {
      await storage.clearExpiredLocks(); // Clean up expired locks first
      const lockedIps = await storage.getLockedIps();
      res.json(lockedIps);
    } catch (error) {
      console.error("Error fetching locked IPs:", error);
      res.status(500).json({ message: "Failed to fetch locked IPs" });
    }
  });

  app.post("/api/admin/security/unlock-ip", requireAdmin, async (req, res) => {
    try {
      const { ipAddress } = req.body;
      if (!ipAddress) {
        return res.status(400).json({ message: "IP address is required" });
      }

      await storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: 0,
        lockedUntil: null,
        lastAttempt: new Date()
      });

      res.json({ message: "IP address unlocked successfully" });
    } catch (error) {
      console.error("Error unlocking IP:", error);
      res.status(500).json({ message: "Failed to unlock IP address" });
    }
  });






  // Rejection Reasons API
  app.get("/api/admin/rejection-reasons", requireAdminOrEmployee, async (req, res) => {
    try {
      const reasons = await storage.getRejectionReasons();
      res.json(reasons);
    } catch (error) {
      console.error("Error fetching rejection reasons:", error);
      res.status(500).json({ message: "Failed to fetch rejection reasons" });
    }
  });

  app.post("/api/admin/rejection-reasons", requireAdmin, async (req, res) => {
    try {
      const reasonData = insertRejectionReasonSchema.parse(req.body);
      const reason = await storage.createRejectionReason(reasonData);
      res.status(201).json(reason);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating rejection reason:", error);
      res.status(500).json({ message: "Failed to create rejection reason" });
    }
  });

  app.patch("/api/admin/rejection-reasons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const reason = await storage.updateRejectionReason(id, updateData);
      if (!reason) {
        return res.status(404).json({ message: "Rejection reason not found" });
      }
      res.json(reason);
    } catch (error) {
      console.error("Error updating rejection reason:", error);
      res.status(500).json({ message: "Failed to update rejection reason" });
    }
  });

  app.delete("/api/admin/rejection-reasons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteRejectionReason(id);
      if (!success) {
        return res.status(404).json({ message: "Rejection reason not found" });
      }
      res.json({ message: "Rejection reason deleted successfully" });
    } catch (error) {
      console.error("Error deleting rejection reason:", error);
      res.status(500).json({ message: "Failed to delete rejection reason" });
    }
  });

  app.get("/api/rejection-reasons", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reasons = await storage.getActiveRejectionReasons();
      res.json(reasons);
    } catch (error) {
      console.error("Error fetching active rejection reasons:", error);
      res.status(500).json({ message: "Failed to fetch rejection reasons" });
    }
  });

  // Local QR Code serving route
  app.get("/qr-code/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const path = await import('path');
      const fs = await import('fs');
      
      const fullPath = path.join(process.cwd(), 'public', 'qr-code', filePath);
      
      // Check if file exists
      if (!await fs.promises.access(fullPath).then(() => true).catch(() => false)) {
        return res.status(404).json({ error: "QR code not found" });
      }
      
      // Set proper headers for image serving
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      // Stream the file
      const readStream = fs.createReadStream(fullPath);
      readStream.pipe(res);
      
    } catch (error) {
      console.error("Error serving QR code:", error);
      return res.status(404).json({ error: "QR code not found" });
    }
  });

  // Object Storage Routes for QR Code Images (legacy support)
  app.get("/qr-codes/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.getQRCodeFile(`/qr-codes/${filePath}`);
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving QR code:", error);
      return res.status(404).json({ error: "QR code not found" });
    }
  });

  app.post("/api/admin/qr-codes/upload", requireAdmin, async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getQRCodeUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting QR code upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Local QR code file upload endpoint with old file deletion
  app.post("/api/admin/qr-codes/upload-local", requireAdmin, async (req, res) => {
    try {
      const multer = (await import('multer')).default;
      const path = await import('path');
      const fs = await import('fs');
      
      // Get the current QR code path from query parameter to delete old one
      const { currentQrPath } = req.query;
      
      // Configure multer for local file uploads
      const storage = multer.diskStorage({
        destination: async (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'public', 'qr-code');
          await fs.promises.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uuid = randomUUID();
          const ext = path.extname(file.originalname);
          cb(null, `${uuid}${ext}`);
        }
      });

      const upload = multer({ 
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'));
          }
        }
      }).single('file');

      upload(req, res, async (err) => {
        if (err) {
          console.error("Error uploading QR code:", err);
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Delete old QR code file if it exists
        if (currentQrPath && typeof currentQrPath === 'string') {
          try {
            console.log(`Attempting to delete old QR code: ${currentQrPath}`);
            let oldFilePath = '';
            
            if (currentQrPath.startsWith('qr-code/')) {
              // Direct path format: qr-code/filename.ext
              oldFilePath = path.join(process.cwd(), 'public', currentQrPath);
              console.log(`Direct path format detected: ${oldFilePath}`);
            } else if (currentQrPath.startsWith('local-qr-')) {
              // Local QR format: local-qr-{uuid}
              const uuid = currentQrPath.replace('local-qr-', '');
              console.log(`Local QR format detected, UUID: ${uuid}`);
              
              // Find the file with this UUID in the qr-code directory
              const qrDir = path.join(process.cwd(), 'public', 'qr-code');
              try {
                const files = await fs.promises.readdir(qrDir);
                console.log(`Files in QR directory: ${files.join(', ')}`);
                const oldFile = files.find(file => file.startsWith(uuid));
                if (oldFile) {
                  oldFilePath = path.join(qrDir, oldFile);
                  console.log(`Found matching file: ${oldFile}`);
                } else {
                  console.log(`No file found starting with UUID: ${uuid}`);
                }
              } catch (readDirError) {
                console.log(`Could not read QR directory: ${qrDir}`);
              }
            } else {
              console.log(`Unknown QR path format: ${currentQrPath}`);
            }
            
            if (oldFilePath) {
              const fileExists = await fs.promises.access(oldFilePath).then(() => true).catch(() => false);
              console.log(`File exists at ${oldFilePath}: ${fileExists}`);
              
              if (fileExists) {
                await fs.promises.unlink(oldFilePath);
                console.log(`Successfully deleted old QR code: ${oldFilePath}`);
              }
            }
          } catch (deleteError) {
            console.error("Error deleting old QR code:", deleteError);
            // Continue with upload even if deletion fails
          }
        } else {
          console.log(`No current QR path provided for deletion`);
        }

        const filename = path.parse(req.file.filename).name;
        res.json({ 
          uploadURL: `local-qr-${filename}`,
          localPath: `qr-code/${req.file.filename}`
        });
      });
    } catch (error) {
      console.error("Error in local QR code upload:", error);
      res.status(500).json({ error: "Failed to upload QR code" });
    }
  });

  app.post("/api/admin/qr-codes/normalize", requireAdmin, async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "Upload URL is required" });
      }

      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeQRCodePath(uploadURL);
      
      res.json({ normalizedPath });
    } catch (error) {
      console.error("Error normalizing QR code path:", error);
      res.status(500).json({ error: "Failed to normalize QR code path" });
    }
  });

  // Payment Gateway Admin Routes
  app.get("/api/admin/payment-gateways", requireAdmin, async (req, res) => {
    try {
      const gateways = await storage.getAllPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ error: "Failed to fetch payment gateways" });
    }
  });

  app.get("/api/admin/payment-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const gateway = await storage.getPaymentGatewayById(req.params.id);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });

  app.put("/api/admin/payment-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const { 
        displayName, 
        walletAddress, 
        qrCodeImagePath, 
        qrEnabled,
        instructions, 
        minDepositAmount, 
        maxDepositAmount, 
        minWithdrawalAmount, 
        maxWithdrawalAmount,
        isActive 
      } = req.body;

      // Normalize QR code path if it's a full URL
      let normalizedQRPath = qrCodeImagePath;
      if (qrCodeImagePath && qrCodeImagePath.startsWith("https://storage.googleapis.com/")) {
        const { ObjectStorageService } = await import("./objectStorage");
        const objectStorageService = new ObjectStorageService();
        normalizedQRPath = objectStorageService.normalizeQRCodePath(qrCodeImagePath);
      }

      const gateway = await storage.updatePaymentGateway(req.params.id, {
        displayName,
        walletAddress,
        qrCodeImagePath: normalizedQRPath,
        qrEnabled: qrEnabled !== undefined ? Boolean(qrEnabled) : true,
        instructions: typeof instructions === 'string' ? instructions : JSON.stringify(instructions),
        minDepositAmount: parseInt(minDepositAmount),
        maxDepositAmount: parseInt(maxDepositAmount),
        minWithdrawalAmount: parseInt(minWithdrawalAmount),
        maxWithdrawalAmount: parseInt(maxWithdrawalAmount),
        isActive
      });

      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      res.json(gateway);
    } catch (error) {
      console.error("Error updating payment gateway:", error);
      res.status(500).json({ error: "Failed to update payment gateway" });
    }
  });

  // Global Notifications Routes
  app.get("/api/global-notifications", async (req, res) => {
    try {
      const notifications = await storage.getActiveGlobalNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching global notifications:", error);
      res.status(500).json({ error: "Failed to fetch global notifications" });
    }
  });

  app.get("/api/admin/global-notifications", requireAdmin, async (req, res) => {
    try {
      const notifications = await storage.getAllGlobalNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching all global notifications:", error);
      res.status(500).json({ error: "Failed to fetch global notifications" });
    }
  });

  app.post("/api/admin/global-notifications", requireAdmin, async (req, res) => {
    try {
      const notification = await storage.createGlobalNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating global notification:", error);
      res.status(500).json({ error: "Failed to create global notification" });
    }
  });

  app.patch("/api/admin/global-notifications/:id", requireAdmin, async (req, res) => {
    try {
      const notification = await storage.updateGlobalNotification(req.params.id, req.body);
      if (!notification) {
        return res.status(404).json({ error: "Global notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error updating global notification:", error);
      res.status(500).json({ error: "Failed to update global notification" });
    }
  });

  app.delete("/api/admin/global-notifications/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteGlobalNotification(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Global notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting global notification:", error);
      res.status(500).json({ error: "Failed to delete global notification" });
    }
  });

  // Public Objects Route - Serve QR codes and other public assets
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }

      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      let file;
      
      // Try to get as QR code first (for qr-codes/ paths)
      if (filePath.startsWith('qr-codes/')) {
        try {
          file = await objectStorageService.getQRCodeFile(`/${filePath}`);
        } catch (error) {
          // If QR code lookup fails, try public object search
          console.log("QR code file not found, trying public object search:", error.message);
          file = await objectStorageService.searchPublicObject(filePath);
        }
      } else {
        // For non-QR paths, use public object search
        file = await objectStorageService.searchPublicObject(filePath);
      }
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Stream the file to response with proper headers
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving public object:", error);
      res.status(404).json({ error: "File not found" });
    }
  });

  // SOCIAL LINKS ROUTES
  // Public endpoint to get active social links for footer
  app.get("/api/social-links", async (req, res) => {
    try {
      const socialLinks = await storage.getActiveSocialLinks();
      res.json(socialLinks);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  // Admin endpoints for managing social links
  app.get("/api/admin/social-links", requireAdmin, async (req, res) => {
    try {
      const socialLinks = await storage.getAllSocialLinks();
      res.json(socialLinks);
    } catch (error) {
      console.error("Error fetching all social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  app.post("/api/admin/social-links", requireAdmin, async (req, res) => {
    try {
      const { name, url, isActive } = req.body;
      const socialLink = await storage.createSocialLink({ name, url, isActive });
      res.json(socialLink);
    } catch (error) {
      console.error("Error creating social link:", error);
      res.status(500).json({ message: "Failed to create social link" });
    }
  });

  app.put("/api/admin/social-links/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, isActive } = req.body;
      const socialLink = await storage.updateSocialLink(id, { name, url, isActive });
      if (!socialLink) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json(socialLink);
    } catch (error) {
      console.error("Error updating social link:", error);
      res.status(500).json({ message: "Failed to update social link" });
    }
  });

  app.delete("/api/admin/social-links/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSocialLink(id);
      if (!deleted) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json({ message: "Social link deleted successfully" });
    } catch (error) {
      console.error("Error deleting social link:", error);
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });

  // Profile picture upload routes
  // VPS-compatible direct file upload
  app.post("/api/profile/upload", (req, res) => {
    // Handle multer errors before processing
    uploadAvatar.single('file')(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "Image must be 300x300 pixels and up to 1MB" });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: "Invalid file format. Use JPG, PNG, GIF, or WebP" });
        }
        if (err.message && err.message.includes('Invalid file type')) {
          return res.status(400).json({ error: "Invalid file format. Use JPG, PNG, GIF, or WebP" });
        }
        return res.status(400).json({ error: "File upload failed" });
      }

      try {
        const user = (req.session as any)?.user;
        if (!user) {
          return res.status(401).json({ message: "Not authenticated" });
        }

        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Process the image (resize to 300x300)
        const processedPath = await processAvatarImage(req.file.path);
        const relativePath = processedPath.replace(process.cwd() + '/public', '');
        
        // Update user's avatar in database
        const updatedUser = await storage.updateUserAvatar(user.id, relativePath);
        
        if (!updatedUser) {
          return res.status(500).json({ error: "Failed to update user avatar" });
        }

        // Update session with new user data
        (req.session as any).user = { ...user, avatar: relativePath };

        res.json({ 
          success: true, 
          avatarPath: relativePath,
          user: updatedUser 
        });
      } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ error: "Failed to upload avatar" });
      }
    });
  });

  // Keep object storage route for Replit deployment
  app.post("/api/profile/upload-url", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getProfilePictureUploadURL(user.id);
      
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/profile/avatar", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { avatarURL } = req.body;
      if (!avatarURL) {
        return res.status(400).json({ error: "Avatar URL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const avatarPath = objectStorageService.normalizeProfilePicturePath(avatarURL, user.id);
      
      // Update user's avatar in database
      const updatedUser = await storage.updateUserAvatar(user.id, avatarPath);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user avatar" });
      }

      // Update session with new user data
      (req.session as any).user = { ...user, avatar: avatarPath };
      
      res.json({ 
        avatarPath,
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });

  // Serve profile pictures
  app.get("/api/profile/avatar/:path(*)", async (req, res) => {
    try {
      const avatarPath = `/avatars/${req.params.path}`;
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.getProfilePictureFile(avatarPath);
      
      if (!file) {
        return res.status(404).json({ error: "Avatar not found" });
      }
      
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving avatar:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Avatar not found" });
      }
      res.status(500).json({ error: "Failed to serve avatar" });
    }
  });

  // Admin Referral Records API endpoints
  app.get("/api/admin/referral-records", requireAdmin, async (req, res) => {
    try {
      const { status = 'pending' } = req.query;
      
      // Get all referral commissions with user details
      const allCommissions = await db.select({
        id: refCommissions.id,
        referrerId: refCommissions.referrerId,
        referredUserId: refCommissions.referredUserId,
        orderId: refCommissions.orderId,
        referralAmount: refCommissions.referralAmount,
        status: refCommissions.status,
        createdAt: refCommissions.createdAt,
        updatedAt: refCommissions.updatedAt,
        referrerUsername: users.username,
        referrerFirstName: users.firstName,
        referrerLastName: users.lastName,
        referrerEmail: users.email,
      })
      .from(refCommissions)
      .innerJoin(users, eq(refCommissions.referrerId, users.id))
      .where(eq(refCommissions.status, status as string))
      .orderBy(desc(refCommissions.createdAt));

      // Get referred user details for each commission
      const commissionsWithDetails = await Promise.all(
        allCommissions.map(async (commission) => {
          const referredUser = await storage.getUser(commission.referredUserId);
          return {
            ...commission,
            referredUsername: referredUser?.username || 'Unknown',
            referredFirstName: referredUser?.firstName || 'Unknown',
            referredLastName: referredUser?.lastName || 'Unknown',
            referredEmail: referredUser?.email || 'Unknown',
          };
        })
      );

      res.json(commissionsWithDetails);
    } catch (error) {
      console.error("Error fetching referral records:", error);
      res.status(500).json({ message: "Failed to fetch referral records" });
    }
  });

  // Get referral stats for admin overview
  app.get("/api/admin/referral-stats", requireAdmin, async (req, res) => {
    try {
      const allCommissions = await db.select().from(refCommissions);
      
      const stats = {
        totalCommissions: allCommissions.length,
        pendingCommissions: allCommissions.filter(c => c.status === 'pending').length,
        paidCommissions: allCommissions.filter(c => c.status === 'paid').length,
        totalPaid: allCommissions
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + (c.referralAmount || 0), 0),
        totalPending: allCommissions
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + (c.referralAmount || 0), 0),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
