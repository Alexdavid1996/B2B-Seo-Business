import nodemailer from 'nodemailer';
import type { IStorage } from './storage';

export interface GuestPostReminderData {
  orderId: string;
  buyerName: string;
  sellerName: string;
  siteDomain: string;
  createdDate: string;
  orderLink: string;
}

export interface ExchangeReminderData {
  exchangeId: string;
  requesterName: string;
  partnerName: string;
  siteA: string;
  siteB: string;
  status: 'pending' | 'active';
  createdDate: string;
  exchangeLink: string;
}

class ReminderEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  private async initializeTransporter() {
    if (this.transporter) return this.transporter;

    try {
      // Get SMTP config from database
      const smtpConfig = await this.storage.getSmtpConfig();
      
      if (!smtpConfig || !smtpConfig.enabled) {
        throw new Error('SMTP is not enabled or configured');
      }

      // Get credentials from environment variables for security (same as email-service.ts)
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpConfig.smtpHost || !smtpConfig.smtpPort || !smtpUser || !smtpPass) {
        throw new Error(
          'SMTP configuration is incomplete. Check database settings and SMTP_USER/SMTP_PASS environment variables.'
        );
      }

      this.transporter = nodemailer.createTransport({
        host: smtpConfig.smtpHost,
        port: smtpConfig.smtpPort,
        secure: smtpConfig.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      return this.transporter;
    } catch (error) {
      console.error('Failed to initialize SMTP transporter:', error);
      throw error;
    }
  }

  private createGuestPostReminderTemplate(data: GuestPostReminderData, isForBuyer: boolean): { subject: string; html: string } {
    const subject = `Guest Post Reminder for ${data.siteDomain}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guest Post Order Reminder</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .order-card {
            background: #f8fafc;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .order-id {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 16px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
            min-width: 200px;
        }
        .cta-button:hover {
            background: #2563eb;
        }
        .footer {
            background: #f9fafb;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .logo {
            font-size: 20px;
            font-weight: bold;
            color: white;
            margin-bottom: 8px;
        }
        .reminder-notice {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 6px 6px 0;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
                gap: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Outmarkly</div>
            <h1>Guest Post Order Reminder</h1>
        </div>
        
        <div class="content">
            <div class="reminder-notice">
                <strong>⏰ Friendly Reminder:</strong> This is a follow-up regarding your ${isForBuyer ? 'guest post order' : 'guest post order'} that requires attention.
            </div>
            
            <p>Hello ${isForBuyer ? data.buyerName : data.sellerName},</p>
            
            <p>This is a gentle reminder about your guest post order that ${isForBuyer ? 'is currently in progress' : 'requires your attention'}. Our team wanted to follow up to ensure everything is moving smoothly.</p>
            
            <div class="order-card">
                <div class="order-id">Order #${data.orderId}</div>
                <div class="detail-row">
                    <span class="detail-label">${isForBuyer ? 'Purchased from:' : 'Sold to:'}</span>
                    <span class="detail-value">${isForBuyer ? data.sellerName : data.buyerName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Website:</span>
                    <span class="detail-value">${data.siteDomain}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span class="detail-value">${data.createdDate}</span>
                </div>
            </div>
            
            <p>${isForBuyer 
                ? `As the buyer, you may want to check the progress of your guest post order and communicate with ${data.sellerName} if needed.`
                : `As the seller, please ensure you're providing timely updates to ${data.buyerName} and delivering quality content as agreed.`
            }</p>
            
            <div style="text-align: center;">
                <a href="${data.orderLink}" class="cta-button">
                    View Order Details
                </a>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help ensure a successful collaboration.</p>
        </div>
        
        <div class="footer">
            <p><strong>Outmarkly</strong> - Your trusted platform for guest posts and link collaborations</p>
            <p>This is an automated reminder to help manage your order progress.</p>
        </div>
    </div>
</body>
</html>`;

    return { subject, html };
  }

  private createExchangeReminderTemplate(data: ExchangeReminderData, isForRequester: boolean): { subject: string; html: string } {
    const subject = `Link Collaboration Reminder for ${data.siteA} ↔ ${data.siteB}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Collaboration Reminder</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .exchange-card {
            background: #f0fdf4;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .exchange-id {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 16px;
        }
        .sites-exchange {
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: 600;
        }
        .exchange-arrow {
            color: #10b981;
            margin: 0 10px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #6b7280;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        .status-active {
            background: #d1fae5;
            color: #065f46;
        }
        .cta-button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
            min-width: 200px;
        }
        .cta-button:hover {
            background: #059669;
        }
        .footer {
            background: #f9fafb;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .logo {
            font-size: 20px;
            font-weight: bold;
            color: white;
            margin-bottom: 8px;
        }
        .reminder-notice {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 6px 6px 0;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
                gap: 4px;
            }
            .sites-exchange {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Outmarkly</div>
            <h1>Link Collaboration Reminder</h1>
        </div>
        
        <div class="content">
            <div class="reminder-notice">
                <strong>🔗 Friendly Reminder:</strong> This is a follow-up regarding your link collaboration that ${data.status === 'pending' ? 'is awaiting response' : 'is currently active'}.
            </div>
            
            <p>Hello ${isForRequester ? data.requesterName : data.partnerName},</p>
            
            <p>This is a gentle reminder about your link collaboration ${data.status === 'pending' ? 'that requires your attention' : 'that is currently in progress'}. Our team wanted to follow up to ensure everything is moving smoothly.</p>
            
            <div class="exchange-card">
                <div class="exchange-id">Collaboration #${data.exchangeId}</div>
                <div class="sites-exchange">
                    ${data.siteA} <span class="exchange-arrow">↔</span> ${data.siteB}
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isForRequester ? 'Partner:' : 'Requester:'}</span>
                    <span class="detail-value">${isForRequester ? data.partnerName : data.requesterName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="status-badge ${data.status === 'pending' ? 'status-pending' : 'status-active'}">
                            ${data.status}
                        </span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Collaboration Date:</span>
                    <span class="detail-value">${data.createdDate}</span>
                </div>
            </div>
            
            <p>${data.status === 'pending'
                ? (isForRequester 
                    ? `Your link collaboration request is still awaiting a response from ${data.partnerName}. You may want to reach out or wait for their reply.`
                    : `${data.requesterName} has sent you a link collaboration request that requires your attention. Please review and respond at your earliest convenience.`)
                : (isForRequester
                    ? `Your link collaboration with ${data.partnerName} is active. Please ensure you're fulfilling your part of the collaboration.`
                    : `Your link collaboration with ${data.requesterName} is active. Please ensure you're fulfilling your part of the collaboration.`)
            }</p>
            
            <div style="text-align: center;">
                <a href="${data.exchangeLink}" class="cta-button">
                    View Collaboration Details
                </a>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help ensure a successful collaboration.</p>
        </div>
        
        <div class="footer">
            <p><strong>Outmarkly</strong> - Your trusted platform for guest posts and link collaborations</p>
            <p>This is an automated reminder to help manage your collaboration progress.</p>
        </div>
    </div>
</body>
</html>`;

    return { subject, html };
  }

  // Send exchange reminder to both parties
  async sendExchangeReminder(requesterEmail: string, requestedEmail: string, data: ExchangeReminderData) {
    const results = {
      requester: null as any,
      requested: null as any
    };

    try {
      const transporter = await this.initializeTransporter();
      const smtpConfig = await this.storage.getSmtpConfig();
      
      if (!smtpConfig) {
        throw new Error('SMTP configuration not found');
      }

      // Send email to requester
      const requesterTemplate = this.createExchangeReminderTemplate(data, true);
      const requesterResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: requesterEmail,
        subject: requesterTemplate.subject,
        html: requesterTemplate.html,
      });
      results.requester = { success: true, messageId: requesterResult.messageId };

      // Send email to requested user
      const requestedTemplate = this.createExchangeReminderTemplate(data, false);
      const requestedResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: requestedEmail,
        subject: requestedTemplate.subject,
        html: requestedTemplate.html,
      });
      results.requested = { success: true, messageId: requestedResult.messageId };

    } catch (error) {
      console.error('Error sending exchange reminder emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!results.requester) results.requester = { success: false, error: errorMessage };
      if (!results.requested) results.requested = { success: false, error: errorMessage };
    }

    return results;
  }

  // Send guest post reminder to both parties
  async sendGuestPostReminder(buyerEmail: string, sellerEmail: string, data: GuestPostReminderData) {
    const results = {
      buyer: null as any,
      seller: null as any
    };

    try {
      const transporter = await this.initializeTransporter();
      const smtpConfig = await this.storage.getSmtpConfig();
      
      if (!smtpConfig) {
        throw new Error('SMTP configuration not found');
      }

      // Send email to buyer
      const buyerTemplate = this.createGuestPostReminderTemplate(data, true);
      const buyerResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: buyerEmail,
        subject: buyerTemplate.subject,
        html: buyerTemplate.html,
      });
      results.buyer = { success: true, messageId: buyerResult.messageId };

      // Send email to seller
      const sellerTemplate = this.createGuestPostReminderTemplate(data, false);
      const sellerResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: sellerEmail,
        subject: sellerTemplate.subject,
        html: sellerTemplate.html,
      });
      results.seller = { success: true, messageId: sellerResult.messageId };

    } catch (error) {
      console.error('Error sending guest post reminder emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!results.buyer) results.buyer = { success: false, error: errorMessage };
      if (!results.seller) results.seller = { success: false, error: errorMessage };
    }

    return results;
  }
}

export { ReminderEmailService };