import nodemailer from "nodemailer";
import { storage } from "./storage";

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async initTransporter() {
    const config = await storage.getSmtpConfig();

    if (!config || !config.enabled) {
      throw new Error("SMTP is not enabled or configured");
    }

    // Get credentials from environment variables for security
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!config.smtpHost || !config.smtpPort || !smtpUser || !smtpPass) {
      throw new Error(
        "SMTP configuration is incomplete. Check database settings and SMTP_USER/SMTP_PASS environment variables.",
      );
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendVerificationLink(email: string, token: string, firstName: string) {
    await this.initTransporter();

    if (!this.transporter) {
      throw new Error("Failed to initialize email transporter");
    }

    const config = await storage.getSmtpConfig();

    const mailOptions = {
      from: `"${config?.fromName || "OutMarkly"}" <${config?.fromEmail || "noreply@OutMarkly.com"}>`,
      to: email,
      subject: "Verify Your Email Address - OutMarkly",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">OutMarkly</h1>
            <p style="color: #666; margin: 5px 0;">#1 Guest Post & Collaboration Marketplace</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Email Verification Required</h2>
            <p style="color: #666; margin: 0 0 20px 0;">Hi ${firstName},</p>
            <p style="color: #666; margin: 0 0 20px 0;">
              Thank you for registering with OutMarkly! To complete your account setup and gain access to our platform, 
              please verify your email address by clicking the link below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BASE_URL || "http://localhost:5000"}/verify-email?token=${token}" 
                 style="background: #007bff; color: white; padding: 15px 30px; border-radius: 5px; font-size: 18px; font-weight: bold; text-decoration: none; display: inline-block;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${process.env.BASE_URL || "http://localhost:5000"}/verify-email?token=${token}" style="color: #007bff; word-break: break-all;">
                ${process.env.BASE_URL || "http://localhost:5000"}/verify-email?token=${token}
              </a>
            </p>

            <p style="color: #666; margin: 0 0 20px 0;">
              This verification link will expire in 1 hour. If you didn't create an account with OutMarkly, 
              please ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">
              © 2025 OutMarkly. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await this.transporter.sendMail(mailOptions);
    return result;
  }

  async sendPasswordResetLink(email: string, token: string, firstName: string) {
    await this.initTransporter();

    if (!this.transporter) {
      throw new Error("Failed to initialize email transporter");
    }

    const config = await storage.getSmtpConfig();

    const mailOptions = {
      from: `"${config?.fromName || "OutMarkly"}" <${config?.fromEmail || "noreply@OutMarkly.com"}>`,
      to: email,
      subject: "Reset Your Password - OutMarkly",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">OutMarkly</h1>
            <p style="color: #666; margin: 5px 0;">Link Exchange & Guest Post Platform</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Password Reset Request</h2>
            <p style="color: #666; margin: 0 0 20px 0;">Hi ${firstName},</p>
            <p style="color: #666; margin: 0 0 20px 0;">
              We received a request to reset your password for your OutMarkly account. 
              Click the button below to create a new password:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BASE_URL || "http://localhost:5000"}/auth/reset-password?token=${token}" 
                 style="background: #dc3545; color: white; padding: 15px 30px; border-radius: 5px; font-size: 18px; font-weight: bold; text-decoration: none; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${process.env.BASE_URL || "http://localhost:5000"}/auth/reset-password?token=${token}" style="color: #dc3545; word-break: break-all;">
                ${process.env.BASE_URL || "http://localhost:5000"}/auth/reset-password?token=${token}
              </a>
            </p>

            <p style="color: #666; margin: 0 0 20px 0;">
              This password reset link will expire in 1 hour. If you didn't request a password reset, 
              you can safely ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">
              © 2025 OutMarkly. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await this.transporter.sendMail(mailOptions);
    return result;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initTransporter();
      if (!this.transporter) return false;

      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("SMTP connection test failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
