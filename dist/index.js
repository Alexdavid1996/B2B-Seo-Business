var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminRecentActivity: () => adminRecentActivity,
  authSessionStore: () => authSessionStore,
  bannedEmails: () => bannedEmails,
  bannedIps: () => bannedIps,
  cryptoTxIds: () => cryptoTxIds,
  emailReminders: () => emailReminders,
  emailVerificationTokens: () => emailVerificationTokens,
  exchanges: () => exchanges,
  feeRecords: () => feeRecords,
  financeSettings: () => financeSettings,
  globalNotifications: () => globalNotifications,
  insertAdminRecentActivitySchema: () => insertAdminRecentActivitySchema,
  insertBannedEmailSchema: () => insertBannedEmailSchema,
  insertBannedIpSchema: () => insertBannedIpSchema,
  insertCryptoTxIdSchema: () => insertCryptoTxIdSchema,
  insertEmailReminderSchema: () => insertEmailReminderSchema,
  insertEmailVerificationTokenSchema: () => insertEmailVerificationTokenSchema,
  insertExchangeSchema: () => insertExchangeSchema,
  insertFeeRecordSchema: () => insertFeeRecordSchema,
  insertFinanceSettingSchema: () => insertFinanceSettingSchema,
  insertGlobalNotificationSchema: () => insertGlobalNotificationSchema,
  insertListingSchema: () => insertListingSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertPaymentGatewaySchema: () => insertPaymentGatewaySchema,
  insertRefCommissionSchema: () => insertRefCommissionSchema,
  insertRejectionReasonSchema: () => insertRejectionReasonSchema,
  insertSecurityLoginAccessSchema: () => insertSecurityLoginAccessSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertSiteCategorySchema: () => insertSiteCategorySchema,
  insertSiteSchema: () => insertSiteSchema,
  insertSmtpSystemSchema: () => insertSmtpSystemSchema,
  insertSocialLinkSchema: () => insertSocialLinkSchema,
  insertSupportMessageSchema: () => insertSupportMessageSchema,
  insertSupportNotificationSchema: () => insertSupportNotificationSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserDepositSessionSchema: () => insertUserDepositSessionSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSummaryStatsSchema: () => insertUserSummaryStatsSchema,
  insertWalletSchema: () => insertWalletSchema,
  insertWalletTransactionSchema: () => insertWalletTransactionSchema,
  listings: () => listings,
  messages: () => messages,
  notifications: () => notifications,
  orders: () => orders,
  passwordResetTokens: () => passwordResetTokens,
  paymentGateways: () => paymentGateways,
  refCommissions: () => refCommissions,
  rejectionReasons: () => rejectionReasons,
  securityLoginAccess: () => securityLoginAccess,
  settings: () => settings,
  siteCategories: () => siteCategories,
  sites: () => sites,
  smtpSystem: () => smtpSystem,
  socialLinks: () => socialLinks,
  supportMessages: () => supportMessages,
  supportNotifications: () => supportNotifications,
  supportTickets: () => supportTickets,
  transactions: () => transactions,
  userDepositSessions: () => userDepositSessions,
  userSummaryStats: () => userSummaryStats,
  users: () => users,
  walletTransactions: () => walletTransactions,
  wallets: () => wallets
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, siteCategories, sites, exchanges, messages, notifications, listings, wallets, orders, transactions, paymentGateways, walletTransactions, userDepositSessions, refCommissions, supportMessages, supportTickets, supportNotifications, feeRecords, settings, rejectionReasons, adminRecentActivity, smtpSystem, emailVerificationTokens, passwordResetTokens, emailReminders, insertUserSchema, insertSiteSchema, insertExchangeSchema, insertMessageSchema, insertNotificationSchema, insertListingSchema, insertWalletSchema, insertOrderSchema, insertTransactionSchema, insertPaymentGatewaySchema, insertWalletTransactionSchema, insertUserDepositSessionSchema, insertSupportMessageSchema, sanitizeSubject, insertSupportTicketSchema, insertSupportNotificationSchema, insertRefCommissionSchema, insertSettingSchema, insertSiteCategorySchema, insertFeeRecordSchema, insertEmailReminderSchema, financeSettings, insertFinanceSettingSchema, insertRejectionReasonSchema, insertAdminRecentActivitySchema, insertSmtpSystemSchema, insertEmailVerificationTokenSchema, insertPasswordResetTokenSchema, securityLoginAccess, insertSecurityLoginAccessSchema, socialLinks, insertSocialLinkSchema, bannedIps, bannedEmails, userSummaryStats, insertBannedIpSchema, insertBannedEmailSchema, insertUserSummaryStatsSchema, globalNotifications, insertGlobalNotificationSchema, cryptoTxIds, insertCryptoTxIdSchema, authSessionStore;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      company: text("company"),
      bio: text("bio"),
      avatar: text("avatar"),
      status: text("status").default("active"),
      // active, banned
      role: text("role").default("user"),
      // user, admin, employee
      emailVerified: boolean("email_verified").notNull().default(false),
      // Email verification status
      referredBy: varchar("referred_by").references(() => users.id),
      // User who referred this user
      registrationIp: text("registration_ip"),
      // IP address when user registered
      lastLoginIp: text("last_login_ip"),
      // IP address from last login
      lastLoginAt: timestamp("last_login_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    siteCategories = pgTable("site_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      slug: text("slug").notNull().unique(),
      createdAt: timestamp("created_at").defaultNow()
    });
    sites = pgTable("sites", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      domain: text("domain").notNull(),
      title: text("title").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      domainAuthority: integer("domain_authority").notNull(),
      drScore: integer("dr_score").notNull(),
      monthlyTraffic: integer("monthly_traffic").notNull(),
      language: text("language").notNull().default("English"),
      purpose: text("purpose").notNull().default("exchange"),
      // exchange, sales, both
      linkType: text("link_type").notNull().default("dofollow"),
      // dofollow, nofollow
      casinoAllowed: text("casino_allowed").default("N/A"),
      // yes, no, N/A
      price: integer("price"),
      // Price in cents (for sales purpose)
      deliveryTime: integer("delivery_time"),
      // Days for delivery (for sales purpose)
      purchaseCount: integer("purchase_count").notNull().default(0),
      // Total completed guest post purchases
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected, blacklisted
      rejectionReason: text("rejection_reason"),
      // Reason for rejection/blacklisting
      approvedBy: text("approved_by"),
      // Username of employee who approved
      rejectedBy: text("rejected_by"),
      // Username of employee who rejected
      processedBy: varchar("processed_by").references(() => users.id),
      // Admin who processed
      processedAt: timestamp("processed_at"),
      // When approved/rejected
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    exchanges = pgTable("exchanges", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").unique(),
      // Unique order ID like #EX0001
      requesterId: varchar("requester_id").notNull().references(() => users.id),
      requestedUserId: varchar("requested_user_id").notNull().references(() => users.id),
      requesterSiteId: varchar("requester_site_id").notNull().references(() => sites.id),
      requestedSiteId: varchar("requested_site_id").notNull().references(() => sites.id),
      status: text("status").notNull().default("pending"),
      // pending, active, delivered, completed, cancelled, declined, rejected
      message: text("message"),
      deliveryUrl: text("delivery_url"),
      // URL where content was published
      requesterCompleted: boolean("requester_completed").notNull().default(false),
      // Requester marked as completed
      requestedUserCompleted: boolean("requested_user_completed").notNull().default(false),
      // Requested user marked as completed
      deliveredBy: varchar("delivered_by").references(() => users.id),
      // Who marked as delivered
      deliveredAt: timestamp("delivered_at"),
      // When marked as delivered
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      exchangeId: varchar("exchange_id").references(() => exchanges.id),
      orderId: varchar("order_id").references(() => orders.id),
      senderId: varchar("sender_id").notNull().references(() => users.id),
      content: text("content").notNull(),
      isRead: boolean("is_read").notNull().default(false),
      readBy: varchar("read_by").references(() => users.id),
      // Who read the message
      readAt: timestamp("read_at"),
      // When it was read
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // exchange_request, exchange_accepted, exchange_denied, exchange_cancelled, message
      title: text("title").notNull(),
      message: text("message").notNull(),
      isRead: boolean("is_read").notNull().default(false),
      relatedEntityId: varchar("related_entity_id"),
      // exchange id or message id
      section: text("section"),
      // "exchange" or "guest_post"
      subTab: text("sub_tab"),
      // "ongoing", "completed", "declined", etc.
      priority: text("priority").default("normal"),
      // "normal", "high", "urgent"
      createdAt: timestamp("created_at").defaultNow()
    });
    listings = pgTable("listings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      siteId: varchar("site_id").notNull().references(() => sites.id),
      type: text("type").notNull(),
      // "guest_post" or "link_placement"
      price: integer("price").notNull(),
      // Price in cents
      serviceFee: integer("service_fee").notNull(),
      // 5% fee in cents
      isActive: boolean("is_active").notNull().default(true),
      requirements: text("requirements"),
      // Special requirements or guidelines
      turnaroundTime: integer("turnaround_time"),
      // Days
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    wallets = pgTable("wallets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id).unique(),
      balance: integer("balance").notNull().default(0),
      // Balance in cents
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orders = pgTable("orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").unique(),
      // Unique order ID like #ORDER-001
      buyerId: varchar("buyer_id").notNull().references(() => users.id),
      sellerId: varchar("seller_id").notNull().references(() => users.id),
      listingId: varchar("listing_id").notNull().references(() => listings.id),
      amount: integer("amount").notNull(),
      // Total amount paid in cents
      serviceFee: integer("service_fee").notNull(),
      // Platform fee in cents
      sellerAmount: integer("seller_amount").notNull(),
      // Amount seller receives in cents
      status: text("status").notNull().default("pending"),
      // pending, accepted, in_progress, delivered, completed, cancelled
      requirements: text("requirements"),
      // Buyer's specific requirements
      googleDocLink: text("google_doc_link"),
      // Google Doc link provided by buyer
      targetLink: text("target_link"),
      // Target URL where link should point
      deliveryUrl: text("delivery_url"),
      // URL where content was published
      buyerCompleted: boolean("buyer_completed").notNull().default(false),
      // Buyer confirmed completion
      sellerDelivered: boolean("seller_delivered").notNull().default(false),
      // Seller marked as delivered
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    transactions = pgTable("transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      transactionId: varchar("transaction_id").unique().notNull(),
      // Display ID like TX-ABC123, WD-XYZ789
      userId: varchar("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // "deposit", "purchase", "earning", "withdrawal"
      amount: integer("amount").notNull(),
      // Amount in cents
      description: text("description").notNull(),
      orderId: varchar("order_id").references(() => orders.id),
      // If related to an order
      createdAt: timestamp("created_at").defaultNow()
    });
    paymentGateways = pgTable("payment_gateways", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      displayName: text("display_name").notNull(),
      type: text("type").notNull(),
      // 'crypto', 'credit_card', 'bank_transfer', etc.
      isActive: boolean("is_active").notNull().default(true),
      settings: text("settings"),
      // JSON string for gateway-specific settings
      walletAddress: text("wallet_address"),
      // Wallet address for crypto payments
      qrCodeImagePath: text("qr_code_image_path"),
      // Path to QR code image in object storage
      qrEnabled: boolean("qr_enabled").notNull().default(true),
      // Whether to show QR code to users
      instructions: text("instructions"),
      // JSON array of instruction steps
      minDepositAmount: integer("min_deposit_amount").notNull().default(500),
      // Minimum deposit in cents ($5.00)
      maxDepositAmount: integer("max_deposit_amount").notNull().default(1e5),
      // Maximum deposit in cents ($1000.00)
      minWithdrawalAmount: integer("min_withdrawal_amount").notNull().default(500),
      // Minimum withdrawal in cents ($5.00)
      maxWithdrawalAmount: integer("max_withdrawal_amount").notNull().default(1e5),
      // Maximum withdrawal in cents ($1000.00)
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    walletTransactions = pgTable("wallet_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      transactionId: varchar("transaction_id").unique().notNull(),
      // Display ID like #TXN-001
      userId: varchar("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // "top_up", "withdrawal"
      amount: integer("amount").notNull(),
      // Amount in cents
      fee: integer("fee").notNull().default(0),
      // Processing fee in cents
      status: text("status").notNull().default("processing"),
      // "processing", "approved", "failed"
      gatewayId: varchar("gateway_id").references(() => paymentGateways.id),
      paymentMethod: text("payment_method"),
      // For top-ups: "bank_transfer", "card", etc.
      withdrawalMethod: text("withdrawal_method"),
      // For withdrawals: "bank_account", "paypal", etc.
      txId: text("tx_id"),
      // User-provided transaction ID for crypto deposits
      adminNote: text("admin_note"),
      // Admin's note on approval/rejection
      rejectionReason: text("rejection_reason"),
      // Detailed rejection reason from finance_settings
      processedBy: varchar("processed_by").references(() => users.id),
      // Admin who processed
      processedAt: timestamp("processed_at"),
      // When admin processed
      approvedBy: text("approved_by"),
      // Username of employee who approved
      rejectedBy: text("rejected_by"),
      // Username of employee who rejected
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userDepositSessions = pgTable("user_deposit_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      sessionId: varchar("session_id").notNull().unique(),
      amount: integer("amount").notNull(),
      // Amount in cents
      walletAddress: varchar("wallet_address").notNull(),
      qrCodeData: text("qr_code_data").notNull(),
      instructions: text("instructions").notNull(),
      expiresAt: timestamp("expires_at").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    refCommissions = pgTable("ref_commissions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      referrerId: varchar("referrer_id").notNull().references(() => users.id),
      // User who made the referral
      referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
      // User who was referred
      orderId: varchar("order_id").references(() => orders.id),
      // First order that triggered the commission
      referralAmount: integer("referral_amount").notNull().default(300),
      // Commission amount in cents (3 USDT = 300 cents)
      status: text("status").notNull().default("pending"),
      // pending, paid
      referredUserName: text("referred_user_name").notNull(),
      // Store name for history display
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    supportMessages = pgTable("support_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      ticketId: varchar("ticket_id").notNull(),
      // Groups messages into tickets
      subject: text("subject"),
      // Only for first message in ticket
      message: text("message").notNull(),
      sender: text("sender").notNull(),
      // "user" or "admin"
      isRead: boolean("is_read").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    supportTickets = pgTable("support_tickets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ticketNumber: varchar("ticket_number").notNull().unique(),
      // e.g., #T001
      userId: varchar("user_id").notNull().references(() => users.id),
      subject: text("subject").notNull(),
      description: text("description").notNull(),
      status: text("status").notNull().default("open"),
      // open, replied, investigating, resolved, closed
      priority: text("priority").notNull().default("medium"),
      // low, medium, high, urgent
      category: text("category").notNull().default("general"),
      // general, technical, billing, account
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      closedAt: timestamp("closed_at"),
      closedBy: varchar("closed_by").references(() => users.id)
    });
    supportNotifications = pgTable("support_notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id),
      type: text("type").notNull(),
      // "reply", "status_change"
      metadata: text("metadata"),
      // JSON string for storing additional data like status
      isRead: boolean("is_read").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    feeRecords = pgTable("fee_records", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      feeType: text("fee_type").notNull(),
      // "top_up", "withdrawal", "seller_domain_fee"
      username: text("username").notNull(),
      email: text("email").notNull(),
      amount: integer("amount").notNull(),
      // fee value in cents
      originalAmount: integer("original_amount"),
      // optional - original transaction amount
      dateTime: timestamp("date_time").defaultNow(),
      // UTC timestamp
      referenceId: text("reference_id").notNull(),
      // transaction ID, domain ID, etc.
      status: text("status").notNull().default("success"),
      // always "success" for approved fees
      createdAt: timestamp("created_at").defaultNow()
    });
    settings = pgTable("settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      description: text("description"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    rejectionReasons = pgTable("rejection_reasons", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      reasonText: text("reason_text").notNull(),
      description: text("description"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    adminRecentActivity = pgTable("admin_recent_activity", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: text("type").notNull(),
      // 'signup', 'login', 'transaction', etc.
      data: text("data"),
      // JSON string containing activity details
      createdAt: timestamp("created_at").defaultNow()
    });
    smtpSystem = pgTable("smtp_system", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      enabled: boolean("enabled").notNull().default(false),
      requireEmailVerification: boolean("require_email_verification").notNull().default(true),
      // Whether email verification is required after registration
      smtpHost: text("smtp_host"),
      // SMTP server address (e.g., smtp.gmail.com)
      smtpPort: integer("smtp_port"),
      // SMTP port (e.g., 587)
      // Note: smtpUser and smtpPass are now stored securely in environment variables SMTP_USER and SMTP_PASS
      fromEmail: text("from_email"),
      // Sender email
      fromName: text("from_name"),
      // Sender name
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    emailVerificationTokens = pgTable("email_verification_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      email: text("email").notNull(),
      token: varchar("token").notNull().unique(),
      // Unique verification token
      isUsed: boolean("is_used").notNull().default(false),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      email: text("email").notNull(),
      token: varchar("token").notNull().unique(),
      // Unique reset token
      isUsed: boolean("is_used").notNull().default(false),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    emailReminders = pgTable("email_reminders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: text("type").notNull(),
      // "guest_post" or "exchange"
      orderId: varchar("order_id"),
      // For guest post orders
      exchangeId: varchar("exchange_id"),
      // For exchanges
      status: text("status").notNull(),
      // Current status when reminder was sent
      sentBy: varchar("sent_by").notNull().references(() => users.id),
      // Admin who sent the reminder
      recipientEmails: text("recipient_emails").notNull(),
      // JSON array of emails sent to
      emailResults: text("email_results"),
      // JSON object with send results
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      username: z.string().min(1, "Username is required").max(30, "Username must be 30 characters or less").refine(
        (username) => !/[<>\"'&]/.test(username),
        "Username contains invalid characters"
      ),
      email: z.string().email("Invalid email format").max(255, "Email must be 255 characters or less"),
      firstName: z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less").refine(
        (name) => !/[<>\"'&]/.test(name),
        "First name contains invalid characters"
      ),
      lastName: z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less").refine(
        (name) => !/[<>\"'&]/.test(name),
        "Last name contains invalid characters"
      ),
      company: z.string().max(100, "Company must be 100 characters or less").refine(
        (company) => !company || !/[<>\"'&]/.test(company),
        "Company contains invalid characters"
      ).optional(),
      bio: z.string().max(500, "Bio must be 500 characters or less").refine(
        (bio) => !bio || !/[<>\"'&]/.test(bio),
        "Bio contains invalid characters"
      ).optional()
    });
    insertSiteSchema = createInsertSchema(sites).omit({
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      domain: z.string().min(1, "Domain is required").max(40, "Domain must be 40 characters or less").refine(
        (domain) => domain.includes("."),
        "Please enter a valid domain"
      ).refine(
        (domain) => !/[<>\"'&]/.test(domain),
        "Domain contains invalid characters"
      ),
      title: z.string().min(1, "Title is required").max(30, "Title must be 30 characters or less").refine(
        (title) => !/[<>\"'&]/.test(title),
        "Title contains invalid characters"
      ),
      description: z.string().max(500, "Description must be 500 characters or less").refine(
        (desc2) => !desc2 || !/[<>\"'&]/.test(desc2),
        "Description contains invalid characters"
      ).optional(),
      monthlyTraffic: z.number().min(0).max(5999999, "Monthly traffic must be less than 6,000,000")
    });
    insertExchangeSchema = createInsertSchema(exchanges).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true
    }).extend({
      content: z.string().min(1, "Message cannot be empty").max(2e3, "Message must be 2000 characters or less").refine(
        (content) => !/[<>\"'&]/.test(content),
        "Message contains invalid characters"
      )
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertListingSchema = createInsertSchema(listings).omit({
      id: true,
      userId: true,
      serviceFee: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      requirements: z.string().max(500, "Requirements must be 500 characters or less").refine(
        (req) => !req || !/[<>\"'&]/.test(req),
        "Requirements contain invalid characters"
      ).optional()
    });
    insertWalletSchema = createInsertSchema(wallets).omit({
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      serviceFee: true,
      sellerAmount: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      requirements: z.string().max(500, "Requirements must be 500 characters or less").refine(
        (req) => !req || !/[<>\"'&]/.test(req),
        "Requirements contain invalid characters"
      ).optional(),
      googleDocLink: z.string().max(500, "Google Doc link must be 500 characters or less").refine(
        (link) => !link || !/[<>\"'&]/.test(link),
        "Google Doc link contains invalid characters"
      ).optional(),
      targetLink: z.string().max(500, "Target link must be 500 characters or less").refine(
        (link) => !link || !/[<>\"'&]/.test(link),
        "Target link contains invalid characters"
      ).optional()
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      transactionId: true,
      createdAt: true
    });
    insertPaymentGatewaySchema = createInsertSchema(paymentGateways).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
      id: true,
      transactionId: true,
      processedBy: true,
      processedAt: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserDepositSessionSchema = createInsertSchema(userDepositSessions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
      id: true,
      createdAt: true
    });
    sanitizeSubject = (subject) => {
      const cleaned = subject.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
      const noUrls = cleaned.replace(/(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,})/gi, "");
      const textOnly = noUrls.replace(/[^a-zA-Z0-9\s\.\,\!\?\-]/g, "");
      return textOnly.trim().substring(0, 30);
    };
    insertSupportTicketSchema = createInsertSchema(supportTickets, {
      subject: z.string().min(1, "Subject is required").max(30, "Subject must be 30 characters or less").transform(sanitizeSubject).refine((val) => val.length >= 5, "Subject must be at least 5 characters after sanitization"),
      description: z.string().min(1, "Description is required").max(2e3, "Description too long"),
      status: z.enum(["open", "replied", "investigating", "resolved", "closed"]),
      priority: z.enum(["low", "medium", "high", "urgent"]),
      category: z.enum(["general", "technical", "billing", "account"])
    }).omit({
      id: true,
      ticketNumber: true,
      createdAt: true,
      updatedAt: true,
      closedAt: true,
      closedBy: true
    });
    insertSupportNotificationSchema = createInsertSchema(supportNotifications).omit({
      id: true,
      createdAt: true
    });
    insertRefCommissionSchema = createInsertSchema(refCommissions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSettingSchema = createInsertSchema(settings).omit({
      id: true,
      updatedAt: true
    });
    insertSiteCategorySchema = createInsertSchema(siteCategories).omit({
      id: true,
      createdAt: true
    });
    insertFeeRecordSchema = createInsertSchema(feeRecords).omit({
      id: true,
      createdAt: true
    });
    insertEmailReminderSchema = createInsertSchema(emailReminders).omit({
      id: true,
      createdAt: true
    });
    financeSettings = pgTable("finance_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      reason: text("reason").notNull(),
      type: text("type").notNull(),
      // "deposit" or "withdrawal"
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertFinanceSettingSchema = createInsertSchema(financeSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRejectionReasonSchema = createInsertSchema(rejectionReasons).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAdminRecentActivitySchema = createInsertSchema(adminRecentActivity).omit({
      id: true,
      createdAt: true
    });
    insertSmtpSystemSchema = createInsertSchema(smtpSystem).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({
      id: true,
      createdAt: true
    });
    insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
      id: true,
      createdAt: true
    });
    securityLoginAccess = pgTable("security_login_access", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ipAddress: text("ip_address").notNull(),
      attemptCount: integer("attempt_count").notNull().default(1),
      lastAttempt: timestamp("last_attempt").defaultNow(),
      lockedUntil: timestamp("locked_until"),
      lastEmail: text("last_email"),
      // Last email attempted for login from this IP
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSecurityLoginAccessSchema = createInsertSchema(securityLoginAccess).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    socialLinks = pgTable("social_links", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      // e.g., "Facebook", "Twitter", "LinkedIn"
      url: text("url").notNull(),
      // Social media URL
      isActive: boolean("is_active").notNull().default(true),
      // Controls visibility
      createdAt: timestamp("created_at").defaultNow()
    });
    insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
      id: true,
      createdAt: true
    });
    bannedIps = pgTable("banned_ips", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ipAddress: text("ip_address").notNull().unique(),
      reason: text("reason"),
      bannedBy: varchar("banned_by").references(() => users.id),
      // Admin who banned
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    bannedEmails = pgTable("banned_emails", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      reason: text("reason"),
      bannedBy: varchar("banned_by").references(() => users.id),
      // Admin who banned
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userSummaryStats = pgTable("user_summary_stats", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id).unique(),
      totalSales: integer("total_sales").notNull().default(0),
      // Completed guest post orders sold
      totalPurchases: integer("total_purchases").notNull().default(0),
      // Completed guest post orders purchased  
      totalExchanges: integer("total_exchanges").notNull().default(0),
      // Completed link exchanges
      activeDomains: integer("active_domains").notNull().default(0),
      // Approved sites
      walletBalance: integer("wallet_balance").notNull().default(0),
      // Current wallet balance in cents
      lastUpdated: timestamp("last_updated").defaultNow()
    });
    insertBannedIpSchema = createInsertSchema(bannedIps);
    insertBannedEmailSchema = createInsertSchema(bannedEmails);
    insertUserSummaryStatsSchema = createInsertSchema(userSummaryStats);
    globalNotifications = pgTable("global_notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      message: text("message").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      notificationType: varchar("notification_type", { length: 50 }).default("announcement"),
      durationDays: integer("duration_days").default(30),
      flashTime: integer("flash_time").default(10),
      // Flash interval in seconds
      cycleTime: integer("cycle_time").default(8),
      // Cycle interval between notifications in seconds
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertGlobalNotificationSchema = createInsertSchema(globalNotifications).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      message: z.string().min(1, "Message is required").max(500, "Message must be 500 characters or less"),
      durationDays: z.number().min(1, "Duration must be at least 1 day").max(365, "Duration cannot exceed 365 days").optional()
    });
    cryptoTxIds = pgTable("crypto_txids", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      txId: text("tx_id").notNull().unique(),
      // User-provided transaction ID
      username: text("username").notNull(),
      // Username who submitted the TxID
      userId: varchar("user_id").notNull().references(() => users.id),
      walletTransactionId: varchar("wallet_transaction_id").notNull().references(() => walletTransactions.id),
      createdAt: timestamp("created_at").defaultNow()
      // System time from settings
    });
    insertCryptoTxIdSchema = createInsertSchema(cryptoTxIds).omit({
      id: true,
      createdAt: true
    });
    authSessionStore = pgTable("auth_session_store", {
      sid: varchar("sid").primaryKey(),
      sess: text("sess").notNull(),
      expire: timestamp("expire").notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Add connection pool settings for production
      max: 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 2e3
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/transaction-id-generator.ts
function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function generateTransactionId(type) {
  const prefixes = {
    top_up: "TX",
    withdrawal: "WD",
    seller_fee: "SF"
  };
  const prefix = prefixes[type];
  const randomPart = generateRandomString(6);
  return `${prefix}-${randomPart}`;
}
var init_transaction_id_generator = __esm({
  "server/transaction-id-generator.ts"() {
    "use strict";
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import {
  eq,
  and,
  sql as sql2,
  desc,
  or,
  asc,
  gte,
  lte,
  ne,
  ilike,
  count,
  isNotNull
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_transaction_id_generator();
    DatabaseStorage = class {
      constructor() {
        this.initializeData();
      }
      async initializeData() {
        try {
          const existingCategories = await this.getAllSiteCategories();
          if (existingCategories.length === 0) {
            const defaultCategories = [
              { name: "Technology", slug: "technology" },
              { name: "Business", slug: "business" },
              { name: "Finance", slug: "finance" },
              { name: "Healthcare", slug: "healthcare" },
              { name: "E-commerce", slug: "e-commerce" },
              { name: "Education", slug: "education" },
              { name: "Lifestyle", slug: "lifestyle" },
              { name: "Design", slug: "design" }
            ];
            for (const category of defaultCategories) {
              await this.createSiteCategory(category).catch(() => {
              });
            }
          }
        } catch (error) {
          console.error("Error initializing data:", error);
        }
      }
      // USER OPERATIONS
      async getUser(id) {
        try {
          const [user] = await db.select().from(users).where(eq(users.id, id));
          return user;
        } catch (error) {
          return void 0;
        }
      }
      async getUserById(id) {
        return this.getUser(id);
      }
      async getUserByEmail(email) {
        try {
          const [user] = await db.select().from(users).where(ilike(users.email, email));
          return user;
        } catch (error) {
          return void 0;
        }
      }
      async getUserByUsername(username) {
        try {
          const [user] = await db.select().from(users).where(eq(users.username, username));
          return user;
        } catch (error) {
          return void 0;
        }
      }
      async getAllUsers() {
        try {
          const usersWithWallets = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            company: users.company,
            bio: users.bio,
            avatar: users.avatar,
            status: users.status,
            role: users.role,
            registrationIp: users.registrationIp,
            lastLoginIp: users.lastLoginIp,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            walletBalance: wallets.balance
          }).from(users).leftJoin(wallets, eq(users.id, wallets.userId)).orderBy(desc(users.createdAt));
          return usersWithWallets.map((user) => ({
            ...user,
            wallet: user.walletBalance !== null ? { balance: user.walletBalance } : void 0,
            walletBalance: void 0
            // Remove the flat property
          }));
        } catch (error) {
          console.error("Error fetching users with wallets:", error);
          return [];
        }
      }
      async createUser(user) {
        const [newUser] = await db.insert(users).values({
          ...user,
          createdAt: /* @__PURE__ */ new Date(),
          // Ensure UTC timestamp
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        await this.createWallet(newUser.id);
        return newUser;
      }
      async updateUser(id, user) {
        try {
          const [updatedUser] = await db.update(users).set({ ...user, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
          return updatedUser;
        } catch (error) {
          return void 0;
        }
      }
      async updateUserAvatar(userId, avatarPath) {
        try {
          const [updatedUser] = await db.update(users).set({ avatar: avatarPath, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Error updating user avatar:", error);
          return void 0;
        }
      }
      async deleteUser(id) {
        try {
          await db.delete(users).where(eq(users.id, id));
          return true;
        } catch (error) {
          return false;
        }
      }
      async updateUserBalance(userId, action, amount) {
        try {
          const wallet = await this.getWallet(userId);
          if (!wallet) {
            await this.createWallet(userId);
          }
          const newBalance = action === "add" ? (wallet?.balance || 0) + amount : (wallet?.balance || 0) - amount;
          if (newBalance < 0) return false;
          await this.updateWalletBalance(userId, newBalance);
          await this.createTransaction({
            userId,
            type: action === "add" ? "deposit" : "withdrawal",
            amount,
            description: action === "add" ? "Admin balance adjustment" : "Admin balance deduction"
          });
          return true;
        } catch (error) {
          return false;
        }
      }
      // SITE OPERATIONS
      async getSite(id) {
        try {
          const [result] = await db.select({
            id: sites.id,
            userId: sites.userId,
            domain: sites.domain,
            title: sites.title,
            description: sites.description,
            category: sites.category,
            domainAuthority: sites.domainAuthority,
            drScore: sites.drScore,
            monthlyTraffic: sites.monthlyTraffic,
            language: sites.language,
            purpose: sites.purpose,
            linkType: sites.linkType,
            casinoAllowed: sites.casinoAllowed,
            price: sites.price,
            deliveryTime: sites.deliveryTime,
            status: sites.status,
            rejectionReason: sites.rejectionReason,
            purchaseCount: sites.purchaseCount,
            approvedBy: sites.approvedBy,
            rejectedBy: sites.rejectedBy,
            processedBy: sites.processedBy,
            processedAt: sites.processedAt,
            createdAt: sites.createdAt,
            updatedAt: sites.updatedAt,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              username: users.username,
              company: users.company,
              bio: users.bio,
              avatar: users.avatar,
              status: users.status,
              role: users.role,
              lastLoginAt: users.lastLoginAt,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt
            }
          }).from(sites).leftJoin(users, eq(sites.userId, users.id)).where(eq(sites.id, id));
          return result;
        } catch (error) {
          return void 0;
        }
      }
      async getSiteById(id) {
        return this.getSite(id);
      }
      async getSitesByUserId(userId) {
        try {
          return await db.select().from(sites).where(eq(sites.userId, userId)).orderBy(desc(sites.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getAllSites() {
        try {
          const sitesWithUsers = await db.select({
            id: sites.id,
            userId: sites.userId,
            domain: sites.domain,
            title: sites.title,
            description: sites.description,
            category: sites.category,
            domainAuthority: sites.domainAuthority,
            drScore: sites.drScore,
            monthlyTraffic: sites.monthlyTraffic,
            language: sites.language,
            purpose: sites.purpose,
            linkType: sites.linkType,
            casinoAllowed: sites.casinoAllowed,
            price: sites.price,
            deliveryTime: sites.deliveryTime,
            status: sites.status,
            rejectionReason: sites.rejectionReason,
            approvedBy: sites.approvedBy,
            rejectedBy: sites.rejectedBy,
            processedBy: sites.processedBy,
            processedAt: sites.processedAt,
            purchaseCount: sites.purchaseCount,
            createdAt: sites.createdAt,
            updatedAt: sites.updatedAt,
            ownerName: sql2`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            ownerUsername: users.username
          }).from(sites).leftJoin(users, eq(sites.userId, users.id)).orderBy(desc(sites.createdAt));
          return sitesWithUsers;
        } catch (error) {
          console.error("Error fetching sites:", error);
          return [];
        }
      }
      async getAllApprovedSites() {
        try {
          const result = await db.select({
            id: sites.id,
            domain: sites.domain,
            title: sites.title,
            category: sites.category,
            description: sites.description,
            domainAuthority: sites.domainAuthority,
            drScore: sites.drScore,
            monthlyTraffic: sites.monthlyTraffic,
            language: sites.language,
            status: sites.status,
            purpose: sites.purpose,
            linkType: sites.linkType,
            casinoAllowed: sites.casinoAllowed,
            rejectionReason: sites.rejectionReason,
            userId: sites.userId,
            purchaseCount: sites.purchaseCount,
            approvedBy: sites.approvedBy,
            rejectedBy: sites.rejectedBy,
            processedBy: sites.processedBy,
            processedAt: sites.processedAt,
            createdAt: sites.createdAt,
            updatedAt: sites.updatedAt,
            price: sites.price,
            deliveryTime: sites.deliveryTime,
            user: {
              id: users.id,
              username: users.username,
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName,
              company: users.company,
              bio: users.bio,
              avatar: users.avatar,
              status: users.status,
              role: users.role,
              lastLoginAt: users.lastLoginAt,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt
            }
          }).from(sites).leftJoin(users, eq(sites.userId, users.id)).where(eq(sites.status, "approved")).orderBy(desc(sites.createdAt));
          return result;
        } catch (error) {
          console.error("Error fetching approved sites:", error);
          return [];
        }
      }
      async createSite(site) {
        const normalizedDomain = this.normalizeDomain(site.domain);
        const existingSite = await this.checkDomainExistsInSites(
          site.userId,
          normalizedDomain,
          site.purpose
        );
        if (existingSite) {
          const purposeText = site.purpose === "sales" ? "guest post marketplace" : "Exchange program";
          let message = "";
          switch (existingSite.status) {
            case "pending":
              message = `Your site is under review for the ${purposeText}. Please wait for approval.`;
              break;
            case "approved":
              message = `Your site has been approved and is already active in the ${purposeText}.`;
              break;
            case "rejected":
              message = `This site was previously rejected for the ${purposeText}. Please contact support for details.`;
              break;
            default:
              message = `You've already added this site to the ${purposeText}. Please wait!`;
          }
          throw new Error(message);
        }
        const [newSite] = await db.insert(sites).values({
          ...site,
          domain: normalizedDomain,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newSite;
      }
      // Helper method to normalize domain (remove protocol, www, trailing slash)
      normalizeDomain(domain) {
        return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
      }
      // Check if domain already exists for user in sites table with the same purpose
      async checkDomainExistsInSites(userId, domain, purpose) {
        try {
          const normalizedDomain = this.normalizeDomain(domain);
          const conditions = [
            eq(sites.userId, userId),
            eq(sites.domain, normalizedDomain)
          ];
          if (purpose) {
            conditions.push(eq(sites.purpose, purpose));
          }
          const [existing] = await db.select().from(sites).where(and(...conditions));
          return existing || null;
        } catch (error) {
          return null;
        }
      }
      async updateSite(id, site) {
        try {
          const [updatedSite] = await db.update(sites).set({ ...site, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sites.id, id)).returning();
          return updatedSite;
        } catch (error) {
          return void 0;
        }
      }
      async incrementSitePurchaseCount(siteId) {
        try {
          console.log(
            `[PURCHASE COUNT] Incrementing purchase count for site: ${siteId}`
          );
          const result = await db.update(sites).set({
            purchaseCount: sql2`${sites.purchaseCount} + 1`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(sites.id, siteId)).returning();
          console.log(
            `[PURCHASE COUNT] Updated site ${siteId}, new purchase count: ${result[0]?.purchaseCount}`
          );
          return true;
        } catch (error) {
          console.error("Error incrementing site purchase count:", error);
          return false;
        }
      }
      async deleteSite(id) {
        try {
          await db.delete(listings).where(eq(listings.siteId, id));
          await db.delete(exchanges).where(eq(exchanges.requesterSiteId, id));
          await db.delete(exchanges).where(eq(exchanges.requestedSiteId, id));
          await db.delete(sites).where(eq(sites.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting site:", error);
          return false;
        }
      }
      async approveSite(id, employeeUsername) {
        try {
          const [site] = await db.select().from(sites).where(eq(sites.id, id));
          if (!site) {
            return void 0;
          }
          const user = await this.getUser(site.userId);
          if (!user) {
            return void 0;
          }
          const updatedSite = await this.updateSite(id, {
            status: "approved",
            approvedBy: employeeUsername ? `Approved by ${employeeUsername}` : null,
            processedAt: /* @__PURE__ */ new Date()
          });
          await this.createNotification({
            userId: site.userId,
            type: "site_approved",
            title: "Site Approved",
            message: `Your site "${site.domain}" has been approved and is now live on the platform`,
            isRead: false,
            relatedEntityId: site.id,
            section: "sites",
            subTab: "approved",
            priority: "high"
          });
          return updatedSite;
        } catch (error) {
          console.error("Error approving site:", error);
          return void 0;
        }
      }
      async rejectSite(id, reason, employeeUsername) {
        const [site] = await db.select().from(sites).where(eq(sites.id, id));
        if (site) {
          await this.createNotification({
            userId: site.userId,
            type: "site_rejected",
            title: "Site Rejected",
            message: `Your site "${site.domain}" has been rejected. Reason: ${reason}`,
            isRead: false,
            relatedEntityId: site.id,
            section: "sites",
            subTab: "rejected",
            priority: "high"
          });
        }
        return this.updateSite(id, {
          status: "rejected",
          rejectionReason: reason,
          rejectedBy: employeeUsername ? `Rejected by ${employeeUsername}` : null,
          processedAt: /* @__PURE__ */ new Date()
        });
      }
      // SITE CATEGORY OPERATIONS
      async getAllSiteCategories() {
        try {
          return await db.select().from(siteCategories).orderBy(siteCategories.name);
        } catch (error) {
          return [];
        }
      }
      async getSiteCategory(id) {
        try {
          const [category] = await db.select().from(siteCategories).where(eq(siteCategories.id, id));
          return category;
        } catch (error) {
          return void 0;
        }
      }
      async createSiteCategory(category) {
        try {
          const [newCategory] = await db.insert(siteCategories).values(category).returning();
          return newCategory;
        } catch (error) {
          if (error.code === "23505") {
            const existingCategory = await db.select().from(siteCategories).where(eq(siteCategories.name, category.name)).limit(1);
            if (existingCategory.length > 0) {
              return existingCategory[0];
            }
          }
          throw error;
        }
      }
      async updateSiteCategory(id, category) {
        try {
          const [updatedCategory] = await db.update(siteCategories).set(category).where(eq(siteCategories.id, id)).returning();
          return updatedCategory;
        } catch (error) {
          return void 0;
        }
      }
      async deleteSiteCategory(id) {
        try {
          await db.delete(siteCategories).where(eq(siteCategories.id, id));
          return true;
        } catch (error) {
          return false;
        }
      }
      // EXCHANGE OPERATIONS
      async getExchange(id) {
        try {
          const [exchange] = await db.select().from(exchanges).where(eq(exchanges.id, id));
          return exchange;
        } catch (error) {
          return void 0;
        }
      }
      async getExchangeById(id) {
        return this.getExchange(id);
      }
      async getExchangesByUserId(userId) {
        try {
          return await db.select().from(exchanges).where(
            sql2`${exchanges.requesterId} = ${userId} OR ${exchanges.requestedUserId} = ${userId}`
          ).orderBy(desc(exchanges.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getAllExchanges() {
        try {
          return await db.select().from(exchanges).orderBy(desc(exchanges.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getPendingExchanges() {
        try {
          return await db.select().from(sites).where(and(eq(sites.purpose, "exchange"), eq(sites.status, "pending"))).orderBy(desc(sites.createdAt));
        } catch (error) {
          return [];
        }
      }
      async createExchange(exchange) {
        const [newExchange] = await db.insert(exchanges).values({
          ...exchange,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newExchange;
      }
      async updateExchange(id, exchange) {
        try {
          const [updatedExchange] = await db.update(exchanges).set({ ...exchange, updatedAt: /* @__PURE__ */ new Date() }).where(eq(exchanges.id, id)).returning();
          return updatedExchange;
        } catch (error) {
          return void 0;
        }
      }
      async acceptExchange(id) {
        return this.updateExchange(id, { status: "active" });
      }
      async declineExchange(id) {
        return this.updateExchange(id, { status: "cancelled" });
      }
      async completeExchange(id, userId) {
        try {
          const exchange = await this.getExchange(id);
          if (!exchange) return void 0;
          const isRequester = exchange.requesterId === userId;
          const updateData = isRequester ? { requesterCompleted: true } : { requestedUserCompleted: true };
          if (isRequester && exchange.requestedUserCompleted || !isRequester && exchange.requesterCompleted) {
            updateData.status = "completed";
          }
          return this.updateExchange(id, updateData);
        } catch (error) {
          return void 0;
        }
      }
      // MESSAGE OPERATIONS
      async getMessagesByExchangeId(exchangeId) {
        try {
          return await db.select().from(messages).where(eq(messages.exchangeId, exchangeId)).orderBy(messages.createdAt);
        } catch (error) {
          return [];
        }
      }
      async getMessagesByOrderId(orderId) {
        try {
          return await db.select().from(messages).where(eq(messages.orderId, orderId)).orderBy(messages.createdAt);
        } catch (error) {
          return [];
        }
      }
      async createMessage(message) {
        const [newMessage] = await db.insert(messages).values({
          ...message,
          isRead: false,
          // New messages are unread by default
          createdAt: /* @__PURE__ */ new Date()
          // Ensure UTC timestamp
        }).returning();
        return newMessage;
      }
      // Mark messages as read when user opens chat
      async markMessagesAsRead(userId, exchangeId, orderId) {
        try {
          const conditions = [
            ne(messages.senderId, userId)
            // Don't mark own messages as read
          ];
          if (exchangeId) {
            conditions.push(eq(messages.exchangeId, exchangeId));
          }
          if (orderId) {
            conditions.push(eq(messages.orderId, orderId));
          }
          await db.update(messages).set({
            isRead: true,
            readBy: userId,
            readAt: /* @__PURE__ */ new Date()
          }).where(and(...conditions));
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
      // Get unread message count for a user
      async getUnreadMessageCount(userId) {
        try {
          const result = await db.select({ count: sql2`count(*)`.mapWith(Number) }).from(messages).leftJoin(exchanges, eq(messages.exchangeId, exchanges.id)).leftJoin(orders, eq(messages.orderId, orders.id)).where(
            and(
              ne(messages.senderId, userId),
              // Not sent by this user
              eq(messages.isRead, false),
              // Unread
              or(
                // Messages in exchanges where user is involved
                and(
                  isNotNull(messages.exchangeId),
                  or(
                    eq(exchanges.requesterId, userId),
                    eq(exchanges.requestedUserId, userId)
                  )
                ),
                // Messages in orders where user is involved
                and(
                  isNotNull(messages.orderId),
                  or(eq(orders.buyerId, userId), eq(orders.sellerId, userId))
                )
              )
            )
          );
          return result[0]?.count || 0;
        } catch (error) {
          console.error("Error getting unread message count:", error);
          return 0;
        }
      }
      // NOTIFICATION OPERATIONS
      async getNotification(id) {
        try {
          const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
          return notification || void 0;
        } catch (error) {
          console.error("Error fetching notification:", error);
          return void 0;
        }
      }
      async getNotificationsByUserId(userId) {
        try {
          return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        } catch (error) {
          return [];
        }
      }
      async createNotification(notification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
      }
      async markNotificationAsRead(id) {
        try {
          await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
          return true;
        } catch (error) {
          return false;
        }
      }
      async updateNotification(id, updates) {
        try {
          const [notification] = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
          return notification || null;
        } catch (error) {
          console.error("Error updating notification:", error);
          return null;
        }
      }
      async markAllNotificationsAsRead(userId) {
        try {
          await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
        } catch (error) {
          console.error("Error marking all notifications as read:", error);
          throw error;
        }
      }
      // LISTING OPERATIONS
      async getAllListings() {
        try {
          return await db.select().from(listings).where(eq(listings.isActive, true)).orderBy(desc(listings.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getListingById(id) {
        try {
          const [listing] = await db.select().from(listings).where(eq(listings.id, id));
          return listing;
        } catch (error) {
          return void 0;
        }
      }
      async getListingsByUserId(userId) {
        try {
          return await db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
        } catch (error) {
          return [];
        }
      }
      async createListing(listing) {
        const [newListing] = await db.insert(listings).values({
          ...listing,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newListing;
      }
      async updateListing(id, listing) {
        try {
          const [updatedListing] = await db.update(listings).set({ ...listing, updatedAt: /* @__PURE__ */ new Date() }).where(eq(listings.id, id)).returning();
          return updatedListing;
        } catch (error) {
          return void 0;
        }
      }
      async deleteListing(id) {
        try {
          await db.delete(listings).where(eq(listings.id, id));
          return true;
        } catch (error) {
          return false;
        }
      }
      // WALLET OPERATIONS
      async getWallet(userId) {
        try {
          const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
          return wallet ? { balance: wallet.balance, userId: wallet.userId } : void 0;
        } catch (error) {
          return void 0;
        }
      }
      async createWallet(userId) {
        const [newWallet] = await db.insert(wallets).values({
          userId,
          balance: 0,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return { balance: newWallet.balance, userId: newWallet.userId };
      }
      async updateWalletBalance(userId, amount) {
        const [updatedWallet] = await db.update(wallets).set({ balance: amount, updatedAt: /* @__PURE__ */ new Date() }).where(eq(wallets.userId, userId)).returning();
        return { balance: updatedWallet.balance, userId: updatedWallet.userId };
      }
      async addFunds(userId, amount, description) {
        try {
          const wallet = await this.getWallet(userId);
          if (!wallet) {
            await this.createWallet(userId);
          }
          const newBalance = (wallet?.balance || 0) + amount;
          await this.updateWalletBalance(userId, newBalance);
          await this.createTransaction({
            userId,
            type: "deposit",
            amount,
            description
          });
          return true;
        } catch (error) {
          return false;
        }
      }
      async deductFunds(userId, amount, description) {
        try {
          const wallet = await this.getWallet(userId);
          if (!wallet || wallet.balance < amount) {
            return false;
          }
          const newBalance = wallet.balance - amount;
          await this.updateWalletBalance(userId, newBalance);
          await this.createTransaction({
            userId,
            type: "purchase",
            amount: -amount,
            description
          });
          return true;
        } catch (error) {
          return false;
        }
      }
      // ORDER OPERATIONS
      async getAllOrders() {
        try {
          return await db.select().from(orders).orderBy(desc(orders.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getPendingOrders() {
        try {
          return await db.select().from(orders).where(eq(orders.status, "pending")).orderBy(desc(orders.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getOrderById(id) {
        try {
          const [order] = await db.select().from(orders).where(eq(orders.id, id));
          return order;
        } catch (error) {
          return void 0;
        }
      }
      async getOrdersByUserId(userId, type) {
        try {
          if (type === "buyer") {
            return await db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
          } else if (type === "seller") {
            return await db.select().from(orders).where(eq(orders.sellerId, userId)).orderBy(desc(orders.createdAt));
          } else {
            return await db.select().from(orders).where(or(eq(orders.buyerId, userId), eq(orders.sellerId, userId))).orderBy(desc(orders.createdAt));
          }
        } catch (error) {
          console.error("Error fetching orders by user ID:", error);
          return [];
        }
      }
      async createOrder(order) {
        const [newOrder] = await db.insert(orders).values(order).returning();
        return newOrder;
      }
      async updateOrder(id, order) {
        try {
          const [updatedOrder] = await db.update(orders).set({ ...order, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
          return updatedOrder;
        } catch (error) {
          return void 0;
        }
      }
      async acceptOrder(id) {
        return this.updateOrder(id, { status: "accepted" });
      }
      async declineOrder(id) {
        return this.updateOrder(id, { status: "cancelled" });
      }
      async completeOrder(id) {
        try {
          const [order] = await db.select().from(orders).where(eq(orders.id, id));
          if (!order) return void 0;
          const { sellerId, sellerAmount, serviceFee } = order;
          await this.addFunds(sellerId, sellerAmount, `Payment for order ${id}`);
          if (serviceFee > 0) {
            const seller = await this.getUser(sellerId);
            if (seller) {
              const generateShortId = () => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                let result = "SF-";
                for (let i = 0; i < 6; i++) {
                  result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
              };
              await this.createFeeRecord({
                feeType: "seller_domain_fee",
                username: seller.username,
                email: seller.email,
                amount: serviceFee,
                originalAmount: sellerAmount + serviceFee,
                referenceId: generateShortId(),
                status: "success"
              });
            }
          }
          try {
            await this.processReferralCommission(id, order.buyerId);
          } catch (referralError) {
            console.error("Error processing referral commission:", referralError);
          }
          return this.updateOrder(id, { status: "completed" });
        } catch (error) {
          return void 0;
        }
      }
      // PENDING ACTIVITIES OPERATIONS
      async getAllPendingActivities() {
        try {
          const buyerUsers = alias(users, "buyer");
          const sellerUsers = alias(users, "seller");
          const orderResults = await db.select({
            id: orders.id,
            displayId: orders.orderId,
            status: orders.status,
            amount: orders.amount,
            createdAt: orders.createdAt,
            buyerEmail: buyerUsers.email,
            sellerEmail: sellerUsers.email,
            domain: sites.domain
          }).from(orders).leftJoin(buyerUsers, eq(orders.buyerId, buyerUsers.id)).leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id)).leftJoin(listings, eq(orders.listingId, listings.id)).leftJoin(sites, eq(listings.siteId, sites.id)).where(
            sql2`${orders.status} IN ('pending', 'accepted', 'in_progress', 'on_going')`
          ).orderBy(desc(orders.createdAt));
          const requesterUsers = alias(users, "requester");
          const requestedUsers = alias(users, "requested");
          const requesterSites = alias(sites, "requester_site");
          const requestedSites = alias(sites, "requested_site");
          const exchangeResults = await db.select({
            id: exchanges.id,
            displayId: exchanges.orderId,
            status: exchanges.status,
            createdAt: exchanges.createdAt,
            requesterEmail: requesterUsers.email,
            requestedEmail: requestedUsers.email,
            requesterDomain: requesterSites.domain,
            requestedDomain: requestedSites.domain
          }).from(exchanges).leftJoin(requesterUsers, eq(exchanges.requesterId, requesterUsers.id)).leftJoin(
            requestedUsers,
            eq(exchanges.requestedUserId, requestedUsers.id)
          ).leftJoin(
            requesterSites,
            eq(exchanges.requesterSiteId, requesterSites.id)
          ).leftJoin(
            requestedSites,
            eq(exchanges.requestedSiteId, requestedSites.id)
          ).where(sql2`${exchanges.status} IN ('pending', 'active', 'delivered')`).orderBy(desc(exchanges.createdAt));
          const activities = [
            ...orderResults.map((order) => ({
              type: "order",
              id: order.id,
              displayId: order.displayId,
              status: order.status,
              amount: order.amount,
              createdAt: order.createdAt,
              buyerEmail: order.buyerEmail,
              sellerEmail: order.sellerEmail,
              domain: order.domain
            })),
            ...exchangeResults.map((exchange) => ({
              type: "exchange",
              id: exchange.id,
              displayId: exchange.displayId,
              status: exchange.status,
              createdAt: exchange.createdAt,
              requesterEmail: exchange.requesterEmail,
              requestedEmail: exchange.requestedEmail,
              domain: exchange.requesterDomain || exchange.requestedDomain,
              exchangeInfo: `${exchange.requesterDomain} \u2194 ${exchange.requestedDomain}`
            }))
          ];
          return activities.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } catch (error) {
          console.error("Error fetching pending activities:", error);
          return [];
        }
      }
      // New method for delivered activities
      async getDeliveredActivities() {
        try {
          const buyerUsers = alias(users, "buyer");
          const sellerUsers = alias(users, "seller");
          const orderResults = await db.select({
            id: orders.id,
            displayId: orders.orderId,
            status: orders.status,
            amount: orders.amount,
            createdAt: orders.createdAt,
            buyerEmail: buyerUsers.email,
            sellerEmail: sellerUsers.email,
            domain: sites.domain
          }).from(orders).leftJoin(buyerUsers, eq(orders.buyerId, buyerUsers.id)).leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id)).leftJoin(listings, eq(orders.listingId, listings.id)).leftJoin(sites, eq(listings.siteId, sites.id)).where(sql2`${orders.status} = 'completed'`).orderBy(desc(orders.createdAt));
          const requesterUsers = alias(users, "requester");
          const requestedUsers = alias(users, "requested");
          const requesterSites = alias(sites, "requester_site");
          const requestedSites = alias(sites, "requested_site");
          const exchangeResults = await db.select({
            id: exchanges.id,
            displayId: exchanges.orderId,
            status: exchanges.status,
            createdAt: exchanges.createdAt,
            requesterEmail: requesterUsers.email,
            requestedEmail: requestedUsers.email,
            requesterDomain: requesterSites.domain,
            requestedDomain: requestedSites.domain
          }).from(exchanges).leftJoin(requesterUsers, eq(exchanges.requesterId, requesterUsers.id)).leftJoin(
            requestedUsers,
            eq(exchanges.requestedUserId, requestedUsers.id)
          ).leftJoin(
            requesterSites,
            eq(exchanges.requesterSiteId, requesterSites.id)
          ).leftJoin(
            requestedSites,
            eq(exchanges.requestedSiteId, requestedSites.id)
          ).where(sql2`${exchanges.status} IN ('delivered', 'completed')`).orderBy(desc(exchanges.createdAt));
          const activities = [
            ...orderResults.map((order) => ({
              type: "order",
              id: order.id,
              displayId: order.displayId,
              status: order.status,
              amount: order.amount,
              createdAt: order.createdAt,
              buyerEmail: order.buyerEmail,
              sellerEmail: order.sellerEmail,
              domain: order.domain
            })),
            ...exchangeResults.map((exchange) => ({
              type: "exchange",
              id: exchange.id,
              displayId: exchange.displayId,
              status: exchange.status,
              createdAt: exchange.createdAt,
              requesterEmail: exchange.requesterEmail,
              requestedEmail: exchange.requestedEmail,
              domain: exchange.requesterDomain || exchange.requestedDomain,
              exchangeInfo: `${exchange.requesterDomain} \u2194 ${exchange.requestedDomain}`
            }))
          ];
          return activities.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } catch (error) {
          console.error("Error fetching delivered activities:", error);
          return [];
        }
      }
      // New method for rejected activities
      async getRejectedActivities() {
        try {
          const buyerUsers = alias(users, "buyer");
          const sellerUsers = alias(users, "seller");
          const orderResults = await db.select({
            id: orders.id,
            displayId: orders.orderId,
            status: orders.status,
            amount: orders.amount,
            createdAt: orders.createdAt,
            buyerEmail: buyerUsers.email,
            sellerEmail: sellerUsers.email,
            domain: sites.domain
          }).from(orders).leftJoin(buyerUsers, eq(orders.buyerId, buyerUsers.id)).leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id)).leftJoin(listings, eq(orders.listingId, listings.id)).leftJoin(sites, eq(listings.siteId, sites.id)).where(
            sql2`${orders.status} IN ('rejected', 'cancelled', 'declined', 'refunded')`
          ).orderBy(desc(orders.createdAt));
          const requesterUsers = alias(users, "requester");
          const requestedUsers = alias(users, "requested");
          const requesterSites = alias(sites, "requester_site");
          const requestedSites = alias(sites, "requested_site");
          const exchangeResults = await db.select({
            id: exchanges.id,
            displayId: exchanges.orderId,
            status: exchanges.status,
            createdAt: exchanges.createdAt,
            requesterEmail: requesterUsers.email,
            requestedEmail: requestedUsers.email,
            requesterDomain: requesterSites.domain,
            requestedDomain: requestedSites.domain
          }).from(exchanges).leftJoin(requesterUsers, eq(exchanges.requesterId, requesterUsers.id)).leftJoin(
            requestedUsers,
            eq(exchanges.requestedUserId, requestedUsers.id)
          ).leftJoin(
            requesterSites,
            eq(exchanges.requesterSiteId, requesterSites.id)
          ).leftJoin(
            requestedSites,
            eq(exchanges.requestedSiteId, requestedSites.id)
          ).where(
            sql2`${exchanges.status} IN ('rejected', 'cancelled', 'declined', 'refunded')`
          ).orderBy(desc(exchanges.createdAt));
          const activities = [
            ...orderResults.map((order) => ({
              type: "order",
              id: order.id,
              displayId: order.displayId,
              status: order.status,
              amount: order.amount,
              createdAt: order.createdAt,
              buyerEmail: order.buyerEmail,
              sellerEmail: order.sellerEmail,
              domain: order.domain
            })),
            ...exchangeResults.map((exchange) => ({
              type: "exchange",
              id: exchange.id,
              displayId: exchange.displayId,
              status: exchange.status,
              createdAt: exchange.createdAt,
              requesterEmail: exchange.requesterEmail,
              requestedEmail: exchange.requestedEmail,
              domain: exchange.requesterDomain || exchange.requestedDomain,
              exchangeInfo: `${exchange.requesterDomain} \u2194 ${exchange.requestedDomain}`
            }))
          ];
          return activities.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } catch (error) {
          console.error("Error fetching rejected activities:", error);
          return [];
        }
      }
      async deleteOrderWithRefund(orderId) {
        try {
          const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
          if (!order) {
            return { success: false, message: "Order not found" };
          }
          if (order.status === "completed") {
            return { success: false, message: "Cannot delete completed order" };
          }
          await db.delete(transactions).where(eq(transactions.orderId, orderId));
          await db.delete(messages).where(eq(messages.orderId, orderId));
          if (order.amount > 0) {
            await this.addFunds(
              order.buyerId,
              order.amount,
              `Refund for deleted order #${order.orderId || order.id}`
            );
            await this.createTransaction({
              userId: order.buyerId,
              type: "refund",
              amount: order.amount,
              description: `Refund for deleted order #${order.orderId || order.id}`
              // Don't link to orderId since we're deleting the order
            });
          }
          await db.delete(orders).where(eq(orders.id, orderId));
          return {
            success: true,
            message: "Order deleted and buyer refunded successfully",
            refundAmount: order.amount
          };
        } catch (error) {
          console.error("Error deleting order with refund:", error);
          return { success: false, message: "Failed to delete order" };
        }
      }
      async deleteExchange(exchangeId) {
        try {
          await db.delete(messages).where(eq(messages.exchangeId, exchangeId));
          const result = await db.delete(exchanges).where(eq(exchanges.id, exchangeId));
          return true;
        } catch (error) {
          console.error("Error deleting exchange:", error);
          return false;
        }
      }
      // TRANSACTION OPERATIONS
      async getTransactionsByUserId(userId) {
        try {
          return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
        } catch (error) {
          return [];
        }
      }
      async createTransaction(transaction) {
        let transactionType;
        if (transaction.type === "deposit") {
          transactionType = "top_up";
        } else if (transaction.type === "withdrawal") {
          transactionType = "withdrawal";
        } else {
          transactionType = "top_up";
        }
        const transactionId = generateTransactionId(transactionType);
        const [newTransaction] = await db.insert(transactions).values({
          ...transaction,
          transactionId,
          createdAt: /* @__PURE__ */ new Date()
          // Ensure UTC timestamp
        }).returning();
        return newTransaction;
      }
      // PAYMENT GATEWAY OPERATIONS
      async getPaymentGateways() {
        try {
          return await db.select().from(paymentGateways).orderBy(paymentGateways.name);
        } catch (error) {
          return [];
        }
      }
      async getActivePaymentGateways() {
        try {
          return await db.select().from(paymentGateways).where(eq(paymentGateways.isActive, true)).orderBy(paymentGateways.name);
        } catch (error) {
          return [];
        }
      }
      async getPaymentGateway(id) {
        try {
          const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
          return gateway || void 0;
        } catch (error) {
          return void 0;
        }
      }
      async getPaymentGatewayByName(name) {
        try {
          const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.name, name));
          return gateway || void 0;
        } catch (error) {
          return void 0;
        }
      }
      async updatePaymentGatewayLimits(id, limits) {
        try {
          const [gateway] = await db.update(paymentGateways).set({
            minDepositAmount: limits.minDepositAmount,
            maxDepositAmount: limits.maxDepositAmount,
            minWithdrawalAmount: limits.minWithdrawalAmount,
            maxWithdrawalAmount: limits.maxWithdrawalAmount,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(paymentGateways.id, id)).returning();
          return gateway || void 0;
        } catch (error) {
          console.error("Error updating payment gateway limits:", error);
          return void 0;
        }
      }
      async createPaymentGateway(gateway) {
        const [newGateway] = await db.insert(paymentGateways).values({
          ...gateway,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newGateway;
      }
      // WALLET TRANSACTION OPERATIONS
      async getWalletTransaction(id) {
        try {
          const [transaction] = await db.select().from(walletTransactions).where(eq(walletTransactions.id, id));
          return transaction || void 0;
        } catch (error) {
          return void 0;
        }
      }
      async getWalletTransactionsByUserId(userId) {
        try {
          return await db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getWalletTransactionsByUserIdPaginated(userId, limit, offset) {
        try {
          const [transactions2, totalResult] = await Promise.all([
            db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql2`count(*)` }).from(walletTransactions).where(eq(walletTransactions.userId, userId))
          ]);
          return {
            transactions: transactions2,
            total: totalResult[0]?.count || 0
          };
        } catch (error) {
          return { transactions: [], total: 0 };
        }
      }
      async getAllWalletTransactions() {
        try {
          return await db.select().from(walletTransactions).orderBy(desc(walletTransactions.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getAllWalletTransactionsPaginated(limit, offset, status) {
        try {
          const whereCondition = status ? eq(walletTransactions.status, status) : void 0;
          const [transactions2, totalResult] = await Promise.all([
            db.select().from(walletTransactions).where(whereCondition).orderBy(desc(walletTransactions.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql2`count(*)` }).from(walletTransactions).where(whereCondition)
          ]);
          return {
            transactions: transactions2,
            total: totalResult[0]?.count || 0
          };
        } catch (error) {
          return { transactions: [], total: 0 };
        }
      }
      async createWalletTransaction(transaction) {
        const transactionType = transaction.type === "top_up" ? "top_up" : "withdrawal";
        const transactionId = generateTransactionId(transactionType);
        const [newTransaction] = await db.insert(walletTransactions).values({
          ...transaction,
          transactionId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newTransaction;
      }
      async processWalletTransaction(id, status, adminId, employeeUsername, adminNote, rejectionReason) {
        try {
          const transaction = await this.getWalletTransaction(id);
          if (!transaction || transaction.status !== "processing") {
            return void 0;
          }
          const user = await this.getUser(transaction.userId);
          if (!user) {
            return void 0;
          }
          const [updatedTransaction] = await db.update(walletTransactions).set({
            status,
            processedBy: adminId,
            processedAt: /* @__PURE__ */ new Date(),
            adminNote: adminNote || null,
            rejectionReason: rejectionReason || null,
            approvedBy: status === "approved" ? adminId : null,
            rejectedBy: status === "failed" ? adminId : null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(walletTransactions.id, id)).returning();
          if (status === "approved") {
            if (transaction.type === "top_up") {
              await this.addFunds(
                transaction.userId,
                transaction.amount,
                // Add only the actual top-up amount requested by user
                `Top-up Successfully Processed: $${transaction.amount.toFixed(2)} credited to wallet`
              );
              await this.createNotification({
                userId: transaction.userId,
                type: "wallet_topup_approved",
                title: "Top-up Successful",
                message: `Your top-up of $${transaction.amount.toFixed(2)} has been added to your wallet.`,
                isRead: false,
                relatedEntityId: transaction.id,
                section: "wallet",
                subTab: "transactions",
                priority: "normal"
              });
              if (transaction.fee > 0) {
                await this.createFeeRecord({
                  feeType: "top_up",
                  username: user.username,
                  email: user.email,
                  amount: transaction.fee,
                  originalAmount: transaction.amount + transaction.fee,
                  referenceId: transaction.transactionId || transaction.id,
                  status: "success"
                });
              }
            } else if (transaction.type === "withdrawal") {
              await this.createNotification({
                userId: transaction.userId,
                type: "wallet_withdrawal_approved",
                title: "Withdrawal Successful",
                message: `Your withdrawal of $${transaction.amount.toFixed(2)} has been processed.`,
                isRead: false,
                relatedEntityId: transaction.id,
                section: "wallet",
                subTab: "transactions",
                priority: "normal"
              });
              if (transaction.fee > 0) {
                await this.createFeeRecord({
                  feeType: "withdrawal",
                  username: user.username,
                  email: user.email,
                  amount: transaction.fee,
                  originalAmount: transaction.amount + transaction.fee,
                  referenceId: transaction.transactionId || transaction.id,
                  status: "success"
                });
              }
            }
          } else if (status === "failed") {
            if (transaction.type === "top_up") {
              await this.createNotification({
                userId: transaction.userId,
                type: "wallet_topup_failed",
                title: "Top-up Failed",
                message: `Your top-up of $${transaction.amount.toFixed(2)} was rejected. ${rejectionReason || "Please contact support for more information."}`,
                isRead: false,
                relatedEntityId: transaction.id,
                section: "wallet",
                subTab: "transactions",
                priority: "high"
              });
            } else if (transaction.type === "withdrawal") {
              const fullRefundAmount = transaction.amount + transaction.fee;
              await this.addFunds(
                transaction.userId,
                fullRefundAmount,
                `Withdrawal Rejected - Full Refund (including $${transaction.fee.toFixed(2)} processing fee): ${rejectionReason || "No reason provided"}`
              );
              await this.createNotification({
                userId: transaction.userId,
                type: "wallet_withdrawal_failed",
                title: "Withdrawal Failed",
                message: `Your withdrawal of $${transaction.amount.toFixed(2)} was rejected and fully refunded (including $${transaction.fee.toFixed(2)} processing fee). ${rejectionReason || "Please contact support for more information."}`,
                isRead: false,
                relatedEntityId: transaction.id,
                section: "wallet",
                subTab: "transactions",
                priority: "high"
              });
              await this.createTransaction({
                userId: transaction.userId,
                type: "rejection_refund",
                amount: fullRefundAmount,
                description: `Withdrawal rejection full refund for ${transaction.transactionId} - Original amount: $${transaction.amount.toFixed(2)}, Fee refunded: $${transaction.fee.toFixed(2)}, Total refund: $${fullRefundAmount.toFixed(2)}`,
                referenceId: transaction.id
              });
            }
          }
          return updatedTransaction;
        } catch (error) {
          console.error("Error processing wallet transaction:", error);
          return void 0;
        }
      }
      // ENHANCED SUPPORT TICKET SYSTEM
      // Utility function to sanitize content and prevent XSS/injection
      sanitizeContent(content) {
        return content.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
      }
      // Generate unique ticket number
      async generateTicketNumber() {
        const count2 = await db.$count(supportTickets);
        return `#T${(count2 + 1).toString().padStart(3, "0")}`;
      }
      async createSupportTicket(ticket) {
        const sanitizedTicket = {
          ...ticket,
          subject: this.sanitizeContent(ticket.subject),
          description: this.sanitizeContent(ticket.description)
        };
        const ticketNumber = await this.generateTicketNumber();
        const [newTicket] = await db.insert(supportTickets).values({
          ...sanitizedTicket,
          ticketNumber,
          status: "open"
        }).returning();
        return newTicket;
      }
      async getSupportTicketsByUserId(userId) {
        try {
          return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
        } catch (error) {
          console.error("Error fetching user tickets:", error);
          return [];
        }
      }
      async getAllSupportTickets() {
        try {
          const result = await db.select({
            id: supportTickets.id,
            ticketNumber: supportTickets.ticketNumber,
            userId: supportTickets.userId,
            subject: supportTickets.subject,
            description: supportTickets.description,
            status: supportTickets.status,
            priority: supportTickets.priority,
            category: supportTickets.category,
            createdAt: supportTickets.createdAt,
            updatedAt: supportTickets.updatedAt,
            closedAt: supportTickets.closedAt,
            closedBy: supportTickets.closedBy,
            user: {
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email
            }
          }).from(supportTickets).leftJoin(users, eq(supportTickets.userId, users.id)).orderBy(desc(supportTickets.createdAt));
          return result;
        } catch (error) {
          console.error("Error fetching all tickets:", error);
          return [];
        }
      }
      async updateSupportTicketStatus(ticketId, status, adminId) {
        try {
          const [currentTicket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));
          if (!currentTicket) {
            return null;
          }
          const updateData = {
            status,
            updatedAt: /* @__PURE__ */ new Date()
          };
          if (status === "closed") {
            updateData.closedAt = /* @__PURE__ */ new Date();
            if (adminId) {
              updateData.closedBy = adminId;
            }
          }
          const [updatedTicket] = await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, ticketId)).returning();
          if (updatedTicket && currentTicket.status !== status) {
            const shouldNotify = ["investigating", "resolved", "closed"].includes(
              status
            );
            if (shouldNotify) {
              try {
                await this.createSupportNotification({
                  userId: updatedTicket.userId,
                  ticketId,
                  type: "status_change",
                  metadata: JSON.stringify({ status })
                });
              } catch (notificationError) {
                console.error("Error creating notification:", notificationError);
              }
            }
          }
          return updatedTicket || null;
        } catch (error) {
          console.error("Error updating ticket status:", error);
          return null;
        }
      }
      async getSupportMessagesByTicketId(ticketId) {
        try {
          return await db.select().from(supportMessages).where(eq(supportMessages.ticketId, ticketId)).orderBy(supportMessages.createdAt);
        } catch (error) {
          console.error("Error fetching ticket messages:", error);
          return [];
        }
      }
      async getSupportMessagesByUserId(userId) {
        try {
          return await db.select().from(supportMessages).where(eq(supportMessages.userId, userId)).orderBy(desc(supportMessages.createdAt));
        } catch (error) {
          return [];
        }
      }
      async createSupportMessage(message) {
        const sanitizedMessage = {
          ...message,
          message: this.sanitizeContent(message.message)
        };
        const [newMessage] = await db.insert(supportMessages).values({
          ...sanitizedMessage,
          createdAt: /* @__PURE__ */ new Date()
          // Ensure UTC timestamp
        }).returning();
        if (message.ticketId && message.sender === "admin") {
          const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, message.ticketId));
          if (ticket) {
            await db.update(supportTickets).set({
              status: "replied",
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(supportTickets.id, message.ticketId));
            await this.createSupportNotification({
              userId: ticket.userId,
              ticketId: message.ticketId,
              type: "reply"
            });
          }
        } else if (message.ticketId && message.sender === "user") {
          await db.update(supportTickets).set({
            status: "open",
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(supportTickets.id, message.ticketId));
        }
        return newMessage;
      }
      // SUPPORT NOTIFICATION OPERATIONS
      async createSupportNotification(notification) {
        const [newNotification] = await db.insert(supportNotifications).values({
          ...notification,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newNotification;
      }
      async getSupportNotificationCount(userId) {
        try {
          const [result] = await db.select({ count: count() }).from(supportNotifications).where(
            and(
              eq(supportNotifications.userId, userId),
              eq(supportNotifications.isRead, false)
            )
          );
          return result?.count || 0;
        } catch (error) {
          console.error("Error getting notification count:", error);
          return 0;
        }
      }
      async markSupportNotificationsAsRead(userId, ticketId) {
        try {
          await db.update(supportNotifications).set({ isRead: true }).where(
            and(
              eq(supportNotifications.userId, userId),
              eq(supportNotifications.ticketId, ticketId)
            )
          );
        } catch (error) {
          console.error("Error marking notifications as read:", error);
        }
      }
      async getSupportNotifications(userId) {
        try {
          return await db.select().from(supportNotifications).where(eq(supportNotifications.userId, userId)).orderBy(desc(supportNotifications.createdAt));
        } catch (error) {
          console.error("Error fetching support notifications:", error);
          return [];
        }
      }
      // SETTINGS OPERATIONS
      async getSetting(key) {
        try {
          const [setting] = await db.select().from(settings).where(eq(settings.key, key));
          return setting;
        } catch (error) {
          return void 0;
        }
      }
      async getPlatformName() {
        try {
          const [setting] = await db.select().from(settings).where(eq(settings.key, "platform_name"));
          return setting?.value || "CollabPro";
        } catch (error) {
          return "CollabPro";
        }
      }
      async setSetting(setting) {
        try {
          const [existingSetting] = await db.select().from(settings).where(eq(settings.key, setting.key));
          if (existingSetting) {
            const [updatedSetting] = await db.update(settings).set({
              value: setting.value,
              description: setting.description,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(settings.key, setting.key)).returning();
            return updatedSetting;
          } else {
            const [newSetting] = await db.insert(settings).values({
              ...setting,
              updatedAt: /* @__PURE__ */ new Date()
            }).returning();
            return newSetting;
          }
        } catch (error) {
          throw error;
        }
      }
      async getRecentActivity() {
        try {
          const [recentOrders, recentExchanges, recentUsers] = await Promise.all([
            db.select({
              id: orders.id,
              type: sql2`'order'`,
              description: sql2`'New order created'`,
              createdAt: orders.createdAt
            }).from(orders).orderBy(desc(orders.createdAt)).limit(5),
            db.select({
              id: exchanges.id,
              type: sql2`'exchange'`,
              description: sql2`'New exchange request'`,
              createdAt: exchanges.createdAt
            }).from(exchanges).orderBy(desc(exchanges.createdAt)).limit(5),
            db.select({
              id: users.id,
              type: sql2`'user'`,
              description: sql2`'New user registered'`,
              createdAt: users.createdAt
            }).from(users).where(eq(users.role, "user")).orderBy(desc(users.createdAt)).limit(5)
          ]);
          const allActivity = [...recentOrders, ...recentExchanges, ...recentUsers].sort(
            (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
          ).slice(0, 10);
          return allActivity;
        } catch (error) {
          return [];
        }
      }
      async adjustUserBalance(userId, amount, reason) {
        try {
          const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
          if (!wallet) {
            throw new Error("User wallet not found");
          }
          const newBalance = wallet.balance + amount;
          await db.update(wallets).set({ balance: newBalance, updatedAt: /* @__PURE__ */ new Date() }).where(eq(wallets.userId, userId));
          const transactionType = amount > 0 ? "deposit" : "withdrawal";
          const transactionId = generateTransactionId(
            amount > 0 ? "top_up" : "withdrawal"
          );
          const [transaction] = await db.insert(transactions).values({
            transactionId,
            userId,
            type: transactionType,
            amount: Math.abs(amount),
            description: reason || "Admin balance adjustment"
          }).returning();
          return { transaction, newBalance };
        } catch (error) {
          throw new Error("Failed to adjust user balance");
        }
      }
      async updateOrderStatus(orderId, status) {
        try {
          const [order] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, orderId)).returning();
          return order;
        } catch (error) {
          throw new Error("Failed to update order status");
        }
      }
      async updateSiteApproval(siteId, approved) {
        try {
          const status = approved ? "approved" : "rejected";
          const [site] = await db.update(sites).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sites.id, siteId)).returning();
          return site;
        } catch (error) {
          throw new Error("Failed to update site approval");
        }
      }
      async getPlatformSettings() {
        try {
          const allSettings = await db.select().from(settings);
          return allSettings;
        } catch (error) {
          console.error("Error fetching platform settings:", error);
          return [];
        }
      }
      async updatePlatformSettings(settingsData) {
        try {
          const updates = [];
          for (const [key, value] of Object.entries(settingsData)) {
            const updatePromise = this.setSetting({ key, value: String(value) });
            updates.push(updatePromise);
          }
          await Promise.all(updates);
          return settingsData;
        } catch (error) {
          throw new Error("Failed to update platform settings");
        }
      }
      async getAllSupportMessages() {
        try {
          const messages2 = await db.select({
            id: supportMessages.id,
            userId: supportMessages.userId,
            message: supportMessages.message,
            sender: supportMessages.sender,
            isRead: supportMessages.isRead,
            createdAt: supportMessages.createdAt,
            userName: sql2`concat(${users.firstName}, ' ', ${users.lastName})`,
            userEmail: users.email
          }).from(supportMessages).leftJoin(users, eq(supportMessages.userId, users.id)).orderBy(desc(supportMessages.createdAt));
          return messages2;
        } catch (error) {
          return [];
        }
      }
      // FEE RECORD OPERATIONS
      async getAllFeeRecords() {
        try {
          return await db.select().from(feeRecords).where(eq(feeRecords.status, "success")).orderBy(desc(feeRecords.createdAt));
        } catch (error) {
          console.error("Error fetching fee records:", error);
          return [];
        }
      }
      // CRYPTO TXID OPERATIONS
      async getAllCryptoTxIds() {
        try {
          return await db.select({
            id: cryptoTxIds.id,
            txId: cryptoTxIds.txId,
            username: cryptoTxIds.username,
            userId: cryptoTxIds.userId,
            walletTransactionId: cryptoTxIds.walletTransactionId,
            createdAt: cryptoTxIds.createdAt,
            first_name: users.firstName,
            last_name: users.lastName,
            amount: walletTransactions.amount,
            status: walletTransactions.status,
            transaction_date: walletTransactions.createdAt
          }).from(cryptoTxIds).leftJoin(users, eq(cryptoTxIds.userId, users.id)).leftJoin(
            walletTransactions,
            eq(cryptoTxIds.walletTransactionId, walletTransactions.id)
          ).orderBy(desc(cryptoTxIds.createdAt));
        } catch (error) {
          console.error("Error fetching crypto TxIDs:", error);
          return [];
        }
      }
      async getFeeRecordsByUserId(userId) {
        try {
          return await db.select().from(feeRecords).where(eq(feeRecords.username, userId)).orderBy(desc(feeRecords.createdAt));
        } catch (error) {
          return [];
        }
      }
      async createFeeRecord(feeRecord) {
        let transactionType;
        if (feeRecord.feeType === "top_up") {
          transactionType = "top_up";
        } else if (feeRecord.feeType === "withdrawal") {
          transactionType = "withdrawal";
        } else {
          transactionType = "seller_fee";
        }
        const referenceId = generateTransactionId(transactionType);
        const [newFeeRecord] = await db.insert(feeRecords).values({
          ...feeRecord,
          referenceId
        }).returning();
        return newFeeRecord;
      }
      // FINANCIAL OPERATIONS FOR ADMIN
      async getAllTransactionsWithUsers() {
        try {
          return await db.select({
            id: transactions.id,
            transactionId: sql2`COALESCE(${transactions.id}, CONCAT('TXN-', EXTRACT(EPOCH FROM ${transactions.createdAt})::text))`.as(
              "transactionId"
            ),
            userId: transactions.userId,
            type: transactions.type,
            amount: transactions.amount,
            description: transactions.description,
            createdAt: transactions.createdAt,
            user: {
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email
            }
          }).from(transactions).leftJoin(users, eq(transactions.userId, users.id)).orderBy(desc(transactions.createdAt));
        } catch (error) {
          console.error("Error fetching transactions with users:", error);
          return [];
        }
      }
      async getAllWalletTransactionsWithUsers() {
        try {
          return await db.select({
            id: walletTransactions.id,
            transactionId: walletTransactions.transactionId,
            userId: walletTransactions.userId,
            type: walletTransactions.type,
            amount: walletTransactions.amount,
            fee: walletTransactions.fee,
            status: walletTransactions.status,
            paymentMethod: walletTransactions.paymentMethod,
            withdrawalMethod: walletTransactions.withdrawalMethod,
            rejectionReason: walletTransactions.rejectionReason,
            processedBy: walletTransactions.processedBy,
            processedAt: walletTransactions.processedAt,
            approvedBy: walletTransactions.approvedBy,
            rejectedBy: walletTransactions.rejectedBy,
            createdAt: walletTransactions.createdAt,
            user: {
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email
            }
          }).from(walletTransactions).leftJoin(users, eq(walletTransactions.userId, users.id)).orderBy(desc(walletTransactions.createdAt));
        } catch (error) {
          console.error(
            "Error fetching all wallet transactions with users:",
            error
          );
          return [];
        }
      }
      async getWalletTransactionsByStatus(status, type) {
        try {
          const query = db.select({
            id: walletTransactions.id,
            userId: walletTransactions.userId,
            type: walletTransactions.type,
            amount: walletTransactions.amount,
            fee: walletTransactions.fee,
            status: walletTransactions.status,
            paymentMethod: walletTransactions.paymentMethod,
            withdrawalMethod: walletTransactions.withdrawalMethod,
            rejectionReason: walletTransactions.rejectionReason,
            adminNote: walletTransactions.adminNote,
            processedBy: walletTransactions.processedBy,
            processedAt: walletTransactions.processedAt,
            approvedBy: walletTransactions.approvedBy,
            rejectedBy: walletTransactions.rejectedBy,
            updatedAt: walletTransactions.updatedAt,
            transactionId: walletTransactions.transactionId,
            createdAt: walletTransactions.createdAt,
            txId: cryptoTxIds.txId,
            // Include TxID from crypto_tx_ids table
            user: {
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email
            }
          }).from(walletTransactions).leftJoin(users, eq(walletTransactions.userId, users.id)).leftJoin(
            cryptoTxIds,
            eq(walletTransactions.id, cryptoTxIds.walletTransactionId)
          ).where(eq(walletTransactions.status, status));
          if (type) {
            const finalQuery = db.select({
              id: walletTransactions.id,
              userId: walletTransactions.userId,
              type: walletTransactions.type,
              amount: walletTransactions.amount,
              fee: walletTransactions.fee,
              status: walletTransactions.status,
              paymentMethod: walletTransactions.paymentMethod,
              withdrawalMethod: walletTransactions.withdrawalMethod,
              rejectionReason: walletTransactions.rejectionReason,
              adminNote: walletTransactions.adminNote,
              processedBy: walletTransactions.processedBy,
              processedAt: walletTransactions.processedAt,
              approvedBy: walletTransactions.approvedBy,
              rejectedBy: walletTransactions.rejectedBy,
              updatedAt: walletTransactions.updatedAt,
              transactionId: walletTransactions.transactionId,
              createdAt: walletTransactions.createdAt,
              txId: cryptoTxIds.txId,
              // Include TxID from crypto_tx_ids table
              user: {
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email
              }
            }).from(walletTransactions).leftJoin(users, eq(walletTransactions.userId, users.id)).leftJoin(
              cryptoTxIds,
              eq(walletTransactions.id, cryptoTxIds.walletTransactionId)
            ).where(
              and(
                eq(walletTransactions.status, status),
                eq(walletTransactions.type, type)
              )
            );
            const result2 = await finalQuery.orderBy(
              desc(walletTransactions.createdAt)
            );
            return result2;
          }
          const result = await query.orderBy(desc(walletTransactions.createdAt));
          return result;
        } catch (error) {
          console.error("Error fetching wallet transactions by status:", error);
          return [];
        }
      }
      async getWalletTransactionsByType(type) {
        try {
          const result = await db.select({
            id: walletTransactions.id,
            status: walletTransactions.status,
            createdAt: walletTransactions.createdAt,
            updatedAt: walletTransactions.updatedAt,
            type: walletTransactions.type,
            userId: walletTransactions.userId,
            amount: walletTransactions.amount,
            transactionId: walletTransactions.transactionId,
            fee: walletTransactions.fee,
            gatewayId: walletTransactions.gatewayId,
            paymentMethod: walletTransactions.paymentMethod,
            withdrawalMethod: walletTransactions.withdrawalMethod,
            adminNote: walletTransactions.adminNote,
            processedBy: walletTransactions.processedBy,
            processedAt: walletTransactions.processedAt
          }).from(walletTransactions).where(eq(walletTransactions.type, type)).orderBy(desc(walletTransactions.createdAt));
          return result.map((item) => ({
            ...item,
            rejectionReason: null
          }));
        } catch (error) {
          console.error("Error fetching wallet transactions by type:", error);
          return [];
        }
      }
      // ADMIN ANALYTICS
      async getAdminStats() {
        try {
          const stats = await db.execute(sql2`
        SELECT 
          COALESCE((SELECT SUM(amount) FROM fee_records WHERE status = 'success'), 0) as total_platform_fees,
          COALESCE((SELECT SUM(service_fee) FROM orders WHERE status = 'completed'), 0) as total_sales_fees,
          COALESCE((SELECT SUM(fee) FROM wallet_transactions WHERE status = 'approved'), 0) as total_wallet_fees,
          (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
          (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_sales,
          (SELECT COUNT(*) FROM exchanges WHERE status = 'active') as active_exchange,
          (SELECT COUNT(*) FROM sites WHERE status = 'pending') as pending_posts
      `);
          const result = stats.rows[0];
          const totalPlatformFees = parseInt(result.total_platform_fees || "0");
          const totalSalesFees = parseInt(result.total_sales_fees || "0");
          const totalWalletFees = parseInt(result.total_wallet_fees || "0");
          return {
            totalRevenue: totalSalesFees + totalWalletFees,
            // Sales fees + wallet fees (both already in dollars)
            totalSales: parseInt(result.total_sales || "0"),
            totalWalletFees,
            // Top-up + withdrawal fees (already in dollars)
            totalSalesFees,
            // Platform fees from completed orders (already in dollars)
            totalUsers: parseInt(result.total_users || "0"),
            activeExchange: parseInt(result.active_exchange || "0"),
            pendingPosts: parseInt(result.pending_posts || "0")
          };
        } catch (error) {
          console.error("Error fetching admin stats:", error);
          return {
            totalRevenue: 0,
            totalUsers: 0,
            totalSales: 0,
            totalWalletFees: 0,
            totalSalesFees: 0,
            activeExchange: 0,
            pendingPosts: 0
          };
        }
      }
      // Finance Settings operations
      async getAllFinanceSettings() {
        try {
          const settings2 = await db.select().from(financeSettings);
          return settings2;
        } catch (error) {
          console.error("Error fetching finance settings:", error);
          return [];
        }
      }
      async getFinanceSettingsByType(type) {
        try {
          const settings2 = await db.select().from(financeSettings).where(
            and(
              eq(financeSettings.type, type),
              eq(financeSettings.isActive, true)
            )
          );
          return settings2;
        } catch (error) {
          console.error("Error fetching finance settings by type:", error);
          return [];
        }
      }
      async createFinanceSetting(setting) {
        const [newSetting] = await db.insert(financeSettings).values({
          ...setting,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newSetting;
      }
      async updateFinanceSetting(id, updates) {
        try {
          const [updatedSetting] = await db.update(financeSettings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(financeSettings.id, id)).returning();
          return updatedSetting;
        } catch (error) {
          console.error("Error updating finance setting:", error);
          return void 0;
        }
      }
      async deleteFinanceSetting(id) {
        try {
          await db.delete(financeSettings).where(eq(financeSettings.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting finance setting:", error);
          return false;
        }
      }
      // Order messaging methods - using existing getMessagesByOrderId method above
      async createOrderMessage(messageData) {
        try {
          const [message] = await db.insert(messages).values({
            orderId: messageData.orderId,
            senderId: messageData.senderId,
            content: messageData.content
          }).returning();
          const [messageWithSender] = await db.select({
            id: messages.id,
            orderId: messages.orderId,
            senderId: messages.senderId,
            content: messages.content,
            createdAt: messages.createdAt,
            sender: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName
            }
          }).from(messages).leftJoin(users, eq(messages.senderId, users.id)).where(eq(messages.id, message.id));
          return messageWithSender;
        } catch (error) {
          console.error("Error creating order message:", error);
          throw error;
        }
      }
      // User Deposit Sessions implementation
      async createUserDepositSession(session2) {
        const [created] = await db.insert(userDepositSessions).values(session2).returning();
        return created;
      }
      async getUserDepositSessionByUserId(userId) {
        const [session2] = await db.select().from(userDepositSessions).where(
          and(
            eq(userDepositSessions.userId, userId),
            eq(userDepositSessions.isActive, true),
            gte(userDepositSessions.expiresAt, /* @__PURE__ */ new Date())
          )
        ).orderBy(desc(userDepositSessions.createdAt)).limit(1);
        return session2;
      }
      async getUserDepositSessionBySessionId(sessionId) {
        const [session2] = await db.select().from(userDepositSessions).where(
          and(
            eq(userDepositSessions.sessionId, sessionId),
            eq(userDepositSessions.isActive, true),
            gte(userDepositSessions.expiresAt, /* @__PURE__ */ new Date())
          )
        );
        return session2;
      }
      async updateUserDepositSession(id, updates) {
        const [updated] = await db.update(userDepositSessions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userDepositSessions.id, id)).returning();
        return updated;
      }
      async expireUserDepositSession(id) {
        try {
          await db.update(userDepositSessions).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userDepositSessions.id, id));
          return true;
        } catch (error) {
          console.error("Error expiring deposit session:", error);
          return false;
        }
      }
      async cleanupExpiredSessions() {
        try {
          const result = await db.update(userDepositSessions).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(
            and(
              eq(userDepositSessions.isActive, true),
              lte(userDepositSessions.expiresAt, /* @__PURE__ */ new Date())
            )
          );
          return 0;
        } catch (error) {
          console.error("Error cleaning up expired sessions:", error);
          return 0;
        }
      }
      // Security login access operations (Anti-DDoS Brute Force protection)
      async getSecurityLoginAccess(ipAddress) {
        const [access] = await db.select().from(securityLoginAccess).where(eq(securityLoginAccess.ipAddress, ipAddress));
        return access || void 0;
      }
      async createSecurityLoginAccess(access) {
        const [newAccess] = await db.insert(securityLoginAccess).values(access).returning();
        return newAccess;
      }
      async updateSecurityLoginAccess(ipAddress, access) {
        const [updatedAccess] = await db.update(securityLoginAccess).set({ ...access, updatedAt: /* @__PURE__ */ new Date() }).where(eq(securityLoginAccess.ipAddress, ipAddress)).returning();
        return updatedAccess || void 0;
      }
      async getLockedIps() {
        const now = /* @__PURE__ */ new Date();
        return await db.select().from(securityLoginAccess).where(
          and(
            gte(securityLoginAccess.lockedUntil, now),
            gte(securityLoginAccess.attemptCount, 3)
          )
        ).orderBy(desc(securityLoginAccess.lastAttempt));
      }
      async isIpLocked(ipAddress) {
        const access = await this.getSecurityLoginAccess(ipAddress);
        if (!access || !access.lockedUntil) return false;
        const now = /* @__PURE__ */ new Date();
        return access.attemptCount >= 3 && access.lockedUntil > now;
      }
      async clearExpiredLocks() {
        const now = /* @__PURE__ */ new Date();
        await db.update(securityLoginAccess).set({
          attemptCount: 0,
          lockedUntil: null,
          updatedAt: now
        }).where(lte(securityLoginAccess.lockedUntil, now));
      }
      async cleanupExpiredSecurityLockouts(beforeDate) {
        try {
          await db.update(securityLoginAccess).set({
            attemptCount: 0,
            lockedUntil: null,
            updatedAt: beforeDate
          }).where(lte(securityLoginAccess.lockedUntil, beforeDate));
          console.log(
            `Cleaned up expired lockouts before ${beforeDate.toISOString()}`
          );
        } catch (error) {
          console.error("Failed to cleanup expired security lockouts:", error);
          throw error;
        }
      }
      // Rejection Reasons Storage Methods
      async getRejectionReasons() {
        try {
          return await db.select().from(rejectionReasons).orderBy(desc(rejectionReasons.createdAt));
        } catch (error) {
          return [];
        }
      }
      async getActiveRejectionReasons() {
        try {
          return await db.select().from(rejectionReasons).where(eq(rejectionReasons.isActive, true)).orderBy(asc(rejectionReasons.reasonText));
        } catch (error) {
          return [];
        }
      }
      async createRejectionReason(reason) {
        const [newReason] = await db.insert(rejectionReasons).values({
          ...reason,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newReason;
      }
      async updateRejectionReason(id, reason) {
        try {
          const [updated] = await db.update(rejectionReasons).set({ ...reason, updatedAt: /* @__PURE__ */ new Date() }).where(eq(rejectionReasons.id, id)).returning();
          return updated;
        } catch (error) {
          return void 0;
        }
      }
      async deleteRejectionReason(id) {
        try {
          await db.delete(rejectionReasons).where(eq(rejectionReasons.id, id));
          return true;
        } catch (error) {
          return false;
        }
      }
      // Payment Gateway Management Methods
      async getAllPaymentGateways() {
        try {
          return await db.select().from(paymentGateways).orderBy(asc(paymentGateways.displayName));
        } catch (error) {
          console.error("Error fetching payment gateways:", error);
          return [];
        }
      }
      async getPaymentGatewayById(id) {
        try {
          const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
          return gateway;
        } catch (error) {
          console.error("Error fetching payment gateway by ID:", error);
          return void 0;
        }
      }
      async updatePaymentGateway(id, updates) {
        try {
          const [updated] = await db.update(paymentGateways).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(paymentGateways.id, id)).returning();
          return updated;
        } catch (error) {
          console.error("Error updating payment gateway:", error);
          return void 0;
        }
      }
      // Admin Recent Activity Implementation
      async createAdminActivity(activity) {
        try {
          const [created] = await db.insert(adminRecentActivity).values(activity).returning();
          return created;
        } catch (error) {
          console.error("Error creating admin activity:", error);
          throw error;
        }
      }
      async getRecentAdminActivity(limit = 50) {
        try {
          return await db.select().from(adminRecentActivity).orderBy(desc(adminRecentActivity.createdAt)).limit(limit);
        } catch (error) {
          console.error("Error fetching recent admin activity:", error);
          return [];
        }
      }
      // Security management - Banned IPs and Emails implementation
      async getAllBannedIPs() {
        try {
          return await db.select().from(bannedIps).where(eq(bannedIps.isActive, true)).orderBy(desc(bannedIps.createdAt));
        } catch (error) {
          console.error("Error fetching banned IPs:", error);
          return [];
        }
      }
      async getAllBannedEmails() {
        try {
          return await db.select().from(bannedEmails).where(eq(bannedEmails.isActive, true)).orderBy(desc(bannedEmails.createdAt));
        } catch (error) {
          console.error("Error fetching banned emails:", error);
          return [];
        }
      }
      async banIP(ipAddress, reason, bannedBy) {
        const existingBan = await this.isIPBanned(ipAddress);
        if (existingBan) {
          throw new Error(`IP address ${ipAddress} is already banned`);
        }
        const [bannedIp] = await db.insert(bannedIps).values({
          ipAddress,
          reason,
          bannedBy,
          isActive: true
        }).returning();
        return bannedIp;
      }
      async banEmail(email, reason, bannedBy) {
        const existingBan = await this.isEmailBanned(email);
        if (existingBan) {
          throw new Error(`Email address ${email} is already banned`);
        }
        const [bannedEmail] = await db.insert(bannedEmails).values({
          email,
          reason,
          bannedBy,
          isActive: true
        }).returning();
        return bannedEmail;
      }
      async unbanIP(id) {
        try {
          const [deleted] = await db.delete(bannedIps).where(eq(bannedIps.id, id)).returning();
          return !!deleted;
        } catch (error) {
          console.error("Error unbanning IP:", error);
          return false;
        }
      }
      async unbanEmail(id) {
        try {
          const [deleted] = await db.delete(bannedEmails).where(eq(bannedEmails.id, id)).returning();
          return !!deleted;
        } catch (error) {
          console.error("Error unbanning email:", error);
          return false;
        }
      }
      async isIPBanned(ipAddress) {
        try {
          const [banned] = await db.select().from(bannedIps).where(
            and(eq(bannedIps.ipAddress, ipAddress), eq(bannedIps.isActive, true))
          );
          return !!banned;
        } catch (error) {
          console.error("Error checking if IP is banned:", error);
          return false;
        }
      }
      async isEmailBanned(email) {
        try {
          const [banned] = await db.select().from(bannedEmails).where(
            and(
              ilike(bannedEmails.email, email),
              eq(bannedEmails.isActive, true)
            )
          );
          return !!banned;
        } catch (error) {
          console.error("Error checking if email is banned:", error);
          return false;
        }
      }
      // Terminate all sessions for a banned email
      async terminateSessionsByEmail(email) {
        try {
          await db.execute(sql2`
        DELETE FROM auth_session_store 
        WHERE sess::jsonb -> 'user' ->> 'email' ILIKE ${email}
      `);
          console.log(`Terminated sessions for banned email: ${email}`);
        } catch (error) {
          console.error("Error terminating sessions by email:", error);
        }
      }
      // Terminate all sessions for a banned IP  
      async terminateSessionsByIP(ipAddress) {
        try {
          console.log(`IP ${ipAddress} banned - new logins from this IP will be blocked`);
        } catch (error) {
          console.error("Error terminating sessions by IP:", error);
        }
      }
      // SMTP System operations
      async getSmtpConfig() {
        try {
          const [config] = await db.select().from(smtpSystem).limit(1);
          return config;
        } catch (error) {
          console.error("Error getting SMTP config:", error);
          return void 0;
        }
      }
      async updateSmtpConfig(config) {
        try {
          const existing = await this.getSmtpConfig();
          if (existing) {
            const [updated] = await db.update(smtpSystem).set({ ...config, updatedAt: /* @__PURE__ */ new Date() }).where(eq(smtpSystem.id, existing.id)).returning();
            return updated;
          } else {
            const [created] = await db.insert(smtpSystem).values(config).returning();
            return created;
          }
        } catch (error) {
          console.error("Error updating SMTP config:", error);
          throw error;
        }
      }
      async updateSmtpEmailVerificationSetting(requireVerification) {
        try {
          let existing = await this.getSmtpConfig();
          if (existing) {
            await db.update(smtpSystem).set({
              requireEmailVerification: requireVerification,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(smtpSystem.id, existing.id));
          } else {
            await db.insert(smtpSystem).values({
              host: "smtp.gmail.com",
              port: 587,
              secure: false,
              user: "",
              password: "",
              enabled: false,
              requireEmailVerification: requireVerification
            });
          }
        } catch (error) {
          console.error("Error updating SMTP email verification setting:", error);
          throw error;
        }
      }
      async isSmtpEnabled() {
        try {
          const config = await this.getSmtpConfig();
          return config?.enabled || false;
        } catch (error) {
          console.error("Error checking SMTP status:", error);
          return false;
        }
      }
      async isEmailVerificationRequired() {
        try {
          const config = await this.getSmtpConfig();
          return config?.requireEmailVerification ?? true;
        } catch (error) {
          console.error("Error checking email verification requirement:", error);
          return true;
        }
      }
      // Email Verification operations
      async createEmailVerificationToken(data) {
        try {
          await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, data.userId));
          const [created] = await db.insert(emailVerificationTokens).values(data).returning();
          return created;
        } catch (error) {
          console.error("Error creating email verification token:", error);
          throw error;
        }
      }
      async getLatestVerificationTokenForUser(userId) {
        try {
          const [token] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId)).orderBy(desc(emailVerificationTokens.createdAt)).limit(1);
          return token || void 0;
        } catch (error) {
          console.error("Error getting latest verification token:", error);
          return void 0;
        }
      }
      async getEmailVerificationToken(token) {
        try {
          const [verificationToken] = await db.select().from(emailVerificationTokens).where(
            and(
              eq(emailVerificationTokens.token, token),
              gte(emailVerificationTokens.expiresAt, /* @__PURE__ */ new Date())
            )
          );
          return verificationToken;
        } catch (error) {
          console.error("Error getting email verification token:", error);
          return void 0;
        }
      }
      async verifyEmailToken(token) {
        try {
          const verificationToken = await this.getEmailVerificationToken(token);
          if (!verificationToken) {
            return false;
          }
          await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, verificationToken.id));
          await this.markUserEmailVerified(verificationToken.userId);
          return true;
        } catch (error) {
          console.error("Error verifying email token:", error);
          return false;
        }
      }
      async cleanupExpiredVerificationTokens() {
        try {
          await db.delete(emailVerificationTokens).where(
            or(
              eq(emailVerificationTokens.isUsed, true),
              lte(emailVerificationTokens.expiresAt, /* @__PURE__ */ new Date())
            )
          );
        } catch (error) {
          console.error("Error cleaning up expired verification tokens:", error);
        }
      }
      // Password Reset Token methods
      async createPasswordResetToken(data) {
        try {
          await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, data.userId));
          const [created] = await db.insert(passwordResetTokens).values(data).returning();
          return created;
        } catch (error) {
          console.error("Error creating password reset token:", error);
          throw error;
        }
      }
      async getPasswordResetToken(token) {
        try {
          const [resetToken] = await db.select().from(passwordResetTokens).where(
            and(
              eq(passwordResetTokens.token, token),
              eq(passwordResetTokens.isUsed, false),
              gte(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
            )
          );
          return resetToken;
        } catch (error) {
          console.error("Error getting password reset token:", error);
          return void 0;
        }
      }
      async markPasswordResetTokenUsed(tokenId) {
        try {
          await db.update(passwordResetTokens).set({ isUsed: true }).where(eq(passwordResetTokens.id, tokenId));
        } catch (error) {
          console.error("Error marking password reset token as used:", error);
          throw error;
        }
      }
      async cleanupExpiredPasswordResetTokens() {
        try {
          await db.delete(passwordResetTokens).where(
            or(
              eq(passwordResetTokens.isUsed, true),
              lte(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
            )
          );
        } catch (error) {
          console.error("Error cleaning up expired password reset tokens:", error);
        }
      }
      async markUserEmailVerified(userId) {
        try {
          const [updated] = await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId)).returning();
          return !!updated;
        } catch (error) {
          console.error("Error marking user email as verified:", error);
          return false;
        }
      }
      // Email Reminder operations
      async createEmailReminder(data) {
        try {
          const [created] = await db.insert(emailReminders).values(data).returning();
          return created;
        } catch (error) {
          console.error("Error creating email reminder:", error);
          throw error;
        }
      }
      async checkEmailReminderExists(type, status, orderId, exchangeId) {
        try {
          let conditions = [
            eq(emailReminders.type, type),
            eq(emailReminders.status, status)
          ];
          if (type === "guest_post" && orderId) {
            conditions.push(eq(emailReminders.orderId, orderId));
          } else if (type === "exchange" && exchangeId) {
            conditions.push(eq(emailReminders.exchangeId, exchangeId));
          }
          const [reminder] = await db.select().from(emailReminders).where(and(...conditions)).limit(1);
          return !!reminder;
        } catch (error) {
          console.error("Error checking email reminder existence:", error);
          return false;
        }
      }
      async deleteEmailRemindersForOrder(orderId) {
        try {
          await db.delete(emailReminders).where(eq(emailReminders.orderId, orderId));
        } catch (error) {
          console.error("Error deleting email reminders for order:", error);
        }
      }
      async deleteEmailRemindersForExchange(exchangeId) {
        try {
          await db.delete(emailReminders).where(eq(emailReminders.exchangeId, exchangeId));
        } catch (error) {
          console.error("Error deleting email reminders for exchange:", error);
        }
      }
      // Admin-specific deletion functions with reminder cleanup
      async adminDeletePendingOrder(orderId) {
        try {
          await this.deleteEmailRemindersForOrder(orderId);
          return await this.deleteOrderWithRefund(orderId);
        } catch (error) {
          console.error("Error in admin delete pending order:", error);
          return { success: false, message: "Failed to delete order" };
        }
      }
      async adminDeletePendingExchange(exchangeId) {
        try {
          await this.deleteEmailRemindersForExchange(exchangeId);
          return await this.deleteExchange(exchangeId);
        } catch (error) {
          console.error("Error in admin delete pending exchange:", error);
          return false;
        }
      }
      // Global Notifications operations
      async getActiveGlobalNotifications() {
        try {
          const notifications2 = await db.select().from(globalNotifications).where(eq(globalNotifications.isActive, true)).orderBy(desc(globalNotifications.createdAt));
          const appTimezoneSetting = await this.getSetting("appTimezone");
          const systemTimezone = appTimezoneSetting?.value || "UTC";
          const now = /* @__PURE__ */ new Date();
          const activeNotifications = notifications2.filter((notification) => {
            if (!notification.durationDays) return true;
            const createdAt = new Date(notification.createdAt);
            const expiryDate = new Date(
              createdAt.getTime() + notification.durationDays * 24 * 60 * 60 * 1e3
            );
            const nowInSystemTZ = new Date(
              now.toLocaleString("en-US", { timeZone: systemTimezone })
            );
            const expiryInSystemTZ = new Date(
              expiryDate.toLocaleString("en-US", { timeZone: systemTimezone })
            );
            return nowInSystemTZ <= expiryInSystemTZ;
          });
          return activeNotifications;
        } catch (error) {
          console.error("Error fetching active global notifications:", error);
          return [];
        }
      }
      async getAllGlobalNotifications() {
        try {
          const notifications2 = await db.select().from(globalNotifications).orderBy(desc(globalNotifications.createdAt));
          return notifications2;
        } catch (error) {
          console.error("Error fetching all global notifications:", error);
          return [];
        }
      }
      async createGlobalNotification(data) {
        try {
          const [created] = await db.insert(globalNotifications).values(data).returning();
          return created;
        } catch (error) {
          console.error("Error creating global notification:", error);
          throw error;
        }
      }
      async updateGlobalNotification(id, data) {
        try {
          const [updated] = await db.update(globalNotifications).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(globalNotifications.id, id)).returning();
          return updated || void 0;
        } catch (error) {
          console.error("Error updating global notification:", error);
          throw error;
        }
      }
      async deleteGlobalNotification(id) {
        try {
          const [deleted] = await db.delete(globalNotifications).where(eq(globalNotifications.id, id)).returning();
          return !!deleted;
        } catch (error) {
          console.error("Error deleting global notification:", error);
          return false;
        }
      }
      // CRYPTO TRANSACTION ID OPERATIONS
      async createCryptoTxId(data) {
        try {
          const [created] = await db.insert(cryptoTxIds).values(data).returning();
          return created;
        } catch (error) {
          console.error("Error creating crypto TxID:", error);
          throw error;
        }
      }
      async getCryptoTxIdByTxId(txId) {
        try {
          const [record] = await db.select().from(cryptoTxIds).where(eq(cryptoTxIds.txId, txId));
          return record || void 0;
        } catch (error) {
          console.error("Error fetching crypto TxID by txId:", error);
          return void 0;
        }
      }
      async getCryptoTxIdsByUserId(userId) {
        try {
          const records = await db.select().from(cryptoTxIds).where(eq(cryptoTxIds.userId, userId)).orderBy(desc(cryptoTxIds.createdAt));
          return records;
        } catch (error) {
          console.error("Error fetching crypto TxIDs by userId:", error);
          return [];
        }
      }
      // SOCIAL LINKS OPERATIONS
      async getAllSocialLinks() {
        try {
          return await db.select().from(socialLinks).orderBy(asc(socialLinks.name));
        } catch (error) {
          console.error("Error getting all social links:", error);
          return [];
        }
      }
      async getActiveSocialLinks() {
        try {
          return await db.select().from(socialLinks).where(eq(socialLinks.isActive, true)).orderBy(asc(socialLinks.name));
        } catch (error) {
          console.error("Error getting active social links:", error);
          return [];
        }
      }
      async getSocialLink(id) {
        try {
          const [link] = await db.select().from(socialLinks).where(eq(socialLinks.id, id));
          return link || void 0;
        } catch (error) {
          console.error("Error getting social link:", error);
          return void 0;
        }
      }
      async createSocialLink(socialLink) {
        try {
          const [newLink] = await db.insert(socialLinks).values({
            ...socialLink,
            createdAt: /* @__PURE__ */ new Date()
          }).returning();
          return newLink;
        } catch (error) {
          console.error("Error creating social link:", error);
          throw error;
        }
      }
      async updateSocialLink(id, socialLink) {
        try {
          const [updated] = await db.update(socialLinks).set(socialLink).where(eq(socialLinks.id, id)).returning();
          return updated || void 0;
        } catch (error) {
          console.error("Error updating social link:", error);
          return void 0;
        }
      }
      async deleteSocialLink(id) {
        try {
          await db.delete(socialLinks).where(eq(socialLinks.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting social link:", error);
          return false;
        }
      }
      // REFERRAL COMMISSION OPERATIONS
      async getRefCommissionsByUserId(userId, status = "pending", page = 1, limit = 5) {
        try {
          const totalQuery = await db.select({ count: sql2`count(*)` }).from(refCommissions).where(
            and(
              eq(refCommissions.referrerId, userId),
              eq(refCommissions.status, status)
            )
          );
          const total = totalQuery[0]?.count || 0;
          const totalPages = Math.ceil(total / limit);
          const offset = (page - 1) * limit;
          const referrals = await db.select().from(refCommissions).where(
            and(
              eq(refCommissions.referrerId, userId),
              eq(refCommissions.status, status)
            )
          ).orderBy(desc(refCommissions.createdAt)).limit(limit).offset(offset);
          return {
            referrals,
            pagination: {
              total,
              totalPages,
              currentPage: page,
              limit
            }
          };
        } catch (error) {
          console.error("Error getting referral commissions:", error);
          return {
            referrals: [],
            pagination: { total: 0, totalPages: 0, currentPage: page, limit }
          };
        }
      }
      async createRefCommission(commission) {
        try {
          const [newCommission] = await db.insert(refCommissions).values({
            ...commission,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newCommission;
        } catch (error) {
          console.error("Error creating referral commission:", error);
          throw error;
        }
      }
      async updateRefCommissionStatus(id, status) {
        try {
          const [updated] = await db.update(refCommissions).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(refCommissions.id, id)).returning();
          return updated || void 0;
        } catch (error) {
          console.error("Error updating referral commission status:", error);
          return void 0;
        }
      }
      async getReferralStats(userId) {
        try {
          const commissions = await db.select().from(refCommissions).where(eq(refCommissions.referrerId, userId));
          const totalEarnings = commissions.reduce((sum, commission) => {
            return sum + (commission.status === "paid" ? commission.referralAmount : 0);
          }, 0);
          const referredUserCount = commissions.length;
          const pendingCount = commissions.filter(
            (c) => c.status === "pending"
          ).length;
          const paidCount = commissions.filter((c) => c.status === "paid").length;
          return { totalEarnings, referredUserCount, pendingCount, paidCount };
        } catch (error) {
          console.error("Error getting referral stats:", error);
          return {
            totalEarnings: 0,
            referredUserCount: 0,
            pendingCount: 0,
            paidCount: 0
          };
        }
      }
      // Get referral commission amount from settings
      async getReferralCommissionAmount() {
        try {
          const setting = await this.getSetting("Referral_Commission");
          return setting ? parseFloat(setting.value) : 3;
        } catch (error) {
          console.error("Error getting referral commission amount:", error);
          return 3;
        }
      }
      // Secure method to process referral commission on first order completion
      async processReferralCommission(orderId, buyerId) {
        try {
          const buyer = await this.getUser(buyerId);
          if (!buyer || !buyer.referredBy) {
            console.log(`Buyer ${buyerId} not found or not referred by anyone`);
            return false;
          }
          const existingCommissions = await db.select().from(refCommissions).where(
            and(
              eq(refCommissions.referrerId, buyer.referredBy),
              eq(refCommissions.referredUserId, buyerId)
            )
          );
          if (existingCommissions.length === 0) {
            console.log(`No referral commission record found for buyer ${buyerId}`);
            return false;
          }
          const pendingCommission = existingCommissions.find(
            (c) => c.status === "pending"
          );
          if (!pendingCommission) {
            console.log(
              `No pending referral commission found for buyer ${buyerId}`
            );
            return false;
          }
          const completedOrders = await db.select().from(orders).where(
            and(eq(orders.buyerId, buyerId), eq(orders.status, "completed"))
          );
          if (completedOrders.length > 1) {
            console.log(
              `Buyer ${buyerId} has already completed ${completedOrders.length} orders, referral commission not applicable`
            );
            return false;
          }
          const commissionAmount = await this.getReferralCommissionAmount();
          await db.update(refCommissions).set({
            status: "paid",
            orderId,
            referralAmount: commissionAmount,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(refCommissions.id, pendingCommission.id));
          await this.addFunds(
            buyer.referredBy,
            commissionAmount,
            `Referral commission for ${buyer.username}'s first order`
          );
          console.log(
            `Referral commission of $${commissionAmount} processed for referrer ${buyer.referredBy}`
          );
          return true;
        } catch (error) {
          console.error("Error processing referral commission:", error);
          return false;
        }
      }
      // Create referral commission record when user registers with referral
      async createReferralRecord(referredUserId, referrerId, referredUserName) {
        try {
          const existing = await db.select().from(refCommissions).where(
            and(
              eq(refCommissions.referrerId, referrerId),
              eq(refCommissions.referredUserId, referredUserId)
            )
          );
          if (existing.length > 0) {
            console.log(
              `Referral commission record already exists for user ${referredUserId}`
            );
            return false;
          }
          const commissionAmount = await this.getReferralCommissionAmount();
          await this.createRefCommission({
            referrerId,
            referredUserId,
            referralAmount: commissionAmount,
            status: "pending",
            referredUserName
          });
          console.log(
            `Referral commission record created for ${referredUserName} referred by ${referrerId}`
          );
          return true;
        } catch (error) {
          console.error("Error creating referral record:", error);
          return false;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/objectStorage.ts
var objectStorage_exports = {};
__export(objectStorage_exports, {
  ObjectNotFoundError: () => ObjectNotFoundError,
  ObjectStorageService: () => ObjectStorageService,
  objectStorageClient: () => objectStorageClient
});
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
function parseObjectPath(path6) {
  if (!path6.startsWith("/")) {
    path6 = `/${path6}`;
  }
  const pathParts = path6.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
var REPLIT_SIDECAR_ENDPOINT, objectStorageClient, ObjectNotFoundError, ObjectStorageService;
var init_objectStorage = __esm({
  "server/objectStorage.ts"() {
    "use strict";
    REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
    objectStorageClient = new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token"
          }
        },
        universe_domain: "googleapis.com"
      },
      projectId: ""
    });
    ObjectNotFoundError = class _ObjectNotFoundError extends Error {
      constructor() {
        super("Object not found");
        this.name = "ObjectNotFoundError";
        Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
      }
    };
    ObjectStorageService = class {
      constructor() {
      }
      // Gets the public object search paths.
      getPublicObjectSearchPaths() {
        const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
        const paths = Array.from(
          new Set(
            pathsStr.split(",").map((path6) => path6.trim()).filter((path6) => path6.length > 0)
          )
        );
        if (paths.length === 0) {
          throw new Error(
            "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
          );
        }
        return paths;
      }
      // Gets the private object directory.
      getPrivateObjectDir() {
        const dir = process.env.PRIVATE_OBJECT_DIR || "";
        if (!dir) {
          throw new Error(
            "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
          );
        }
        return dir;
      }
      // Search for a public object from the search paths.
      async searchPublicObject(filePath) {
        for (const searchPath of this.getPublicObjectSearchPaths()) {
          const fullPath = `${searchPath}/${filePath}`;
          const { bucketName, objectName } = parseObjectPath(fullPath);
          const bucket = objectStorageClient.bucket(bucketName);
          const file = bucket.file(objectName);
          const [exists] = await file.exists();
          if (exists) {
            return file;
          }
        }
        return null;
      }
      // Downloads an object to the response.
      async downloadObject(file, res, cacheTtlSec = 3600) {
        try {
          const [metadata] = await file.getMetadata();
          res.set({
            "Content-Type": metadata.contentType || "application/octet-stream",
            "Content-Length": metadata.size,
            "Cache-Control": `public, max-age=${cacheTtlSec}`
          });
          const stream = file.createReadStream();
          stream.on("error", (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({ error: "Error streaming file" });
            }
          });
          stream.pipe(res);
        } catch (error) {
          console.error("Error downloading file:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error downloading file" });
          }
        }
      }
      // Gets the upload URL for a profile picture
      async getProfilePictureUploadURL(userId) {
        const privateObjectDir = this.getPrivateObjectDir();
        if (!privateObjectDir) {
          throw new Error(
            "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
          );
        }
        const objectId = `profile-${userId}-${randomUUID()}`;
        const fullPath = `${privateObjectDir}/avatars/${objectId}`;
        const { bucketName, objectName } = parseObjectPath(fullPath);
        return signObjectURL({
          bucketName,
          objectName,
          method: "PUT",
          ttlSec: 900
        });
      }
      // Gets the profile picture file for a user
      async getProfilePictureFile(avatarPath) {
        if (!avatarPath || !avatarPath.startsWith("/avatars/")) {
          return null;
        }
        let privateDir = this.getPrivateObjectDir();
        if (!privateDir.endsWith("/")) {
          privateDir = `${privateDir}/`;
        }
        const fullPath = `${privateDir}${avatarPath.slice(1)}`;
        const { bucketName, objectName } = parseObjectPath(fullPath);
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        const [exists] = await file.exists();
        if (!exists) {
          return null;
        }
        return file;
      }
      // Normalizes the profile picture path from upload URL
      normalizeProfilePicturePath(rawPath, userId) {
        if (!rawPath.startsWith("https://storage.googleapis.com/")) {
          return rawPath;
        }
        const url = new URL(rawPath);
        const rawObjectPath = url.pathname;
        let privateDir = this.getPrivateObjectDir();
        if (!privateDir.endsWith("/")) {
          privateDir = `${privateDir}/`;
        }
        const avatarsPath = `${privateDir}avatars/`;
        if (!rawObjectPath.startsWith(avatarsPath)) {
          return rawObjectPath;
        }
        const filename = rawObjectPath.slice(avatarsPath.length);
        return `/avatars/${filename}`;
      }
    };
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path5 from "path";

// server/routes.ts
import { createServer } from "http";

// server/middleware/audit.ts
var AuditLogger = class {
  logs = [];
  maxLogs = 1e4;
  // Keep last 10k logs in memory
  log(entry) {
    this.logs.push({
      ...entry,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    console.log("[AUDIT]", JSON.stringify(entry));
  }
  getLogs(limit = 100, offset = 0) {
    return this.logs.slice(offset, offset + limit);
  }
  getLogsByUser(userId, limit = 100) {
    return this.logs.filter((log2) => log2.userId === userId).slice(-limit);
  }
  getLogsByAction(action, limit = 100) {
    return this.logs.filter((log2) => log2.action === action).slice(-limit);
  }
};
var auditLogger = new AuditLogger();
var auditLogin = (req, success, userId, errorMessage) => {
  auditLogger.log({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action: "LOGIN_ATTEMPT",
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    success,
    errorMessage,
    additionalData: {
      email: req.body.email || req.body.username
    }
  });
};
var auditRegistration = (req, success, userId, errorMessage) => {
  auditLogger.log({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action: "REGISTRATION_ATTEMPT",
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    success,
    errorMessage,
    additionalData: {
      email: req.body.email,
      username: req.body.username
    }
  });
};
var auditPasswordChange = (req, userId, success, errorMessage) => {
  auditLogger.log({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action: "PASSWORD_CHANGE",
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    success,
    errorMessage
  });
};
var auditSiteSubmission = (req, userId, siteId, success, errorMessage) => {
  auditLogger.log({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action: "SITE_SUBMISSION",
    resource: "site",
    resourceId: siteId,
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    success,
    errorMessage,
    additionalData: {
      domain: req.body.domain
    }
  });
};
var auditOrderAction = (req, userId, orderId, action, success, errorMessage) => {
  auditLogger.log({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action: `ORDER_${action.toUpperCase()}`,
    resource: "order",
    resourceId: orderId,
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    success,
    errorMessage
  });
};
var auditFinancialAction = (req, userId, action, amount, success, errorMessage) => {
  auditLogger.log({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    action: `FINANCIAL_${action.toUpperCase()}`,
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    success,
    errorMessage,
    additionalData: {
      amount
    }
  });
};

// server/routes.ts
init_schema();
import { z as z2 } from "zod";

// server/security-system.ts
var SecuritySystem = class {
  storage;
  antiDdosCache = null;
  CACHE_DURATION = 3e4;
  // 30 seconds cache
  constructor(storage3) {
    this.storage = storage3;
  }
  /**
   * Get the current Anti-DDoS protection status with caching
   * This prevents excessive database queries while maintaining real-time updates
   */
  async isAntiDdosEnabled() {
    const now = Date.now();
    if (this.antiDdosCache && now - this.antiDdosCache.lastCheck < this.CACHE_DURATION) {
      return this.antiDdosCache.enabled;
    }
    try {
      const setting = await this.storage.getSetting("antiDdosEnabled");
      const enabled = setting?.value === "true";
      this.antiDdosCache = {
        enabled,
        lastCheck: now
      };
      return enabled;
    } catch (error) {
      console.error("Failed to fetch Anti-DDoS setting:", error);
      return true;
    }
  }
  /**
   * Force refresh the Anti-DDoS cache
   * Call this when the setting is updated through admin panel
   */
  async refreshAntiDdosCache() {
    this.antiDdosCache = null;
    return await this.isAntiDdosEnabled();
  }
  /**
   * Check if Anti-DDoS protection should be applied to a user
   * Only applies to regular users, not admins or employees
   * If userRole is undefined (unknown user), apply protection by default for security
   */
  async shouldApplyAntiDdos(userRole) {
    if (userRole === "admin" || userRole === "employee") {
      return false;
    }
    return await this.isAntiDdosEnabled();
  }
  /**
   * Handle failed login with Anti-DDoS logic
   */
  async handleFailedLogin(ipAddress, email, userRole) {
    if (!await this.shouldApplyAntiDdos(userRole)) {
      return null;
    }
    const existingAccess = await this.storage.getSecurityLoginAccess(ipAddress);
    if (existingAccess) {
      const newAttemptCount = existingAccess.attemptCount + 1;
      const now = /* @__PURE__ */ new Date();
      let lockedUntil = null;
      if (newAttemptCount >= 3) {
        lockedUntil = new Date(now.getTime() + 60 * 60 * 1e3);
      }
      await this.storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: newAttemptCount,
        lastAttempt: now,
        lockedUntil,
        lastEmail: email
      });
      if (newAttemptCount >= 3) {
        return "Too many failed attempts. You are temporarily blocked for 1 hour.";
      }
    } else {
      await this.storage.createSecurityLoginAccess({
        ipAddress,
        attemptCount: 1,
        lastAttempt: /* @__PURE__ */ new Date(),
        lastEmail: email
      });
    }
    return null;
  }
  /**
   * Check if an IP is currently locked and return lockout info
   */
  async isIpLocked(ipAddress, userRole) {
    if (!await this.shouldApplyAntiDdos(userRole)) {
      return false;
    }
    return await this.storage.isIpLocked(ipAddress);
  }
  /**
   * Get detailed lockout information for an IP address
   * Returns null if not locked, or lockout details including countdown
   */
  async getLockoutInfo(ipAddress, userRole) {
    if (!await this.shouldApplyAntiDdos(userRole)) {
      return { isLocked: false };
    }
    const accessRecord = await this.storage.getSecurityLoginAccess(ipAddress);
    if (!accessRecord || !accessRecord.lockedUntil) {
      return { isLocked: false };
    }
    const now = /* @__PURE__ */ new Date();
    const lockedUntil = new Date(accessRecord.lockedUntil);
    if (now >= lockedUntil) {
      await this.cleanupExpiredLockout(ipAddress);
      return { isLocked: false };
    }
    if (accessRecord.attemptCount < 3) {
      return { isLocked: false };
    }
    const remainingMs = lockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / (1e3 * 60));
    const remainingSeconds = Math.floor(remainingMs % (1e3 * 60) / 1e3);
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
  async cleanupExpiredLockout(ipAddress) {
    try {
      await this.storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: 0,
        lockedUntil: null,
        lastAttempt: /* @__PURE__ */ new Date()
      });
      console.log(`Cleaned up expired lockout for IP: ${ipAddress}`);
    } catch (error) {
      console.error(`Failed to cleanup expired lockout for IP ${ipAddress}:`, error);
    }
  }
  /**
   * Clean up all expired lockouts (can be called periodically)
   */
  async cleanupAllExpiredLockouts() {
    try {
      const now = /* @__PURE__ */ new Date();
      await this.storage.cleanupExpiredSecurityLockouts(now);
      console.log(`Cleaned up all expired lockouts before ${now.toISOString()}`);
    } catch (error) {
      console.error("Failed to cleanup expired lockouts:", error);
    }
  }
  /**
   * Reset security access for successful login
   */
  async resetSecurityAccess(ipAddress, email, userRole) {
    const isAntiDdosEnabled = await this.isAntiDdosEnabled();
    if (isAntiDdosEnabled || userRole === "employee" || userRole === "admin") {
      await this.storage.updateSecurityLoginAccess(ipAddress, {
        attemptCount: 0,
        lockedUntil: null,
        lastAttempt: /* @__PURE__ */ new Date(),
        lastEmail: email
      });
    }
  }
};
var securitySystem = null;
function initializeSecuritySystem(storage3) {
  securitySystem = new SecuritySystem(storage3);
  return securitySystem;
}
function getSecuritySystem() {
  if (!securitySystem) {
    throw new Error("Security system not initialized. Call initializeSecuritySystem first.");
  }
  return securitySystem;
}

// server/email-service.ts
init_storage();
import nodemailer from "nodemailer";
var EmailService = class {
  transporter = null;
  async initTransporter() {
    const config = await storage.getSmtpConfig();
    if (!config || !config.enabled) {
      throw new Error("SMTP is not enabled or configured");
    }
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!config.smtpHost || !config.smtpPort || !smtpUser || !smtpPass) {
      throw new Error(
        "SMTP configuration is incomplete. Check database settings and SMTP_USER/SMTP_PASS environment variables."
      );
    }
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  async sendVerificationLink(email, token, firstName) {
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
              \xA9 2025 OutMarkly. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
    const result = await this.transporter.sendMail(mailOptions);
    return result;
  }
  async sendPasswordResetLink(email, token, firstName) {
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
              \xA9 2025 OutMarkly. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
    const result = await this.transporter.sendMail(mailOptions);
    return result;
  }
  async testConnection() {
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
};
var emailService = new EmailService();

// server/reminder-email-service.ts
import nodemailer2 from "nodemailer";
var ReminderEmailService = class {
  transporter = null;
  storage;
  constructor(storage3) {
    this.storage = storage3;
  }
  async initializeTransporter() {
    if (this.transporter) return this.transporter;
    try {
      const smtpConfig = await this.storage.getSmtpConfig();
      if (!smtpConfig || !smtpConfig.enabled) {
        throw new Error("SMTP is not enabled or configured");
      }
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (!smtpConfig.smtpHost || !smtpConfig.smtpPort || !smtpUser || !smtpPass) {
        throw new Error(
          "SMTP configuration is incomplete. Check database settings and SMTP_USER/SMTP_PASS environment variables."
        );
      }
      this.transporter = nodemailer2.createTransport({
        host: smtpConfig.smtpHost,
        port: smtpConfig.smtpPort,
        secure: smtpConfig.smtpPort === 465,
        // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      return this.transporter;
    } catch (error) {
      console.error("Failed to initialize SMTP transporter:", error);
      throw error;
    }
  }
  createGuestPostReminderTemplate(data, isForBuyer) {
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
                <strong>\u23F0 Friendly Reminder:</strong> This is a follow-up regarding your ${isForBuyer ? "guest post order" : "guest post order"} that requires attention.
            </div>
            
            <p>Hello ${isForBuyer ? data.buyerName : data.sellerName},</p>
            
            <p>This is a gentle reminder about your guest post order that ${isForBuyer ? "is currently in progress" : "requires your attention"}. Our team wanted to follow up to ensure everything is moving smoothly.</p>
            
            <div class="order-card">
                <div class="order-id">Order #${data.orderId}</div>
                <div class="detail-row">
                    <span class="detail-label">${isForBuyer ? "Purchased from:" : "Sold to:"}</span>
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
            
            <p>${isForBuyer ? `As the buyer, you may want to check the progress of your guest post order and communicate with ${data.sellerName} if needed.` : `As the seller, please ensure you're providing timely updates to ${data.buyerName} and delivering quality content as agreed.`}</p>
            
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
  createExchangeReminderTemplate(data, isForRequester) {
    const subject = `Link Collaboration Reminder for ${data.siteA} \u2194 ${data.siteB}`;
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
                <strong>\u{1F517} Friendly Reminder:</strong> This is a follow-up regarding your link collaboration that ${data.status === "pending" ? "is awaiting response" : "is currently active"}.
            </div>
            
            <p>Hello ${isForRequester ? data.requesterName : data.partnerName},</p>
            
            <p>This is a gentle reminder about your link collaboration ${data.status === "pending" ? "that requires your attention" : "that is currently in progress"}. Our team wanted to follow up to ensure everything is moving smoothly.</p>
            
            <div class="exchange-card">
                <div class="exchange-id">Collaboration #${data.exchangeId}</div>
                <div class="sites-exchange">
                    ${data.siteA} <span class="exchange-arrow">\u2194</span> ${data.siteB}
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isForRequester ? "Partner:" : "Requester:"}</span>
                    <span class="detail-value">${isForRequester ? data.partnerName : data.requesterName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="status-badge ${data.status === "pending" ? "status-pending" : "status-active"}">
                            ${data.status}
                        </span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Collaboration Date:</span>
                    <span class="detail-value">${data.createdDate}</span>
                </div>
            </div>
            
            <p>${data.status === "pending" ? isForRequester ? `Your link collaboration request is still awaiting a response from ${data.partnerName}. You may want to reach out or wait for their reply.` : `${data.requesterName} has sent you a link collaboration request that requires your attention. Please review and respond at your earliest convenience.` : isForRequester ? `Your link collaboration with ${data.partnerName} is active. Please ensure you're fulfilling your part of the collaboration.` : `Your link collaboration with ${data.requesterName} is active. Please ensure you're fulfilling your part of the collaboration.`}</p>
            
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
  async sendExchangeReminder(requesterEmail, requestedEmail, data) {
    const results = {
      requester: null,
      requested: null
    };
    try {
      const transporter = await this.initializeTransporter();
      const smtpConfig = await this.storage.getSmtpConfig();
      if (!smtpConfig) {
        throw new Error("SMTP configuration not found");
      }
      const requesterTemplate = this.createExchangeReminderTemplate(data, true);
      const requesterResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: requesterEmail,
        subject: requesterTemplate.subject,
        html: requesterTemplate.html
      });
      results.requester = { success: true, messageId: requesterResult.messageId };
      const requestedTemplate = this.createExchangeReminderTemplate(data, false);
      const requestedResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: requestedEmail,
        subject: requestedTemplate.subject,
        html: requestedTemplate.html
      });
      results.requested = { success: true, messageId: requestedResult.messageId };
    } catch (error) {
      console.error("Error sending exchange reminder emails:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (!results.requester) results.requester = { success: false, error: errorMessage };
      if (!results.requested) results.requested = { success: false, error: errorMessage };
    }
    return results;
  }
  // Send guest post reminder to both parties
  async sendGuestPostReminder(buyerEmail, sellerEmail, data) {
    const results = {
      buyer: null,
      seller: null
    };
    try {
      const transporter = await this.initializeTransporter();
      const smtpConfig = await this.storage.getSmtpConfig();
      if (!smtpConfig) {
        throw new Error("SMTP configuration not found");
      }
      const buyerTemplate = this.createGuestPostReminderTemplate(data, true);
      const buyerResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: buyerEmail,
        subject: buyerTemplate.subject,
        html: buyerTemplate.html
      });
      results.buyer = { success: true, messageId: buyerResult.messageId };
      const sellerTemplate = this.createGuestPostReminderTemplate(data, false);
      const sellerResult = await transporter.sendMail({
        from: `"${smtpConfig.fromName || "OutMarkly"}" <${smtpConfig.fromEmail || "noreply@OutMarkly.com"}>`,
        to: sellerEmail,
        subject: sellerTemplate.subject,
        html: sellerTemplate.html
      });
      results.seller = { success: true, messageId: sellerResult.messageId };
    } catch (error) {
      console.error("Error sending guest post reminder emails:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (!results.buyer) results.buyer = { success: false, error: errorMessage };
      if (!results.seller) results.seller = { success: false, error: errorMessage };
    }
    return results;
  }
};

// server/routes.ts
init_objectStorage();
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { randomUUID as randomUUID2 } from "crypto";

// server/file-storage.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
var uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown";
    const timestamp2 = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${timestamp2}${ext}`);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed."));
  }
};
var uploadAvatar = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024
    // 1MB limit
  }
});
async function processAvatarImage(filePath) {
  const processedPath = filePath.replace(/\.[^/.]+$/, "-processed.jpg");
  await sharp(filePath).resize(300, 300, {
    fit: "cover",
    position: "center"
  }).jpeg({ quality: 90 }).toFile(processedPath);
  fs.unlinkSync(filePath);
  return processedPath;
}

// server/routes.ts
function formatCurrency(dollars) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}
var sanitizeInput = (input) => {
  if (!input) return input;
  const cleaned = input.replace(/<[^>]*>/g, "").replace(/[<>\"'&]/g, "");
  return cleaned.trim();
};
var generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
var sanitizeNumericInput = (input) => {
  if (typeof input === "number") return input;
  const parsed = parseInt(String(input).replace(/[^0-9]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};
async function registerRoutes(app2) {
  const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { refCommissions: refCommissions2, users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq2, and: and2, desc: desc2, sql: sql3 } = await import("drizzle-orm");
  initializeSecuritySystem(storage3);
  const reminderEmailService = new ReminderEmailService(storage3);
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const sanitizedBody = {
        ...req.body,
        username: sanitizeInput(req.body.username),
        email: sanitizeInput(req.body.email),
        firstName: sanitizeInput(req.body.firstName),
        lastName: sanitizeInput(req.body.lastName),
        company: req.body.company ? sanitizeInput(req.body.company) : void 0,
        bio: req.body.bio ? sanitizeInput(req.body.bio) : void 0
      };
      const userData = insertUserSchema.parse(sanitizedBody);
      const clientIp = req.ip || "unknown";
      const isIPBanned = await storage3.isIPBanned(clientIp);
      if (isIPBanned) {
        auditRegistration(req, false, void 0, "Banned IP attempted registration");
        return res.status(403).json({ message: "Access denied. Your IP address has been banned." });
      }
      const isEmailBanned = await storage3.isEmailBanned(userData.email);
      if (isEmailBanned) {
        auditRegistration(req, false, void 0, "Banned email attempted registration");
        return res.status(403).json({ message: "Access denied. This email address has been banned." });
      }
      const existingUser = await storage3.getUserByEmail(userData.email);
      if (existingUser) {
        auditRegistration(req, false, void 0, "Email already registered");
        return res.status(400).json({ message: "This email address is already registered. Please use a different email or try signing in." });
      }
      const existingUsername = await storage3.getUserByUsername(userData.username);
      if (existingUsername) {
        auditRegistration(req, false, void 0, "Username already taken");
        return res.status(400).json({ message: "This username is already taken. Please choose a different username." });
      }
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const referralCode = req.body.referralCode || req.headers["x-referral-code"] || req.query.ref;
      let referrerId = null;
      if (referralCode) {
        let referrer = await storage3.getUserByUsername(referralCode);
        if (!referrer) {
          referrer = await storage3.getUser(referralCode);
        }
        if (referrer) {
          referrerId = referrer.id;
          console.log(`User ${userData.username} was referred by ${referrer.username} (referral code: ${referralCode})`);
        }
      }
      const requiresEmailVerification = await storage3.isEmailVerificationRequired();
      console.log("Email verification required:", requiresEmailVerification);
      const user = await storage3.createUser({
        ...userData,
        password: hashedPassword,
        // Store hashed password
        registrationIp: req.ip,
        referredBy: referrerId,
        // Track who referred this user
        emailVerified: !requiresEmailVerification
        // If verification is not required, mark as verified immediately
      });
      auditRegistration(req, true, user.id);
      await storage3.createAdminActivity({
        type: "signup",
        data: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          ipAddress: req.ip,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          username: user.username
        })
      });
      if (referrerId) {
        try {
          await storage3.createReferralRecord(user.id, referrerId, user.username);
          console.log(`Referral record created for ${user.username}`);
        } catch (error) {
          console.error("Error creating referral record:", error);
        }
      }
      if (!requiresEmailVerification) {
        console.log("Email verification not required, logging user in immediately");
        req.session.user = user;
        const platformName = await storage3.getPlatformName();
        res.json({
          message: `Registration successful! Welcome to ${platformName}.`,
          requiresVerification: false,
          user
        });
        return;
      }
      console.log("Email verification required, sending verification email");
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      try {
        await storage3.createEmailVerificationToken({
          userId: user.id,
          email: user.email,
          token: verificationToken,
          expiresAt
        });
        const isSmtpEnabled = await storage3.isSmtpEnabled();
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
        res.json({
          message: "Registration successful! However, there was an issue sending the verification link. Please contact support.",
          requiresVerification: true,
          email: user.email,
          smtpEnabled: false
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message;
      let userMessage = "Registration failed. Please check your information and try again.";
      if (errorMessage.includes("duplicate key") || errorMessage.includes("already exists")) {
        if (errorMessage.includes("email")) {
          userMessage = "This email address is already registered. Please use a different email or try signing in.";
        } else if (errorMessage.includes("username")) {
          userMessage = "This username is already taken. Please choose a different username.";
        }
      }
      auditRegistration(req, false, void 0, "Registration failed: " + errorMessage);
      res.status(400).json({ message: userMessage });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIp = req.ip;
      const isIPBanned = await storage3.isIPBanned(clientIp || "unknown");
      if (isIPBanned) {
        auditLogin(req, false, void 0, "Banned IP attempted login");
        return res.status(403).json({ message: "Access denied. Your IP address has been banned." });
      }
      const isEmailBanned = await storage3.isEmailBanned(email);
      if (isEmailBanned) {
        auditLogin(req, false, void 0, "Banned email attempted login");
        return res.status(403).json({ message: "Access denied. This email address has been banned." });
      }
      const user = await storage3.getUserByEmail(email);
      const securitySystem2 = getSecuritySystem();
      const lockoutInfo = await securitySystem2.getLockoutInfo(clientIp || "unknown", user?.role);
      if (lockoutInfo && lockoutInfo.isLocked) {
        auditLogin(req, false, void 0, "IP address is temporarily locked");
        return res.status(423).json({
          message: lockoutInfo.message,
          lockedUntil: lockoutInfo.lockedUntil,
          remainingMinutes: lockoutInfo.remainingMinutes,
          remainingSeconds: lockoutInfo.remainingSeconds,
          isLocked: true
        });
      }
      if (user && user.role === "admin") {
        auditLogin(req, false, user.id, "Admin user attempted regular login");
        await securitySystem2.handleFailedLogin(clientIp || "unknown", email, user.role);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user) {
        auditLogin(req, false, void 0, "User not found");
        await securitySystem2.handleFailedLogin(clientIp || "unknown", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!password) {
        auditLogin(req, false, user.id, "No password provided");
        await securitySystem2.handleFailedLogin(clientIp || "unknown", email, user.role);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      let passwordValid = false;
      if (user.password) {
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
          passwordValid = await bcrypt.compare(password, user.password);
        } else {
          passwordValid = user.password === password;
          if (passwordValid) {
            const hashedPassword = await bcrypt.hash(password, 12);
            await storage3.updateUser(user.id, { password: hashedPassword });
          }
        }
      } else {
        passwordValid = false;
      }
      if (!passwordValid) {
        auditLogin(req, false, user.id, "Invalid password");
        await securitySystem2.handleFailedLogin(clientIp || "unknown", email, user.role);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const requiresEmailVerification = await storage3.isEmailVerificationRequired();
      if (requiresEmailVerification && !user.emailVerified) {
        auditLogin(req, false, user.id, "Email not verified");
        return res.status(403).json({
          message: "Please verify your email address before logging in. Check your email for a verification link.",
          requiresVerification: true,
          email: user.email
        });
      }
      await securitySystem2.resetSecurityAccess(clientIp || "unknown", email, user.role);
      await storage3.updateUser(user.id, {
        lastLoginIp: req.ip,
        lastLoginAt: /* @__PURE__ */ new Date()
      });
      req.session.user = user;
      auditLogin(req, true, user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      auditLogin(req, false, void 0, "Login error: " + error.message);
      res.status(400).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIp = req.ip;
      const isIPBanned = await storage3.isIPBanned(clientIp || "unknown");
      if (isIPBanned) {
        auditLogin(req, false, void 0, "Banned IP attempted admin login");
        return res.status(403).json({ message: "Access denied. Your IP address has been banned." });
      }
      const isEmailBanned = await storage3.isEmailBanned(email);
      if (isEmailBanned) {
        auditLogin(req, false, void 0, "Banned email attempted admin login");
        return res.status(403).json({ message: "Access denied. This email address has been banned." });
      }
      const adminUser = await storage3.getUserByEmail(email);
      if (!adminUser) {
        return res.status(401).json({ message: "Admin user not found" });
      }
      if (adminUser.role !== "admin") {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      let passwordValid = false;
      if (adminUser.password) {
        if (adminUser.password.startsWith("$2a$") || adminUser.password.startsWith("$2b$")) {
          passwordValid = await bcrypt.compare(password, adminUser.password);
        } else {
          passwordValid = adminUser.password === password;
          if (passwordValid) {
            const hashedPassword = await bcrypt.hash(password, 12);
            await storage3.updateUser(adminUser.id, { password: hashedPassword });
          }
        }
      } else {
        passwordValid = false;
      }
      if (!passwordValid) {
        auditLogin(req, false, adminUser.id, "Invalid admin password");
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      await storage3.updateUser(adminUser.id, {
        lastLoginIp: req.ip,
        lastLoginAt: /* @__PURE__ */ new Date()
      });
      req.session.user = adminUser;
      auditLogin(req, true, adminUser.id);
      const { password: _, ...adminWithoutPassword } = adminUser;
      res.json({ user: adminWithoutPassword });
    } catch (error) {
      auditLogin(req, false, void 0, "Admin login error: " + error.message);
      res.status(400).json({ message: "Admin login failed" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      if (req.session) {
        delete req.session.user;
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true,
          secure: false
          // Set to true in production with HTTPS
        });
        console.log("Logout successful - session destroyed");
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/auth/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.redirect(`/auth?verified=false&error=missing_token`);
      }
      const tokenData = await storage3.getEmailVerificationToken(token);
      if (!tokenData) {
        return res.redirect(`/verify-email?token=${token}&error=invalid`);
      }
      res.redirect(`/verify-email?token=${token}`);
    } catch (error) {
      console.error("Email verification error:", error);
      res.redirect(`/auth?verified=false&error=verification_failed`);
    }
  });
  app2.get("/api/auth/verify-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ success: false, message: "Verification token is required" });
      }
      const isValid = await storage3.verifyEmailToken(token);
      if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
      }
      return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ success: false, message: "An error occurred during verification" });
    }
  });
  app2.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage3.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      const latestToken = await storage3.getLatestVerificationTokenForUser(user.id);
      if (latestToken && latestToken.createdAt) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1e3);
        if (latestToken.createdAt > tenMinutesAgo) {
          const remainingTime = Math.ceil((10 * 60 * 1e3 - (Date.now() - latestToken.createdAt.getTime())) / 1e3 / 60);
          return res.status(429).json({
            message: `Please wait ${remainingTime} more minutes before requesting a new verification link`,
            canResendAt: new Date(latestToken.createdAt.getTime() + 10 * 60 * 1e3)
          });
        }
      }
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await storage3.createEmailVerificationToken({
        userId: user.id,
        email: user.email,
        token: verificationToken,
        expiresAt
      });
      const isSmtpEnabled = await storage3.isSmtpEnabled();
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
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage3.getUserByEmail(email);
      if (!user) {
        return res.json({
          message: "If an account with that email exists, a password reset link has been sent.",
          emailSent: true
        });
      }
      const resetToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await storage3.createPasswordResetToken({
        userId: user.id,
        email: user.email,
        token: resetToken,
        isUsed: false,
        expiresAt
      });
      const isSmtpEnabled = await storage3.isSmtpEnabled();
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
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const resetToken = await storage3.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const updatedUser = await storage3.updateUser(resetToken.userId, {
        password: hashedPassword
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage3.markPasswordResetTokenUsed(resetToken.id);
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/admin/smtp-config", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const config = await storage3.getSmtpConfig();
      res.json(config || null);
    } catch (error) {
      console.error("Error getting SMTP config:", error);
      res.status(500).json({ message: "Failed to get SMTP configuration" });
    }
  });
  app2.post("/api/admin/smtp-config", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const configData = insertSmtpSystemSchema.parse(req.body);
      const config = await storage3.updateSmtpConfig(configData);
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
        config
      });
    } catch (error) {
      console.error("Error updating SMTP config:", error);
      res.status(500).json({ message: "Failed to update SMTP configuration" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
      const sessionId = req.sessionID;
      const sessionUser = req.session.user;
      if (!sessionUser) {
        console.log(`Session check failed - ID: ${sessionId}, Session exists: ${!!req.session}, User in session: ${!!sessionUser}`);
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { password, ...userWithoutPassword } = sessionUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.id && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access this user data" });
      }
      const user = await storage3.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }
      const updates = req.body;
      console.log("Updating user profile:", req.params.id, updates);
      const user = await storage3.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.session.user = user;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.put("/api/users/:id/password", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized to update this password" });
      }
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.id;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      const user = await storage3.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let passwordValid = false;
      if (user.password) {
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
          passwordValid = await bcrypt.compare(currentPassword, user.password);
        } else {
          passwordValid = user.password === currentPassword;
        }
      }
      if (!passwordValid) {
        auditPasswordChange(req, userId, false, "Invalid current password");
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      const updatedUser = await storage3.updateUser(userId, { password: hashedNewPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      auditPasswordChange(req, userId, true);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      const sessionUser = req.session.user;
      auditPasswordChange(req, sessionUser?.id || "unknown", false, error.message);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  app2.get("/api/sites/user/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these sites" });
      }
      const sites2 = await storage3.getSitesByUserId(req.params.userId);
      res.json(sites2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });
  app2.get("/api/sites/directory", async (req, res) => {
    try {
      const sites2 = await storage3.getAllApprovedSites();
      res.json(sites2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directory" });
    }
  });
  app2.post("/api/sites", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sanitizedBody = {
        ...req.body,
        domain: sanitizeInput(req.body.domain),
        title: sanitizeInput(req.body.title),
        description: req.body.description ? sanitizeInput(req.body.description) : void 0,
        category: sanitizeInput(req.body.category),
        language: sanitizeInput(req.body.language),
        domainAuthority: sanitizeNumericInput(req.body.domainAuthority),
        drScore: sanitizeNumericInput(req.body.drScore),
        monthlyTraffic: sanitizeNumericInput(req.body.monthlyTraffic),
        price: req.body.price ? sanitizeNumericInput(req.body.price) : void 0,
        turnaroundTime: req.body.turnaroundTime ? sanitizeNumericInput(req.body.turnaroundTime) : void 0
      };
      const siteData = insertSiteSchema.parse(sanitizedBody);
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      if (sessionUser.id !== userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to create site for this user" });
      }
      if (siteData.price !== void 0 && siteData.price !== null) {
        siteData.price = siteData.price;
      }
      const site = await storage3.createSite({ ...siteData, userId });
      auditSiteSubmission(req, userId, site.id, true);
      res.json(site);
    } catch (error) {
      console.log("Site creation error:", error.message);
      const sessionUser = req.session.user;
      auditSiteSubmission(req, sessionUser?.id || "unknown", "unknown", false, error.message);
      if (error?.message && (error.message.includes("already added") || error.message.includes("under review") || error.message.includes("approved") || error.message.includes("rejected"))) {
        return res.status(409).json({ message: error.message });
      }
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Please check your site information and try again." });
      }
      res.status(400).json({ message: error.message || "Invalid site data" });
    }
  });
  app2.put("/api/sites/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const existingSite = await storage3.getSite(req.params.id);
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      if (sessionUser.id !== existingSite.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update this site" });
      }
      const updates = { ...req.body };
      if (updates.price !== void 0 && updates.price !== null) {
        updates.price = updates.price;
      }
      const site = await storage3.updateSite(req.params.id, updates);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site" });
    }
  });
  app2.delete("/api/sites/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const existingSite = await storage3.getSite(req.params.id);
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      if (sessionUser.id !== existingSite.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to delete this site" });
      }
      const success = await storage3.deleteSite(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete site" });
    }
  });
  app2.get("/api/referrals/:userId/history/:status?/:page?/:limit?", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId) {
        return res.status(403).json({ message: "Unauthorized to access this referral data" });
      }
      const status = req.params.status || "pending";
      const page = parseInt(req.params.page || "1");
      const limit = parseInt(req.params.limit || "5");
      if (!["pending", "paid"].includes(status)) {
        return res.status(400).json({ message: "Invalid status parameter" });
      }
      const result = await storage3.getRefCommissionsByUserId(req.params.userId, status, page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching referral history:", error);
      res.status(500).json({ message: "Failed to fetch referral history" });
    }
  });
  app2.get("/api/referrals/:userId/stats", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId) {
        return res.status(403).json({ message: "Unauthorized to access this referral data" });
      }
      const stats = await storage3.getReferralStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });
  app2.get("/api/referrals/:userId/link", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { userId } = req.params;
      if (sessionUser.id !== userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const commissionAmount = await storage3.getReferralCommissionAmount();
      const commissionInUSDT = commissionAmount.toFixed(2);
      const user = await storage3.getUser(userId);
      const referralCode = user ? user.username : userId;
      res.json({
        referralCode,
        referralLink: `${req.protocol}://${req.get("host")}/register?ref=${referralCode}`,
        commissionAmount: commissionInUSDT,
        message: `Share this link to earn $${commissionInUSDT} USDT for each new user's first order`
      });
    } catch (error) {
      console.error("Error getting referral link:", error);
      res.status(500).json({ message: "Failed to get referral link" });
    }
  });
  app2.post("/api/referrals/commission", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const validatedData = insertRefCommissionSchema.parse(req.body);
      const commission = await storage3.createRefCommission(validatedData);
      res.status(201).json(commission);
    } catch (error) {
      console.error("Error creating referral commission:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create referral commission" });
    }
  });
  app2.put("/api/referrals/commission/:id/status", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { status } = req.body;
      if (!status || !["pending", "paid"].includes(status)) {
        return res.status(400).json({ message: "Valid status required (pending or paid)" });
      }
      const commission = await storage3.updateRefCommissionStatus(req.params.id, status);
      if (!commission) {
        return res.status(404).json({ message: "Referral commission not found" });
      }
      res.json(commission);
    } catch (error) {
      console.error("Error updating referral commission status:", error);
      res.status(500).json({ message: "Failed to update referral commission status" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage3.getAllSiteCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const categoryData = insertSiteCategorySchema.parse(req.body);
      const category = await storage3.createSiteCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });
  app2.put("/api/categories/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const updates = req.body;
      const category = await storage3.updateSiteCategory(req.params.id, updates);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const success = await storage3.deleteSiteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/exchanges/user/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these exchanges" });
      }
      const exchanges2 = await storage3.getExchangesByUserId(req.params.userId);
      const enrichedExchanges = await Promise.all(
        exchanges2.map(async (exchange) => {
          const requesterSite = await storage3.getSite(exchange.requesterSiteId);
          const requestedSite = await storage3.getSite(exchange.requestedSiteId);
          const requester = await storage3.getUser(exchange.requesterId);
          const requestedUser = await storage3.getUser(exchange.requestedUserId);
          return {
            ...exchange,
            requesterSite,
            requestedSite,
            requester: requester ? { id: requester.id, firstName: requester.firstName, lastName: requester.lastName } : null,
            requestedUser: requestedUser ? { id: requestedUser.id, firstName: requestedUser.firstName, lastName: requestedUser.lastName } : null
          };
        })
      );
      res.json(enrichedExchanges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchanges" });
    }
  });
  app2.post("/api/exchanges", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sanitizedBody = {
        ...req.body,
        message: req.body.message ? sanitizeInput(req.body.message) : void 0
      };
      const exchangeData = insertExchangeSchema.parse(sanitizedBody);
      if (sessionUser.id !== exchangeData.requesterId) {
        return res.status(403).json({ message: "Unauthorized to create exchange for another user" });
      }
      const exchange = await storage3.createExchange(exchangeData);
      const requester = await storage3.getUser(exchangeData.requesterId);
      await storage3.createNotification({
        userId: exchangeData.requestedUserId,
        type: "exchange_pending",
        title: "New Exchange Request",
        message: requester ? `You have received a new exchange request from ${requester.firstName} ${requester.lastName}` : "You have received a new exchange request",
        isRead: false,
        relatedEntityId: exchange.id,
        section: "exchange",
        subTab: "ongoing",
        priority: "high"
      });
      res.json(exchange);
    } catch (error) {
      res.status(400).json({ message: "Invalid exchange data" });
    }
  });
  app2.put("/api/exchanges/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const updates = req.body;
      const currentExchange = await storage3.getExchange(req.params.id);
      if (!currentExchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      const isParticipant = sessionUser.id === currentExchange.requesterId || sessionUser.id === currentExchange.requestedUserId;
      if (!isParticipant && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update this exchange" });
      }
      let updateData = { ...updates };
      if (updates.status === "delivered") {
        if (currentExchange.status === "delivered" && currentExchange.deliveredBy === updates.userId) {
          return res.status(400).json({ message: "You have already marked this exchange as delivered" });
        }
        updateData.deliveredBy = updates.userId;
        updateData.deliveredAt = /* @__PURE__ */ new Date();
      }
      if (updates.status === "completed") {
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
        const bothCompleted = (isRequester ? true : currentExchange.requesterCompleted) && (!isRequester ? true : currentExchange.requestedUserCompleted);
        if (bothCompleted) {
          updateData.status = "completed";
        } else {
          updateData.status = "active";
        }
      }
      const exchange = await storage3.updateExchange(req.params.id, updateData);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      if (updates.status === "active") {
        await storage3.createNotification({
          userId: exchange.requesterId,
          type: "exchange_accepted",
          title: "Exchange Accepted",
          message: "Your exchange request has been accepted",
          isRead: false,
          relatedEntityId: exchange.id,
          section: "exchange",
          subTab: "ongoing",
          priority: "high"
        });
      } else if (updates.status === "delivered") {
        const otherUserId = exchange.requesterId === updates.userId ? exchange.requestedUserId : exchange.requesterId;
        await storage3.createNotification({
          userId: otherUserId,
          type: "exchange_delivered",
          title: "Exchange Delivered",
          message: "Content has been delivered for your exchange",
          isRead: false,
          relatedEntityId: exchange.id
        });
      } else if (updates.status === "completed" && exchange.status === "completed") {
        await storage3.createNotification({
          userId: exchange.requesterId,
          type: "exchange_completed",
          title: "Exchange Completed",
          message: "Your exchange has been successfully completed",
          isRead: false,
          relatedEntityId: exchange.id,
          section: "exchange",
          subTab: "completed",
          priority: "normal"
        });
        await storage3.createNotification({
          userId: exchange.requestedUserId,
          type: "exchange_completed",
          title: "Exchange Completed",
          message: "Your exchange has been successfully completed",
          isRead: false,
          relatedEntityId: exchange.id,
          section: "exchange",
          subTab: "completed",
          priority: "normal"
        });
      } else if (updates.status === "cancelled" || updates.status === "declined") {
        const isRequester = updates.userId === currentExchange.requesterId;
        const otherUserId = exchange.requesterId === updates.userId ? exchange.requestedUserId : exchange.requesterId;
        const isRejection = updates.status === "cancelled" && !isRequester;
        await storage3.createNotification({
          userId: otherUserId,
          type: isRejection ? "exchange_rejected" : "exchange_cancelled",
          title: isRejection ? "Exchange Rejected" : "Exchange Cancelled",
          message: isRejection ? "Your exchange request has been rejected" : "An exchange has been cancelled",
          isRead: false,
          relatedEntityId: exchange.id
        });
      }
      res.json(exchange);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exchange" });
    }
  });
  app2.get("/api/messages/exchange/:exchangeId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const exchange = await storage3.getExchange(req.params.exchangeId);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      const isParticipant = sessionUser.id === exchange.requesterId || sessionUser.id === exchange.requestedUserId;
      if (!isParticipant && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these messages" });
      }
      const messages2 = await storage3.getMessagesByExchangeId(req.params.exchangeId);
      const enrichedMessages = await Promise.all(
        messages2.map(async (message) => {
          const sender = await storage3.getUser(message.senderId);
          return {
            ...message,
            sender: sender ? { id: sender.id, firstName: sender.firstName, lastName: sender.lastName } : null
          };
        })
      );
      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/messages/order/:orderId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const order = await storage3.getOrderById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const isParticipant = sessionUser.id === order.buyerId || sessionUser.id === order.sellerId;
      if (!isParticipant && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these messages" });
      }
      const messages2 = await storage3.getMessagesByOrderId(req.params.orderId);
      const enrichedMessages = await Promise.all(
        messages2.map(async (message) => {
          const sender = await storage3.getUser(message.senderId);
          return {
            ...message,
            sender: sender ? { id: sender.id, firstName: sender.firstName, lastName: sender.lastName } : null
          };
        })
      );
      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/messages/unread-count", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const count2 = await storage3.getUnreadMessageCount(sessionUser.id);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });
  app2.post("/api/messages/mark-read", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { exchangeId, orderId } = req.body;
      if (exchangeId) {
        const exchange = await storage3.getExchange(exchangeId);
        if (!exchange) {
          return res.status(404).json({ message: "Exchange not found" });
        }
        const isParticipant = sessionUser.id === exchange.requesterId || sessionUser.id === exchange.requestedUserId;
        if (!isParticipant && sessionUser.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (orderId) {
        const order = await storage3.getOrderById(orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        const isParticipant = sessionUser.id === order.buyerId || sessionUser.id === order.sellerId;
        if (!isParticipant && sessionUser.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }
      await storage3.markMessagesAsRead(sessionUser.id, exchangeId, orderId);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });
  app2.post("/api/orders/mark-section-viewed", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking orders section as viewed:", error);
      res.status(500).json({ message: "Failed to mark section as viewed" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sanitizedBody = {
        ...req.body,
        content: sanitizeInput(req.body.content)
      };
      const messageData = insertMessageSchema.parse(sanitizedBody);
      if (sessionUser.id !== messageData.senderId) {
        return res.status(403).json({ message: "Unauthorized to send message as another user" });
      }
      if (messageData.exchangeId) {
        const exchange = await storage3.getExchange(messageData.exchangeId);
        if (!exchange) {
          return res.status(404).json({ message: "Exchange not found" });
        }
        const isParticipant = sessionUser.id === exchange.requesterId || sessionUser.id === exchange.requestedUserId;
        if (!isParticipant && sessionUser.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized to send message in this exchange" });
        }
      } else if (messageData.orderId) {
        const order = await storage3.getOrderById(messageData.orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        const isParticipant = sessionUser.id === order.buyerId || sessionUser.id === order.sellerId;
        if (!isParticipant && sessionUser.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized to send message in this order" });
        }
      }
      const message = await storage3.createMessage(messageData);
      let otherUserId = null;
      let notificationMessage = "You have a new message";
      if (messageData.exchangeId) {
        const exchange = await storage3.getExchange(messageData.exchangeId);
        if (exchange) {
          otherUserId = exchange.requesterId === messageData.senderId ? exchange.requestedUserId : exchange.requesterId;
          notificationMessage = "You have a new message in your exchange";
        }
      } else if (messageData.orderId) {
        const order = await storage3.getOrderById(messageData.orderId);
        if (order) {
          otherUserId = order.buyerId === messageData.senderId ? order.sellerId : order.buyerId;
          notificationMessage = "You have a new message in your order";
        }
      }
      if (otherUserId) {
        const section = messageData.exchangeId ? "exchange" : "guest_post";
        await storage3.createNotification({
          userId: otherUserId,
          type: "message",
          title: "New Message",
          message: notificationMessage,
          isRead: false,
          relatedEntityId: message.id,
          section,
          subTab: "ongoing",
          // Messages always relate to ongoing conversations
          priority: "normal"
        });
      }
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });
  app2.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these notifications" });
      }
      const notifications2 = await storage3.getNotificationsByUserId(req.params.userId);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.put("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      if (sessionUser.id !== userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to mark these notifications as read" });
      }
      console.log("Marking all notifications as read for user:", userId);
      await storage3.markAllNotificationsAsRead(userId);
      console.log("Successfully marked all notifications as read for user:", userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read", error: error.message });
    }
  });
  app2.put("/api/notifications/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const existingNotification = await storage3.getNotification(req.params.id);
      if (!existingNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      if (sessionUser.id !== existingNotification.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update this notification" });
      }
      const updates = req.body;
      const notification = await storage3.updateNotification(req.params.id, updates);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  app2.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const existingNotification = await storage3.getNotification(req.params.id);
      if (!existingNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      if (sessionUser.id !== existingNotification.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to mark this notification as read" });
      }
      const success = await storage3.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  const requireAdmin = (req, res, next) => {
    console.log("requireAdmin check:", {
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      userRole: req.session?.user?.role,
      userId: req.session?.user?.id
    });
    if (!req.session?.user?.role || req.session.user.role !== "admin") {
      console.log("Admin access denied for session:", req.session?.user);
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };
  const requireAdminOrEmployee = (req, res, next) => {
    console.log("requireAdminOrEmployee check:", {
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      userRole: req.session?.user?.role,
      userId: req.session?.user?.id
    });
    if (!req.session?.user?.role || req.session.user.role !== "admin" && req.session.user.role !== "employee") {
      console.log("Admin or Employee access denied for session:", req.session?.user);
      return res.status(403).json({ error: "Admin or employee access required" });
    }
    next();
  };
  app2.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage3.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });
  app2.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const activities = await storage3.getRecentAdminActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin recent activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { search } = req.query;
      const users3 = await storage3.getAllUsers();
      let filteredUsers = users3;
      if (search && typeof search === "string") {
        const searchTerm = search.toLowerCase();
        filteredUsers = users3.filter(
          (user) => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm) || user.firstName.toLowerCase().includes(searchTerm) || user.lastName.toLowerCase().includes(searchTerm) || user.company && user.company.toLowerCase().includes(searchTerm)
        );
      }
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/users/create-employee", requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const existingUser = await storage3.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      const newEmployee = await storage3.createUser({
        username: email.split("@")[0] + "_employee",
        email,
        password,
        firstName,
        lastName,
        role: "employee",
        status: "active"
      });
      const { password: _, ...employeeWithoutPassword } = newEmployee;
      res.json(employeeWithoutPassword);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee account" });
    }
  });
  app2.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage3.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.post("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, amount } = req.body;
      const success = await storage3.updateUserBalance(id, action, amount);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update balance" });
    }
  });
  app2.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage3.updateUser(id, { status: "banned" });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/sites", requireAdminOrEmployee, async (req, res) => {
    try {
      const sites2 = await storage3.getAllSites();
      res.json(sites2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });
  app2.get("/api/admin/sites/guest-posts", requireAdminOrEmployee, async (req, res) => {
    try {
      const sites2 = await storage3.getAllSites();
      const guestPostSites = sites2.filter((site) => site.purpose === "sales");
      res.json(guestPostSites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guest post sites" });
    }
  });
  app2.patch("/api/admin/sites/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const site = await storage3.updateSite(id, updates);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to update site" });
    }
  });
  app2.post("/api/admin/sites/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const employeeUsername = req.session?.user?.username;
      const site = await storage3.approveSite(id, employeeUsername);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve site" });
    }
  });
  app2.post("/api/admin/sites/:id/reject", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const employeeUsername = req.session?.user?.username;
      const site = await storage3.rejectSite(id, rejectionReason || "Rejected by staff review", employeeUsername);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject site" });
    }
  });
  app2.post("/api/admin/reminders/guest-post/:orderId", requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const adminId = req.session?.user?.id;
      const order = await storage3.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const reminderExists = await storage3.checkEmailReminderExists("guest_post", order.status, orderId);
      if (reminderExists) {
        return res.status(400).json({ error: `Reminder already sent for this order in ${order.status} status` });
      }
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const buyer = await storage3.getUserById(order.buyerId);
      const seller = await storage3.getUserById(order.sellerId);
      const site = await storage3.getSiteById(order.siteId);
      if (!buyer || !seller || !site) {
        return res.status(404).json({ error: "Required data not found" });
      }
      const orderData = {
        orderId: order.displayId || order.id.slice(0, 8),
        buyerName: `${buyer.firstName} ${buyer.lastName}`,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        siteDomain: site.domain,
        createdDate: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        orderLink: `${process.env.BASE_URL || "http://localhost:5000"}/dashboard?tab=orders&orderId=${order.id}`
      };
      const result = await reminderEmailService.sendGuestPostReminder(
        buyer.email,
        seller.email,
        orderData
      );
      await storage3.createEmailReminder({
        type: "guest_post",
        orderId,
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
  app2.post("/api/admin/reminders/exchange/:exchangeId", requireAdmin, async (req, res) => {
    try {
      const { exchangeId } = req.params;
      const adminId = req.session?.user?.id;
      const exchange = await storage3.getExchangeById(exchangeId);
      if (!exchange) {
        return res.status(404).json({ error: "Exchange not found" });
      }
      const reminderExists = await storage3.checkEmailReminderExists("exchange", exchange.status, void 0, exchangeId);
      if (reminderExists) {
        return res.status(400).json({ error: `Reminder already sent for this exchange in ${exchange.status} status` });
      }
      const requester = await storage3.getUserById(exchange.requesterId);
      const requested = await storage3.getUserById(exchange.requestedUserId);
      const requesterSite = await storage3.getSiteById(exchange.requesterSiteId);
      const requestedSite = await storage3.getSiteById(exchange.requestedSiteId);
      if (!requester || !requested || !requesterSite || !requestedSite) {
        return res.status(404).json({ error: "Required data not found" });
      }
      const exchangeData = {
        exchangeId: exchange.displayId || exchange.id.slice(0, 8),
        requesterName: `${requester.firstName} ${requester.lastName}`,
        partnerName: `${requested.firstName} ${requested.lastName}`,
        siteA: requesterSite.domain,
        siteB: requestedSite.domain,
        status: exchange.status,
        createdDate: new Date(exchange.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        exchangeLink: `${process.env.BASE_URL || "http://localhost:5000"}/dashboard?tab=orders&subtab=exchanges&exchangeId=${exchange.id}`
      };
      const result = await reminderEmailService.sendExchangeReminder(
        requester.email,
        requested.email,
        exchangeData
      );
      await storage3.createEmailReminder({
        type: "exchange",
        exchangeId,
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
  app2.get("/api/admin/exchanges", requireAdmin, async (req, res) => {
    try {
      const exchanges2 = await storage3.getAllExchanges();
      res.json(exchanges2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exchanges" });
    }
  });
  app2.get("/api/admin/exchanges/pending", requireAdminOrEmployee, async (req, res) => {
    try {
      const pendingExchanges = await storage3.getPendingExchanges();
      res.json(pendingExchanges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending exchanges" });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage3.getAllOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/orders/pending", requireAdminOrEmployee, async (req, res) => {
    try {
      const pendingOrders = await storage3.getPendingOrders();
      res.json(pendingOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending orders" });
    }
  });
  app2.get("/api/admin/pending-activities", requireAdmin, async (req, res) => {
    try {
      const pendingActivities = await storage3.getAllPendingActivities();
      res.json(pendingActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending activities" });
    }
  });
  app2.get("/api/admin/delivered-activities", requireAdmin, async (req, res) => {
    try {
      const deliveredActivities = await storage3.getDeliveredActivities();
      res.json(deliveredActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivered activities" });
    }
  });
  app2.get("/api/admin/rejected-activities", requireAdmin, async (req, res) => {
    try {
      const rejectedActivities = await storage3.getRejectedActivities();
      res.json(rejectedActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rejected activities" });
    }
  });
  app2.delete("/api/admin/orders/:id/delete", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const result = await storage3.deleteOrderWithRefund(orderId);
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
  app2.delete("/api/admin/exchanges/:id/delete", requireAdmin, async (req, res) => {
    try {
      const exchangeId = req.params.id;
      const result = await storage3.deleteExchange(exchangeId);
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
  app2.delete("/api/admin/pending-activities/orders/:id/delete", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const result = await storage3.adminDeletePendingOrder(orderId);
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
  app2.delete("/api/admin/pending-activities/exchanges/:id/delete", requireAdmin, async (req, res) => {
    try {
      const exchangeId = req.params.id;
      const result = await storage3.adminDeletePendingExchange(exchangeId);
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
  app2.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      const activity = [];
      const registrationLogs = auditLogger.getLogsByAction("REGISTRATION_ATTEMPT", 50).filter((log2) => log2.success).slice(0, 5);
      registrationLogs.forEach((log2) => {
        activity.push({
          id: `registration-${log2.userId}`,
          type: "user_registration",
          description: `New user ${log2.additionalData?.username} (${log2.additionalData?.email}) registered`,
          timestamp: log2.timestamp,
          ipAddress: log2.ipAddress,
          createdAt: log2.timestamp
        });
      });
      const siteSubmissionLogs = auditLogger.getLogsByAction("SITE_SUBMISSION", 50).filter((log2) => log2.success).slice(0, 5);
      siteSubmissionLogs.forEach((log2) => {
        activity.push({
          id: `site-${log2.resourceId}`,
          type: "site_submission",
          description: `Site ${log2.additionalData?.domain} submitted for approval`,
          timestamp: log2.timestamp,
          ipAddress: log2.ipAddress,
          createdAt: log2.timestamp
        });
      });
      const sortedActivity = activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
      res.json(sortedActivity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });
  app2.get("/api/admin/support-chats", requireAdmin, async (req, res) => {
    try {
      const chats = [];
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support chats" });
    }
  });
  app2.get("/api/admin/support-messages/:userId", requireAdmin, async (req, res) => {
    try {
      const messages2 = [];
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support messages" });
    }
  });
  app2.post("/api/admin/support-messages", requireAdmin, async (req, res) => {
    try {
      const { userId, message } = req.body;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these stats" });
      }
      const userId = req.params.userId;
      const userSites = await storage3.getSitesByUserId(userId);
      const approvedSites = userSites.filter((site) => site.status === "approved");
      const totalSites = approvedSites.length;
      const pendingSites = userSites.filter((site) => site.status === "pending").length;
      const userExchanges = await storage3.getExchangesByUserId(userId);
      const completedExchanges = userExchanges.filter(
        (exchange) => exchange.status === "completed" && exchange.requesterCompleted === true && exchange.requestedUserCompleted === true
      ).length;
      const userOrders = await storage3.getOrdersByUserId(userId);
      const completedSales = userOrders.filter(
        (order) => order.sellerId === userId && order.status === "completed"
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
  app2.get("/api/payment-gateways", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const gateways = await storage3.getActivePaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ message: "Failed to fetch payment gateways" });
    }
  });
  app2.get("/api/payment-gateways/:id", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const gateway = await storage3.getPaymentGateway(req.params.id);
      if (!gateway) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ message: "Failed to fetch payment gateway" });
    }
  });
  app2.get("/api/wallet", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const wallet = await storage3.getWallet(user.id);
      if (!wallet) {
        const newWallet = await storage3.createWallet(user.id);
        return res.json({
          ...newWallet,
          usdtBalance: newWallet.balance,
          // Already in dollars
          balance: newWallet.balance
        });
      }
      res.json({
        ...wallet,
        usdtBalance: wallet.balance,
        // Already in dollars
        balance: wallet.balance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });
  app2.get("/api/wallets/user/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access this wallet" });
      }
      const wallet = await storage3.getWallet(req.params.userId);
      if (!wallet) {
        const newWallet = await storage3.createWallet(req.params.userId);
        return res.json(newWallet);
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });
  app2.post("/api/wallet/:userId/add-funds", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const sanitizedBody = {
        ...req.body,
        description: req.body.description ? sanitizeInput(req.body.description) : void 0
      };
      const { amount, description } = sanitizedBody;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const success = await storage3.addFunds(req.params.userId, amount, description || "Funds added");
      if (!success) {
        return res.status(400).json({ message: "Failed to add funds" });
      }
      const wallet = await storage3.getWallet(req.params.userId);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to add funds" });
    }
  });
  app2.post("/api/wallet/topup", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { amount, currency, method, fee, txId } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      if (method === "crypto") {
        if (!txId || !txId.trim()) {
          return res.status(400).json({ message: "Transaction ID (TxID) is required for crypto deposits" });
        }
        const sanitizedTxId = txId.trim().replace(/[^A-Za-z0-9]/g, "");
        if (sanitizedTxId.length < 10 || sanitizedTxId.length > 128) {
          return res.status(400).json({ message: "Invalid Transaction ID format. Must be 10-128 alphanumeric characters." });
        }
        req.body.txId = sanitizedTxId;
      }
      const gateways = await storage3.getActivePaymentGateways();
      const gateway = gateways.find((g) => g.name === "crypto" || g.name === method);
      if (!gateway) {
        console.log("Available gateways:", gateways.map((g) => g.name));
        console.log("Requested method:", method);
        return res.status(400).json({ message: "Invalid payment method" });
      }
      const minAmount = gateway.minDepositAmount;
      const maxAmount = gateway.maxDepositAmount;
      if (amount < minAmount) {
        return res.status(400).json({ message: `Minimum deposit amount is $${minAmount.toFixed(2)}` });
      }
      if (amount > maxAmount) {
        return res.status(400).json({ message: `Maximum deposit amount is $${maxAmount.toFixed(2)}` });
      }
      const wallet = await storage3.getWallet(user.id);
      if (!wallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }
      const walletTransaction = await storage3.createWalletTransaction({
        userId: user.id,
        type: "top_up",
        amount,
        // Store dollars directly
        fee: fee || 0,
        // Store fee in dollars directly
        gatewayId: gateway.id,
        paymentMethod: `${formatCurrency(amount)} via ${gateway.displayName}`,
        txId: txId ? txId.trim() : null,
        // Store user's transaction ID
        status: "processing"
      });
      if (txId) {
        await storage3.createCryptoTxId({
          txId: txId.trim(),
          username: user.username,
          userId: user.id,
          walletTransactionId: walletTransaction.id
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
  app2.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sanitizedBody = {
        ...req.body,
        walletAddress: req.body.walletAddress ? req.body.walletAddress.replace(/[^A-Za-z0-9]/g, "").slice(0, 45) : void 0,
        network: req.body.network ? req.body.network.replace(/[^A-Za-z0-9]/g, "").slice(0, 20) : void 0
      };
      const { amount, currency, method, walletAddress, network, fee } = sanitizedBody;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      if (!walletAddress || walletAddress.length < 10 || walletAddress.length > 45) {
        return res.status(400).json({ message: "Invalid wallet address. Must be 10-45 alphanumeric characters." });
      }
      if (!network || !["TRC20"].includes(network)) {
        return res.status(400).json({ message: "Invalid network. Only TRC20 is supported." });
      }
      const gateways = await storage3.getActivePaymentGateways();
      const gateway = gateways.find((g) => g.name === "crypto" || g.name === method);
      if (!gateway) {
        console.log("Available gateways:", gateways.map((g) => g.name));
        console.log("Requested method:", method);
        return res.status(400).json({ message: "Invalid payment method" });
      }
      const minAmount = gateway.minWithdrawalAmount;
      const maxAmount = gateway.maxWithdrawalAmount;
      if (amount < minAmount) {
        return res.status(400).json({ message: `Minimum withdrawal amount is $${minAmount.toFixed(2)}` });
      }
      if (amount > maxAmount) {
        return res.status(400).json({ message: `Maximum withdrawal amount is $${maxAmount.toFixed(2)}` });
      }
      const wallet = await storage3.getWallet(user.id);
      const totalAmount = amount + (fee || 0);
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      const deductionSuccess = await storage3.deductFunds(
        user.id,
        totalAmount,
        `Withdrawal submitted for processing: $${formatCurrency(amount)} (Fee: $${formatCurrency(fee || 0)})`
      );
      if (!deductionSuccess) {
        return res.status(500).json({ message: "Failed to process withdrawal - unable to deduct funds" });
      }
      const walletTransaction = await storage3.createWalletTransaction({
        userId: user.id,
        type: "withdrawal",
        amount,
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
  app2.get("/api/listings", async (req, res) => {
    try {
      const listings2 = await storage3.getAllListings();
      const enrichedListings = await Promise.all(
        listings2.map(async (listing) => {
          const site = await storage3.getSite(listing.siteId);
          return { ...listing, site };
        })
      );
      res.json(enrichedListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });
  app2.get("/api/listings/marketplace", async (req, res) => {
    try {
      const user = req.session?.user;
      const currentUserId = user?.id;
      const platformFeeSetting = await storage3.getSetting("platformFee");
      const platformFeeTypeSetting = await storage3.getSetting("platformFeeType");
      const platformFeeAmount = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 5;
      const platformFeeType = platformFeeTypeSetting?.value || "percentage";
      const [listings2, salesSites, allOrders] = await Promise.all([
        storage3.getAllListings(),
        storage3.getAllApprovedSites(),
        storage3.getAllOrders()
      ]);
      const enrichedListings = await Promise.all(
        listings2.filter((listing) => listing.userId !== currentUserId).map(async (listing) => {
          const site = await storage3.getSite(listing.siteId);
          return {
            ...listing,
            site,
            type: listing.type || "link_placement"
            // Default to link_placement for sales sites
          };
        })
      );
      const sitesWithRegularListings = new Set(listings2.map((listing) => listing.siteId));
      const salesListings = salesSites.filter(
        (site) => site.purpose === "sales" && site.price && site.deliveryTime && site.userId !== currentUserId && !sitesWithRegularListings.has(site.id)
        // Prevent duplication - don't create site-listing if regular listing exists
      ).map((site) => ({
        id: `site-listing-${site.id}`,
        userId: site.userId,
        siteId: site.id,
        type: "link_placement",
        price: site.price,
        serviceFee: platformFeeType === "percentage" ? (site.price || 0) * (platformFeeAmount / 100) : platformFeeAmount,
        // Fixed amount in dollars
        isActive: true,
        requirements: site.description || "Contact seller for requirements",
        turnaround_time: site.deliveryTime,
        createdAt: site.createdAt,
        updatedAt: site.updatedAt,
        site
      }));
      const allMarketplaceListings = [...enrichedListings, ...salesListings];
      res.json(allMarketplaceListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketplace listings" });
    }
  });
  app2.get("/api/listings/user/:userId", async (req, res) => {
    try {
      const listings2 = await storage3.getListingsByUserId(req.params.userId);
      const enrichedListings = await Promise.all(
        listings2.map(async (listing) => {
          const site = await storage3.getSite(listing.siteId);
          return { ...listing, site };
        })
      );
      res.json(enrichedListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });
  app2.post("/api/listings", async (req, res) => {
    try {
      const sanitizedBody = {
        ...req.body,
        requirements: req.body.requirements ? sanitizeInput(req.body.requirements) : void 0
      };
      const listingData = insertListingSchema.parse(sanitizedBody);
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const platformFeeSetting = await storage3.getSetting("platformFee");
      const platformFeeTypeSetting = await storage3.getSetting("platformFeeType");
      const platformFeeAmount = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 5;
      const platformFeeType = platformFeeTypeSetting?.value || "percentage";
      const serviceFee = platformFeeType === "percentage" ? listingData.price * (platformFeeAmount / (100 - platformFeeAmount)) : platformFeeAmount;
      const listing = await storage3.createListing({ ...listingData, userId, serviceFee });
      res.json(listing);
    } catch (error) {
      res.status(400).json({ message: "Invalid listing data" });
    }
  });
  app2.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these orders" });
      }
      const { type } = req.query;
      const orders2 = await storage3.getOrdersByUserId(req.params.userId, type);
      const enrichedOrders = await Promise.all(
        orders2.map(async (order) => {
          const listing = await storage3.getListingById(order.listingId);
          const buyer = await storage3.getUser(order.buyerId);
          const seller = await storage3.getUser(order.sellerId);
          let site = null;
          if (listing && listing.siteId) {
            site = await storage3.getSite(listing.siteId);
          }
          return {
            ...order,
            listing: listing ? { ...listing, site } : null,
            buyer: buyer ? { id: buyer.id, firstName: buyer.firstName, lastName: buyer.lastName } : null,
            seller: seller ? { id: seller.id, firstName: seller.firstName, lastName: seller.lastName } : null
          };
        })
      );
      res.json(enrichedOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sanitizedData = {
        listingId: sanitizeInput(req.body.listingId),
        googleDocLink: req.body.googleDocLink ? sanitizeInput(req.body.googleDocLink) : void 0,
        targetLink: req.body.targetLink ? sanitizeInput(req.body.targetLink) : void 0,
        requirements: req.body.requirements ? sanitizeInput(req.body.requirements) : void 0
      };
      const { listingId, googleDocLink, targetLink, requirements } = sanitizedData;
      let listing;
      let listingSite;
      if (listingId.startsWith("site-listing-")) {
        const siteId = listingId.replace("site-listing-", "");
        listingSite = await storage3.getSite(siteId);
        if (!listingSite || listingSite.purpose !== "sales") {
          return res.status(400).json({ message: "Site listing not found" });
        }
        listing = {
          id: listingId,
          userId: listingSite.userId,
          siteId: listingSite.id,
          type: "link_placement",
          price: listingSite.price || 0,
          site: listingSite
        };
      } else {
        listing = await storage3.getListingById(listingId);
        if (!listing) {
          return res.status(400).json({ message: "Listing not found" });
        }
        listingSite = await storage3.getSite(listing.siteId);
      }
      const seller = await storage3.getUser(listing.userId);
      if (!seller) {
        return res.status(400).json({ message: "Seller not found" });
      }
      const buyerWallet = await storage3.getWallet(user.id);
      if (!buyerWallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }
      const platformFeeSetting = await storage3.getSetting("platformFee");
      const platformFeeTypeSetting = await storage3.getSetting("platformFeeType");
      const platformFeeAmount = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 5;
      const platformFeeType = platformFeeTypeSetting?.value || "percentage";
      const listingPrice = listing.price || 0;
      const serviceFee = platformFeeType === "percentage" ? listingPrice * (platformFeeAmount / 100) : platformFeeAmount;
      const totalAmount = listingPrice;
      if (buyerWallet.balance < totalAmount) {
        console.log("Balance check failed:", {
          buyerBalance: buyerWallet.balance,
          listingPrice,
          totalAmount,
          serviceFee
        });
        return res.status(400).json({ message: "Insufficient funds" });
      }
      const sellerAmount = listingPrice - serviceFee;
      const deductSuccess = await storage3.deductFunds(
        user.id,
        totalAmount,
        `Order payment for listing ${listing.id}`
      );
      if (!deductSuccess) {
        return res.status(400).json({ message: "Failed to process payment" });
      }
      let finalListingId = listing.id;
      if (listingId.startsWith("site-listing-") && listingSite) {
        const newListing = await storage3.createListing({
          userId: listingSite.userId,
          siteId: listingSite.id,
          type: "link_placement",
          price: listingSite.price || 0,
          serviceFee,
          requirements: requirements || `Link placement order for ${listingSite.domain}`,
          turnaroundTime: listingSite.deliveryTime || 7
        });
        finalListingId = newListing.id;
      }
      const orderCount = await storage3.getAllOrders();
      const orderId = `#ORDER-${String(orderCount.length + 1).padStart(3, "0")}`;
      const order = await storage3.createOrder({
        buyerId: user.id,
        sellerId: listing.userId,
        listingId: finalListingId,
        orderId,
        amount: totalAmount,
        serviceFee,
        sellerAmount,
        status: "on_going",
        // Orders go straight to on_going status
        requirements: requirements || `Order for ${listing.type === "guest_post" ? "guest post" : "link placement"} on ${listingSite?.domain || "site"}`,
        googleDocLink,
        targetLink
      });
      await storage3.createNotification({
        userId: user.id,
        type: "order_created",
        title: "Order Created",
        message: `Your order ${orderId} has been created and is now in progress`,
        isRead: false,
        relatedEntityId: order.id,
        section: "guest_post",
        subTab: "ongoing",
        priority: "normal"
      });
      await storage3.createNotification({
        userId: listing.userId,
        type: "order_received",
        title: "New Order Received",
        message: `You have received a new order ${orderId} from ${user.firstName} ${user.lastName} - now in progress`,
        isRead: false,
        relatedEntityId: order.id,
        section: "guest_post",
        subTab: "ongoing",
        priority: "high"
      });
      auditOrderAction(req, user.id, order.id, "CREATE", true);
      auditFinancialAction(req, user.id, "ORDER_PAYMENT", totalAmount, true);
      res.json(order);
    } catch (error) {
      const sessionUser = req.session.user;
      auditOrderAction(req, sessionUser?.id || "unknown", "unknown", "CREATE", false, error.message);
      res.status(400).json({ message: "Invalid order data" });
    }
  });
  app2.put("/api/orders/:id/accept", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const existingOrder = await storage3.getOrderById(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (sessionUser.id !== existingOrder.sellerId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to accept this order" });
      }
      const order = await storage3.updateOrder(req.params.id, { status: "accepted" });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      await storage3.createNotification({
        userId: order.buyerId,
        type: "order_accepted",
        title: "Order Accepted",
        message: `Your order ${order.orderId || order.id} has been accepted and work will begin soon`,
        isRead: false,
        relatedEntityId: order.id
      });
      auditOrderAction(req, sessionUser.id, order.id, "ACCEPT", true);
      res.json(order);
    } catch (error) {
      const sessionUser = req.session.user;
      auditOrderAction(req, sessionUser?.id || "unknown", req.params.id, "ACCEPT", false, error.message);
      res.status(500).json({ message: "Failed to accept order" });
    }
  });
  app2.put("/api/orders/:id/decline", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const order = await storage3.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (sessionUser.id !== order.sellerId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to decline this order" });
      }
      const refundSuccess = await storage3.addFunds(
        order.buyerId,
        order.amount,
        `Refund for cancelled order ${order.orderId || order.id}`
      );
      if (!refundSuccess) {
        return res.status(500).json({ message: "Failed to process refund" });
      }
      const updatedOrder = await storage3.updateOrder(req.params.id, { status: "cancelled" });
      await storage3.createNotification({
        userId: order.buyerId,
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Your order ${order.orderId || order.id} has been cancelled and you have been fully refunded`,
        isRead: false,
        relatedEntityId: order.id
      });
      auditOrderAction(req, sessionUser.id, order.id, "DECLINE", true);
      auditFinancialAction(req, sessionUser.id, "REFUND", order.amount, true);
      res.json(updatedOrder);
    } catch (error) {
      const sessionUser = req.session.user;
      auditOrderAction(req, sessionUser?.id || "unknown", req.params.id, "DECLINE", false, error.message);
      res.status(500).json({ message: "Failed to decline order" });
    }
  });
  app2.patch("/api/orders/:id", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const sanitizedBody = {
        ...req.body,
        deliveryUrl: req.body.deliveryUrl ? sanitizeInput(req.body.deliveryUrl) : void 0
      };
      const { status, deliveryUrl, userId, action } = sanitizedBody;
      const currentUserId = sessionUser.id;
      const order = await storage3.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const isParticipant = sessionUser.id === order.buyerId || sessionUser.id === order.sellerId;
      if (!isParticipant && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update this order" });
      }
      let updateData = {};
      if (action === "delivered" && userId === order.sellerId) {
        updateData = {
          status: "delivered",
          deliveryUrl,
          sellerDelivered: true
        };
        await storage3.createNotification({
          userId: order.buyerId,
          type: "order_delivered",
          title: "Order Delivered",
          message: `Your order ${order.orderId || order.id} has been delivered. Please review and confirm completion.`,
          isRead: false,
          relatedEntityId: order.id
        });
      } else if (action === "confirm_completed" && userId === order.buyerId) {
        updateData = {
          status: "completed",
          buyerCompleted: true
        };
        await storage3.addFunds(
          order.sellerId,
          order.sellerAmount,
          // This already has platform fees deducted
          `Payment for completed order ${order.orderId || order.id} (after platform fee)`
        );
        try {
          const commissionProcessed = await storage3.processReferralCommission(order.id, order.buyerId);
          if (commissionProcessed) {
            console.log(`Referral commission processed for order ${order.id}`);
          }
        } catch (error) {
          console.error("Error processing referral commission:", error);
        }
        const listing = await storage3.getListingById(order.listingId);
        console.log(`[ORDER COMPLETION] Order ${order.id} completed, listing:`, listing?.id, "site:", listing?.siteId);
        if (listing?.siteId) {
          const incrementResult = await storage3.incrementSitePurchaseCount(listing.siteId);
          console.log(`[ORDER COMPLETION] Purchase count increment result:`, incrementResult);
        } else {
          console.error(`[ORDER COMPLETION] No listing or siteId found for order ${order.id}`);
        }
        await storage3.createNotification({
          userId: order.sellerId,
          type: "order_completed",
          title: "Order Completed",
          message: `Order ${order.orderId || order.id} has been marked as completed and you have received payment.`,
          isRead: false,
          relatedEntityId: order.id,
          section: "guest_post",
          subTab: "completed",
          priority: "normal"
        });
      } else if (action === "cancel" && userId === order.sellerId) {
        const refundSuccess = await storage3.addFunds(
          order.buyerId,
          order.amount,
          `Refund for cancelled order ${order.orderId || order.id}`
        );
        if (!refundSuccess) {
          return res.status(500).json({ message: "Failed to process refund" });
        }
        updateData = { status: "cancelled" };
        await storage3.createNotification({
          userId: order.buyerId,
          type: "order_cancelled",
          title: "Order Cancelled",
          message: `Order ${order.orderId || order.id} has been cancelled by the seller and you have been fully refunded`,
          isRead: false,
          relatedEntityId: order.id
        });
      }
      if (status && !action) {
        if (status === "completed" && (order.buyerId === currentUserId || order.buyerId === userId)) {
          if (order.status === "completed") {
            return res.status(400).json({ message: "Order already completed" });
          }
          await storage3.addFunds(
            order.sellerId,
            order.sellerAmount || order.amount,
            `Payment for completed order ${order.orderId || order.id}`
          );
          const listing = await storage3.getListingById(order.listingId);
          console.log(`[ORDER COMPLETION] Order ${order.id} completed via direct status, listing:`, listing?.id, "site:", listing?.siteId);
          if (listing?.siteId) {
            const incrementResult = await storage3.incrementSitePurchaseCount(listing.siteId);
            console.log(`[ORDER COMPLETION] Purchase count increment result:`, incrementResult);
          } else {
            console.error(`[ORDER COMPLETION] No listing or siteId found for order ${order.id}`);
          }
          updateData = { status: "completed" };
          await storage3.createNotification({
            userId: order.sellerId,
            type: "order_completed",
            title: "Order Completed",
            message: `Order ${order.orderId || order.id} has been marked as completed and you have received payment.`,
            isRead: false,
            relatedEntityId: order.id
          });
        } else if (status === "refunded" && (order.sellerId === currentUserId || order.sellerId === userId)) {
          if (order.status === "refunded" || order.status === "cancelled") {
            return res.status(400).json({ message: "Order already refunded or cancelled" });
          }
          const refundSuccess = await storage3.addFunds(
            order.buyerId,
            order.amount,
            `Refund for order ${order.orderId || order.id}`
          );
          if (!refundSuccess) {
            return res.status(500).json({ message: "Failed to process refund" });
          }
          updateData = { status: "refunded" };
          await storage3.createNotification({
            userId: order.buyerId,
            type: "order_refunded",
            title: "Order Refunded",
            message: `Order ${order.orderId || order.id} has been refunded by the seller`,
            isRead: false,
            relatedEntityId: order.id
          });
        } else {
          updateData = { status };
        }
      }
      const updatedOrder = await storage3.updateOrder(req.params.id, updateData);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  app2.get("/api/transactions/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these transactions" });
      }
      const transactions2 = await storage3.getTransactionsByUserId(req.params.userId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/wallet-transactions", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const page = parseInt(req.query.page) || 1;
      const requestedLimit = parseInt(req.query.limit);
      const limit = requestedLimit || 5;
      const offset = (page - 1) * limit;
      console.log(`Wallet transactions API: user=${user.id}, page=${page}, limit=${limit}, offset=${offset}`);
      const { transactions: transactions2, total } = await storage3.getWalletTransactionsByUserIdPaginated(user.id, limit, offset);
      console.log(`Wallet transactions result: total=${total}, transactions=${transactions2.length}`);
      res.json({
        transactions: transactions2,
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
  app2.get("/api/admin/wallet-transactions", requireAdminOrEmployee, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const { transactions: transactions2, total } = await storage3.getAllWalletTransactionsPaginated(limit, offset, status);
      res.json({
        transactions: transactions2,
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
  app2.patch("/api/admin/wallet-transactions/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { status, adminNote } = req.body;
      const admin = req.session?.user;
      if (!["approved", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const result = await storage3.processWalletTransaction(
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
  app2.get("/api/settings/public", async (req, res) => {
    try {
      const settingsArray = await storage3.getPlatformSettings();
      const settingsObj = {};
      settingsArray.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });
      const publicSettings = {
        maintenanceMode: settingsObj.maintenanceMode || "false",
        maintenanceMessage: settingsObj.maintenanceMessage || "We are currently performing maintenance. Please check back soon.",
        platformFee: settingsObj.platformFee || "5",
        platformFeeType: settingsObj.platformFeeType || "percentage",
        topUpFee: settingsObj.topUpFee || "200",
        withdrawalFee: settingsObj.withdrawalFee || "200",
        minimumSalesPrice: settingsObj.minimumSalesPrice || "10",
        // Platform branding
        platformName: settingsObj.platform_name || "CollabPro",
        // Include timezone settings for app-wide timezone management
        appTimezone: settingsObj.appTimezone || "UTC",
        adminTimezone: settingsObj.adminTimezone || "UTC",
        // Referral system settings
        referralCommission: settingsObj.Referral_Commission || "3"
      };
      res.json(publicSettings);
    } catch (error) {
      console.error("Error fetching public settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.post("/api/admin/reset-password", requireAdmin, async (req, res) => {
    try {
      const { userIdentifier, newPassword } = req.body;
      const admin = req.session?.user;
      if (!userIdentifier || !newPassword) {
        return res.status(400).json({ message: "User identifier and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      let user = await storage3.getUserByUsername(userIdentifier);
      if (!user) {
        user = await storage3.getUserByEmail(userIdentifier);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage3.updateUser(user.id, { password: hashedPassword });
      console.log(`[ADMIN ACTION] Password reset for user ${user.username} (${user.email}) by admin ${admin.username} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
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
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/admin/search-users", requireAdmin, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const searchTerm = q.trim().toLowerCase();
      if (searchTerm.length < 2) {
        return res.status(400).json({ message: "Search term must be at least 2 characters" });
      }
      const allUsers = await storage3.getAllUsers();
      const matchingUsers = allUsers.filter(
        (user) => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)
      ).slice(0, 10);
      const safeUsers = matchingUsers.map((user) => ({
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
      console.error("User search error:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });
  app2.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage3.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users3 = await storage3.getAllUsers();
      const usersWithWallets = await Promise.all(
        users3.map(async (user) => {
          const wallet = await storage3.getWallet(user.id);
          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, balance: wallet?.balance || 0 };
        })
      );
      res.json(usersWithWallets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });
  app2.get("/api/admin/sites", requireAdminOrEmployee, async (req, res) => {
    try {
      const sites2 = await storage3.getAllSites();
      const enrichedSites = await Promise.all(
        sites2.map(async (site) => {
          const user = await storage3.getUser(site.userId);
          return {
            ...site,
            user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null
          };
        })
      );
      res.json(enrichedSites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin sites" });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage3.getAllOrders();
      const enrichedOrders = await Promise.all(
        orders2.map(async (order) => {
          const buyer = await storage3.getUser(order.buyerId);
          const seller = await storage3.getUser(order.sellerId);
          return {
            ...order,
            buyer: buyer ? { id: buyer.id, firstName: buyer.firstName, lastName: buyer.lastName, email: buyer.email } : null,
            seller: seller ? { id: seller.id, firstName: seller.firstName, lastName: seller.lastName, email: buyer.email } : null
          };
        })
      );
      res.json(enrichedOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin orders" });
    }
  });
  app2.put("/api/admin/orders/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const order = await storage3.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  app2.put("/api/admin/users/:id/balance", async (req, res) => {
    try {
      const { action, amount } = req.body;
      if (!["add", "deduct"].includes(action) || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid balance update data" });
      }
      const success = await storage3.updateUserBalance(req.params.id, action, amount);
      if (!success) {
        return res.status(400).json({ message: "Failed to update balance" });
      }
      await storage3.createTransaction({
        userId: req.params.id,
        type: action === "add" ? "deposit" : "withdrawal",
        amount: action === "add" ? amount : -amount,
        description: `Admin ${action === "add" ? "added" : "deducted"} funds`,
        orderId: null
      });
      const wallet = await storage3.getWallet(req.params.id);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user balance" });
    }
  });
  app2.put("/api/admin/sites/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const site = await storage3.updateSite(req.params.id, req.body);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site" });
    }
  });
  app2.put("/api/admin/sites/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const site = await storage3.approveSite(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve site" });
    }
  });
  app2.put("/api/admin/sites/:id/reject", requireAdminOrEmployee, async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      const site = await storage3.rejectSite(req.params.id, reason);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject site" });
    }
  });
  app2.post("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    try {
      const { action, amount } = req.body;
      const userId = req.params.id;
      if (!action || !amount || action !== "add" && action !== "deduct") {
        return res.status(400).json({ message: "Invalid action or amount" });
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      const amountInDollars = numAmount;
      let wallet = await storage3.getWallet(userId);
      if (!wallet) {
        wallet = await storage3.createWallet(userId);
      }
      let newBalance;
      if (action === "add") {
        newBalance = wallet.balance + amountInDollars;
      } else {
        newBalance = wallet.balance - amountInDollars;
        if (newBalance < 0) {
          return res.status(400).json({ message: "Insufficient balance for deduction" });
        }
      }
      const updatedWallet = await storage3.updateWalletBalance(userId, newBalance);
      if (!updatedWallet) {
        return res.status(404).json({ message: "Failed to update wallet" });
      }
      await storage3.createTransaction({
        userId,
        type: action === "add" ? "admin_credit" : "admin_debit",
        amount,
        description: `Admin ${action === "add" ? "added" : "deducted"} $${numAmount.toFixed(2)}`,
        orderId: null
      });
      res.json({
        message: `Successfully ${action === "add" ? "added" : "deducted"} $${numAmount.toFixed(2)}`,
        newBalance: updatedWallet.balance
      });
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });
  app2.post("/api/admin/user-balance-by-email", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage3.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const wallet = await storage3.getWallet(user.id) || { balance: 0 };
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
  app2.post("/api/admin/user-balance", requireAdmin, async (req, res) => {
    try {
      const { userId, amount, operation } = req.body;
      if (!userId || !amount || !operation) {
        return res.status(400).json({ message: "UserId, amount, and operation are required" });
      }
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }
      if (!["add", "subtract"].includes(operation)) {
        return res.status(400).json({ message: "Operation must be 'add' or 'subtract'" });
      }
      let wallet = await storage3.getWallet(userId);
      if (!wallet) {
        wallet = await storage3.createWallet(userId);
      }
      let newBalance;
      if (operation === "add") {
        newBalance = wallet.balance + amount;
      } else {
        newBalance = Math.max(0, wallet.balance - amount);
      }
      await storage3.updateWalletBalance(userId, newBalance);
      await storage3.createTransaction({
        userId,
        type: operation === "add" ? "admin_credit" : "admin_debit",
        amount,
        description: `Admin ${operation === "add" ? "added" : "deducted"} $${amount.toFixed(2)} ${operation === "add" ? "to" : "from"} user balance`,
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
  app2.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage3.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.put("/api/admin/payment-gateways/:id/limits", requireAdmin, async (req, res) => {
    try {
      const { minDepositAmount, maxDepositAmount, minWithdrawalAmount, maxWithdrawalAmount } = req.body;
      if (minDepositAmount < 0 || maxDepositAmount < 0 || minWithdrawalAmount < 0 || maxWithdrawalAmount < 0) {
        return res.status(400).json({ message: "Amounts must be non-negative" });
      }
      if (minDepositAmount > maxDepositAmount || minWithdrawalAmount > maxWithdrawalAmount) {
        return res.status(400).json({ message: "Minimum amounts cannot exceed maximum amounts" });
      }
      const gateway = await storage3.updatePaymentGatewayLimits(req.params.id, {
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
  app2.get("/api/admin/transactions", requireAdminOrEmployee, async (req, res) => {
    try {
      const transactions2 = await storage3.getAllTransactionsWithUsers();
      const walletTransactions2 = await storage3.getAllWalletTransactionsWithUsers();
      const allTransactions = [
        ...transactions2.map((t) => ({
          ...t,
          fee: 0,
          // Regular transactions don't have fees
          transactionType: "regular"
        })),
        ...walletTransactions2.map((wt) => ({
          ...wt,
          transactionType: "wallet",
          type: wt.type === "top_up" ? "wallet_deposit" : "wallet_withdrawal",
          description: `${wt.type === "top_up" ? "Wallet deposit" : "Wallet withdrawal"} - ${wt.status}`
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(allTransactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/admin/wallet-transactions/:type/:status", requireAdminOrEmployee, async (req, res) => {
    try {
      const { type, status } = req.params;
      const transactions2 = await storage3.getWalletTransactionsByStatus(status, type);
      res.json(transactions2);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });
  app2.get("/api/admin/wallet-transactions/:status", requireAdminOrEmployee, async (req, res) => {
    try {
      const { status } = req.params;
      const transactions2 = await storage3.getWalletTransactionsByStatus(status);
      res.json(transactions2);
    } catch (error) {
      console.error("Error fetching wallet transactions by status:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });
  app2.get("/api/admin/fee-records", requireAdminOrEmployee, async (req, res) => {
    try {
      const feeRecords2 = await storage3.getAllFeeRecords();
      res.json(feeRecords2);
    } catch (error) {
      console.error("Error fetching fee records:", error);
      res.status(500).json({ message: "Failed to fetch fee records" });
    }
  });
  app2.get("/api/admin/crypto-txids", requireAdmin, async (req, res) => {
    try {
      const cryptoTxIds2 = await storage3.getAllCryptoTxIds();
      res.json(cryptoTxIds2);
    } catch (error) {
      console.error("Error fetching crypto TxIDs:", error);
      res.status(500).json({ message: "Failed to fetch crypto TxIDs" });
    }
  });
  app2.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage3.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/admin/recent-activity", async (req, res) => {
    try {
      const activity = await storage3.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    try {
      const users3 = await storage3.getAllUsers();
      res.json(users3);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = await storage3.updateUser(id, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.post("/api/admin/users/:id/adjust-balance", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;
      const result = await storage3.adjustUserBalance(id, amount, reason);
      res.json(result);
    } catch (error) {
      console.error("Error adjusting balance:", error);
      res.status(500).json({ message: "Failed to adjust balance" });
    }
  });
  app2.get("/api/admin/orders", async (req, res) => {
    try {
      const orders2 = await storage3.getAllOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage3.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  app2.get("/api/admin/domains", requireAdminOrEmployee, async (req, res) => {
    try {
      const domains = await storage3.getAllSites();
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });
  app2.patch("/api/admin/domains/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const site = await storage3.updateSiteApproval(id, approved);
      res.json(site);
    } catch (error) {
      console.error("Error updating site approval:", error);
      res.status(500).json({ message: "Failed to update site" });
    }
  });
  app2.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings2 = await storage3.getPlatformSettings();
      const smtpConfig = await storage3.getSmtpConfig();
      const emailVerificationSetting = {
        id: "smtp-email-verification",
        key: "emailVerificationEnabled",
        value: smtpConfig?.requireEmailVerification ? "true" : "false",
        description: "Whether email verification is required for new user registrations"
      };
      res.json([...settings2, emailVerificationSetting]);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settingsData = req.body;
      const settings2 = await storage3.updatePlatformSettings(settingsData);
      res.json(settings2);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      if (key && value !== void 0) {
        if (key === "emailVerificationEnabled") {
          const requireVerification = value === "true";
          await storage3.updateSmtpEmailVerificationSetting(requireVerification);
          res.json({
            success: true,
            setting: {
              key: "emailVerificationEnabled",
              value,
              description: "Email verification requirement updated in SMTP system"
            }
          });
        } else {
          const setting = await storage3.setSetting({ key, value, description });
          if (key === "antiDdosEnabled") {
            const securitySystem2 = getSecuritySystem();
            await securitySystem2.refreshAntiDdosCache();
          }
          res.json({ success: true, setting });
        }
      } else {
        const settingsData = req.body;
        const settings2 = await storage3.updatePlatformSettings(settingsData);
        res.json(settings2);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.get("/api/admin/support-messages", requireAdminOrEmployee, async (req, res) => {
    try {
      const messages2 = await storage3.getAllSupportMessages();
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching support messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/admin/support-messages", requireAdmin, async (req, res) => {
    try {
      const messageData = insertSupportMessageSchema.parse({
        ...req.body,
        isFromAdmin: true
      });
      const message = await storage3.createSupportMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating support message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const action = req.query.action;
      const userId = req.query.userId;
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
  app2.post("/api/support/tickets", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: sessionUser.id
      });
      const ticket = await storage3.createSupportTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({ message: "Failed to create support ticket" });
    }
  });
  app2.get("/api/support/tickets/user/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access these tickets" });
      }
      const tickets = await storage3.getSupportTicketsByUserId(req.params.userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  app2.get("/api/support/tickets/:ticketId/messages", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const messages2 = await storage3.getSupportMessagesByTicketId(req.params.ticketId);
      const filteredMessages = messages2.map((msg) => ({
        ...msg,
        senderName: msg.sender === "admin" && sessionUser.role !== "admin" ? "Support Team" : msg.sender
      }));
      res.json(filteredMessages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ message: "Failed to fetch ticket messages" });
    }
  });
  app2.post("/api/support/tickets/:ticketId/messages", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const messageData = insertSupportMessageSchema.parse({
        ...req.body,
        ticketId: req.params.ticketId,
        userId: sessionUser.id,
        sender: sessionUser.role === "admin" || sessionUser.role === "employee" ? "admin" : "user"
      });
      const message = await storage3.createSupportMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating support message:", error);
      res.status(400).json({ message: "Failed to create support message" });
    }
  });
  app2.get("/api/admin/support/tickets", requireAdminOrEmployee, async (req, res) => {
    try {
      const tickets = await storage3.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching admin tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  app2.get("/api/admin/support/tickets/:status/:priority/:category", requireAdminOrEmployee, async (req, res) => {
    try {
      const { status, priority, category } = req.params;
      let tickets = await storage3.getAllSupportTickets();
      if (status !== "all") {
        tickets = tickets.filter((ticket) => ticket.status === status);
      }
      if (priority !== "all") {
        tickets = tickets.filter((ticket) => ticket.priority === priority);
      }
      if (category !== "all") {
        tickets = tickets.filter((ticket) => ticket.category === category);
      }
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching filtered admin tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  app2.put("/api/admin/support/tickets/:ticketId/status", requireAdminOrEmployee, async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { status } = req.body;
      if (!["open", "replied", "investigating", "resolved", "closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const ticket = await storage3.updateSupportTicketStatus(
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
  app2.post("/api/admin/support/tickets/:ticketId/reply", requireAdminOrEmployee, async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const messageData = {
        ticketId: req.params.ticketId,
        userId: sessionUser.id,
        // This will be the admin's user ID for tracking
        message: message.trim(),
        sender: "admin"
      };
      const supportMessage = await storage3.createSupportMessage(messageData);
      res.json(supportMessage);
    } catch (error) {
      console.error("Error creating admin reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });
  app2.get("/api/support/notifications/count/:userId", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (sessionUser.id !== req.params.userId && sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const count2 = await storage3.getSupportNotificationCount(req.params.userId);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });
  app2.post("/api/support/notifications/mark-read", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { ticketId } = req.body;
      if (!ticketId) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }
      await storage3.markSupportNotificationsAsRead(sessionUser.id, ticketId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });
  app2.post("/api/deposit/create-session", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { amount } = req.body;
      if (!amount || amount < 10) {
        return res.status(400).json({ message: "Minimum deposit amount is $10.00" });
      }
      const existingSession = await storage3.getUserDepositSessionByUserId(sessionUser.id);
      if (existingSession) {
        return res.json(existingSession);
      }
      const cryptoGateway = await storage3.getPaymentGatewayByName("crypto");
      if (!cryptoGateway || !cryptoGateway.isActive) {
        return res.status(400).json({ message: "Cryptocurrency payments are currently unavailable" });
      }
      const now = /* @__PURE__ */ new Date();
      const expiresAt = new Date(now.getTime() + 25 * 60 * 1e3);
      const sessionId = `deposit-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let instructionsText = "";
      if (cryptoGateway.instructions) {
        try {
          const instructionsArray = JSON.parse(cryptoGateway.instructions);
          if (Array.isArray(instructionsArray)) {
            instructionsText = instructionsArray.map(
              (inst, index) => `${index + 1}. ${typeof inst === "string" ? inst : inst.text || inst}`
            ).join("\n");
          } else {
            instructionsText = cryptoGateway.instructions;
          }
        } catch (e) {
          instructionsText = cryptoGateway.instructions;
        }
      }
      let qrCodeData = "";
      if (cryptoGateway.qrEnabled && cryptoGateway.qrCodeImagePath && cryptoGateway.qrCodeImagePath.trim() !== "") {
        let imagePath = cryptoGateway.qrCodeImagePath;
        if (imagePath.startsWith("/")) {
          imagePath = imagePath.substring(1);
        }
        while (imagePath.includes("qr-code/qr-code/")) {
          imagePath = imagePath.replace("qr-code/qr-code/", "qr-code/");
        }
        if (imagePath.startsWith("qr-codes/")) {
          imagePath = imagePath.replace("qr-codes/", "qr-code/");
        }
        if (!imagePath.startsWith("qr-code/") && !imagePath.startsWith("/qr-code/")) {
          imagePath = `qr-code/${imagePath}`;
        }
        qrCodeData = `/${imagePath}`;
      } else {
        qrCodeData = "";
      }
      const session2 = await storage3.createUserDepositSession({
        userId: sessionUser.id,
        sessionId,
        amount,
        // Store dollars directly
        walletAddress: cryptoGateway.walletAddress || "TUXp9Zpq7Eot6C3k453gM2uCkV6v8jdM2L",
        qrCodeData,
        instructions: instructionsText || "Please follow the payment instructions provided.",
        expiresAt,
        isActive: true
      });
      auditFinancialAction(req, sessionUser.id, "DEPOSIT_SESSION_CREATE", amount, true);
      const sessionWithQrFlag = {
        ...session2,
        qrEnabled: cryptoGateway.qrEnabled || false
      };
      res.json(sessionWithQrFlag);
    } catch (error) {
      const sessionUser = req.session.user;
      auditFinancialAction(req, sessionUser?.id || "unknown", "DEPOSIT_SESSION_CREATE", 0, false, error.message);
      res.status(500).json({ message: "Failed to create deposit session" });
    }
  });
  app2.get("/api/deposit/session", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const session2 = await storage3.getUserDepositSessionByUserId(sessionUser.id);
      if (!session2) {
        return res.status(404).json({ message: "No active deposit session" });
      }
      const cryptoGateway = await storage3.getPaymentGatewayByName("crypto");
      const sessionWithQrFlag = {
        ...session2,
        qrEnabled: cryptoGateway?.qrEnabled || false
      };
      res.json(sessionWithQrFlag);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposit session" });
    }
  });
  app2.delete("/api/deposit/session", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const session2 = await storage3.getUserDepositSessionByUserId(sessionUser.id);
      if (session2) {
        await storage3.expireUserDepositSession(session2.id);
      }
      res.json({ message: "Session closed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to close session" });
    }
  });
  app2.get("/api/admin/finance-settings", requireAdminOrEmployee, async (req, res) => {
    try {
      const settings2 = await storage3.getAllFinanceSettings();
      res.json(settings2);
    } catch (error) {
      console.error("Error fetching finance settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/finance-settings/:type", requireAdminOrEmployee, async (req, res) => {
    try {
      const { type } = req.params;
      const settings2 = await storage3.getFinanceSettingsByType(type);
      res.json(settings2);
    } catch (error) {
      console.error("Error fetching finance settings by type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/crypto-txids", requireAdmin, async (req, res) => {
    try {
      const query = `
        SELECT ct.*, u.username, u.first_name, u.last_name, wt.amount, wt.status, wt.created_at as transaction_date
        FROM crypto_txids ct
        LEFT JOIN users u ON ct.user_id = u.id
        LEFT JOIN wallet_transactions wt ON ct.wallet_transaction_id = wt.id
        ORDER BY ct.created_at DESC
      `;
      const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const result = await db3.execute(query);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching crypto TxIDs:", error);
      res.status(500).json({ error: "Failed to fetch crypto TxIDs" });
    }
  });
  app2.post("/api/admin/finance-settings", requireAdminOrEmployee, async (req, res) => {
    try {
      const settingData = req.body;
      const setting = await storage3.createFinanceSetting(settingData);
      res.json(setting);
    } catch (error) {
      console.error("Error creating finance setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/admin/finance-settings/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const setting = await storage3.updateFinanceSetting(id, updates);
      if (!setting) {
        return res.status(404).json({ error: "Finance setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error updating finance setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/finance-settings/:id", requireAdminOrEmployee, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage3.deleteFinanceSetting(id);
      if (!success) {
        return res.status(404).json({ error: "Finance setting not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting finance setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/wallet-transactions/:id/approve", requireAdminOrEmployee, async (req, res) => {
    try {
      const transactionId = req.params.id;
      const transaction = await storage3.getWalletTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      if (transaction.status !== "processing") {
        return res.status(400).json({ error: "Only processing transactions can be approved" });
      }
      const employeeUsername = req.session?.user?.username;
      const updatedTransaction = await storage3.processWalletTransaction(
        transactionId,
        "approved",
        req.session?.user?.id || "employee",
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
  app2.post("/api/admin/wallet-transactions/:id/reject", requireAdminOrEmployee, async (req, res) => {
    try {
      const transactionId = req.params.id;
      const { reasonId, customReason } = req.body;
      let finalReason = customReason;
      if (reasonId && !customReason) {
        const rejectionReasons2 = await storage3.getRejectionReasons();
        const rejectionReason = rejectionReasons2.find((r) => r.id === reasonId);
        finalReason = rejectionReason?.reasonText || "Transaction rejected";
      }
      if (!finalReason || !finalReason.trim()) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }
      const transaction = await storage3.getWalletTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      if (transaction.status !== "processing") {
        return res.status(400).json({ error: "Only processing transactions can be rejected" });
      }
      const employeeUsername = req.session?.user?.username;
      const updatedTransaction = await storage3.processWalletTransaction(
        transactionId,
        "failed",
        req.session?.user?.id || "employee",
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
  app2.get("/api/messages/order/:orderId", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { orderId } = req.params;
      const order = await storage3.getOrderById(orderId);
      if (!order || order.buyerId !== user.id && order.sellerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const messages2 = await storage3.getMessagesByOrderId(orderId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching order messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages/order/:orderId", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { orderId } = req.params;
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const order = await storage3.getOrderById(orderId);
      if (!order || order.buyerId !== user.id && order.sellerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const message = await storage3.createOrderMessage({
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
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { id } = req.params;
      const order = await storage3.getOrderById(id);
      if (!order || order.buyerId !== user.id && order.sellerId !== user.id) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.get("/api/admin/users/:userId/summary", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const userId = req.params.userId;
      const userSites = await storage3.getSitesByUserId(userId);
      const activeDomains = userSites.filter((site) => site.status === "approved").length;
      const userExchanges = await storage3.getExchangesByUserId(userId);
      const totalExchanges = userExchanges.filter(
        (exchange) => exchange.status === "completed" && exchange.requesterCompleted === true && exchange.requestedUserCompleted === true
      ).length;
      const userOrders = await storage3.getOrdersByUserId(userId);
      const totalSales = userOrders.filter(
        (order) => order.sellerId === userId && order.status === "completed"
      ).length;
      const wallet = await storage3.getWallet(userId);
      const balance = wallet ? wallet.balance : 0;
      res.json({
        totalSales,
        totalExchanges,
        activeDomains,
        balance: balance / 100
        // Convert cents to dollars
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user summary" });
    }
  });
  app2.post("/api/admin/user-balance-by-email", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }
      const users3 = await storage3.getAllUsers();
      const user = users3.find((u) => u.email.toLowerCase() === sanitizeInput(email).toLowerCase());
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const wallet = await storage3.getWallet(user.id);
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
  app2.get("/api/admin/banned-ips", requireAdmin, async (req, res) => {
    try {
      const bannedIPs = await storage3.getAllBannedIPs();
      res.json(bannedIPs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banned IPs" });
    }
  });
  app2.get("/api/admin/banned-emails", requireAdmin, async (req, res) => {
    try {
      const bannedEmails2 = await storage3.getAllBannedEmails();
      res.json(bannedEmails2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banned emails" });
    }
  });
  app2.post("/api/admin/ban-ip", requireAdmin, async (req, res) => {
    try {
      const { ipAddress, reason } = req.body;
      const sessionUser = req.session.user;
      if (!ipAddress || !reason) {
        return res.status(400).json({ message: "IP address and reason are required" });
      }
      const bannedIP = await storage3.banIP(ipAddress, reason, sessionUser.id);
      await storage3.terminateSessionsByIP(ipAddress);
      res.json(bannedIP);
    } catch (error) {
      console.error("Failed to ban IP address:", error);
      res.status(500).json({ message: "Failed to ban IP address" });
    }
  });
  app2.post("/api/admin/ban-email", requireAdmin, async (req, res) => {
    try {
      const { email, reason } = req.body;
      const sessionUser = req.session.user;
      if (!email || !reason) {
        return res.status(400).json({ message: "Email and reason are required" });
      }
      const bannedEmail = await storage3.banEmail(email, reason, sessionUser.id);
      await storage3.terminateSessionsByEmail(email);
      res.json(bannedEmail);
    } catch (error) {
      console.error("Failed to ban email address:", error);
      res.status(500).json({ message: "Failed to ban email address" });
    }
  });
  app2.delete("/api/admin/banned-ips/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage3.unbanIP(id);
      if (!success) {
        return res.status(404).json({ message: "Banned IP not found" });
      }
      res.json({ message: "IP address unbanned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban IP address" });
    }
  });
  app2.delete("/api/admin/banned-emails/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage3.unbanEmail(id);
      if (!success) {
        return res.status(404).json({ message: "Banned email not found" });
      }
      res.json({ message: "Email address unbanned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban email address" });
    }
  });
  app2.get("/api/admin/security/locked-ips", requireAdmin, async (req, res) => {
    try {
      await storage3.clearExpiredLocks();
      const lockedIps = await storage3.getLockedIps();
      res.json(lockedIps);
    } catch (error) {
      console.error("Error fetching locked IPs:", error);
      res.status(500).json({ message: "Failed to fetch locked IPs" });
    }
  });
  app2.post("/api/admin/security/unlock-ip", requireAdmin, async (req, res) => {
    try {
      const { ipAddress } = req.body;
      if (!ipAddress) {
        return res.status(400).json({ message: "IP address is required" });
      }
      await storage3.updateSecurityLoginAccess(ipAddress, {
        attemptCount: 0,
        lockedUntil: null,
        lastAttempt: /* @__PURE__ */ new Date()
      });
      res.json({ message: "IP address unlocked successfully" });
    } catch (error) {
      console.error("Error unlocking IP:", error);
      res.status(500).json({ message: "Failed to unlock IP address" });
    }
  });
  app2.get("/api/admin/rejection-reasons", requireAdminOrEmployee, async (req, res) => {
    try {
      const reasons = await storage3.getRejectionReasons();
      res.json(reasons);
    } catch (error) {
      console.error("Error fetching rejection reasons:", error);
      res.status(500).json({ message: "Failed to fetch rejection reasons" });
    }
  });
  app2.post("/api/admin/rejection-reasons", requireAdmin, async (req, res) => {
    try {
      const reasonData = insertRejectionReasonSchema.parse(req.body);
      const reason = await storage3.createRejectionReason(reasonData);
      res.status(201).json(reason);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating rejection reason:", error);
      res.status(500).json({ message: "Failed to create rejection reason" });
    }
  });
  app2.patch("/api/admin/rejection-reasons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const reason = await storage3.updateRejectionReason(id, updateData);
      if (!reason) {
        return res.status(404).json({ message: "Rejection reason not found" });
      }
      res.json(reason);
    } catch (error) {
      console.error("Error updating rejection reason:", error);
      res.status(500).json({ message: "Failed to update rejection reason" });
    }
  });
  app2.delete("/api/admin/rejection-reasons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage3.deleteRejectionReason(id);
      if (!success) {
        return res.status(404).json({ message: "Rejection reason not found" });
      }
      res.json({ message: "Rejection reason deleted successfully" });
    } catch (error) {
      console.error("Error deleting rejection reason:", error);
      res.status(500).json({ message: "Failed to delete rejection reason" });
    }
  });
  app2.get("/api/rejection-reasons", async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const reasons = await storage3.getActiveRejectionReasons();
      res.json(reasons);
    } catch (error) {
      console.error("Error fetching active rejection reasons:", error);
      res.status(500).json({ message: "Failed to fetch rejection reasons" });
    }
  });
  app2.get("/qr-code/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const path6 = await import("path");
      const fs4 = await import("fs");
      const fullPath = path6.join(process.cwd(), "public", "qr-code", filePath);
      if (!await fs4.promises.access(fullPath).then(() => true).catch(() => false)) {
        return res.status(404).json({ error: "QR code not found" });
      }
      const ext = path6.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp"
      };
      const mimeType = mimeTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      const readStream = fs4.createReadStream(fullPath);
      readStream.pipe(res);
    } catch (error) {
      console.error("Error serving QR code:", error);
      return res.status(404).json({ error: "QR code not found" });
    }
  });
  app2.get("/qr-codes/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const { ObjectStorageService: ObjectStorageService2 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
      const objectStorageService = new ObjectStorageService2();
      const file = await objectStorageService.getQRCodeFile(`/qr-codes/${filePath}`);
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving QR code:", error);
      return res.status(404).json({ error: "QR code not found" });
    }
  });
  app2.post("/api/admin/qr-codes/upload", requireAdmin, async (req, res) => {
    try {
      const { ObjectStorageService: ObjectStorageService2 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
      const objectStorageService = new ObjectStorageService2();
      const uploadURL = await objectStorageService.getQRCodeUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting QR code upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });
  app2.post("/api/admin/qr-codes/upload-local", requireAdmin, async (req, res) => {
    try {
      const multer2 = (await import("multer")).default;
      const path6 = await import("path");
      const fs4 = await import("fs");
      const { currentQrPath } = req.query;
      const storage4 = multer2.diskStorage({
        destination: async (req2, file, cb) => {
          const uploadDir = path6.join(process.cwd(), "public", "qr-code");
          await fs4.promises.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req2, file, cb) => {
          const uuid = randomUUID2();
          const ext = path6.extname(file.originalname);
          cb(null, `${uuid}${ext}`);
        }
      });
      const upload = multer2({
        storage: storage4,
        limits: { fileSize: 5 * 1024 * 1024 },
        // 5MB limit
        fileFilter: (req2, file, cb) => {
          if (file.mimetype.startsWith("image/")) {
            cb(null, true);
          } else {
            cb(new Error("Only image files are allowed"));
          }
        }
      }).single("file");
      upload(req, res, async (err) => {
        if (err) {
          console.error("Error uploading QR code:", err);
          return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        if (currentQrPath && typeof currentQrPath === "string") {
          try {
            console.log(`Attempting to delete old QR code: ${currentQrPath}`);
            let oldFilePath = "";
            if (currentQrPath.startsWith("qr-code/")) {
              oldFilePath = path6.join(process.cwd(), "public", currentQrPath);
              console.log(`Direct path format detected: ${oldFilePath}`);
            } else if (currentQrPath.startsWith("local-qr-")) {
              const uuid = currentQrPath.replace("local-qr-", "");
              console.log(`Local QR format detected, UUID: ${uuid}`);
              const qrDir = path6.join(process.cwd(), "public", "qr-code");
              try {
                const files = await fs4.promises.readdir(qrDir);
                console.log(`Files in QR directory: ${files.join(", ")}`);
                const oldFile = files.find((file) => file.startsWith(uuid));
                if (oldFile) {
                  oldFilePath = path6.join(qrDir, oldFile);
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
              const fileExists = await fs4.promises.access(oldFilePath).then(() => true).catch(() => false);
              console.log(`File exists at ${oldFilePath}: ${fileExists}`);
              if (fileExists) {
                await fs4.promises.unlink(oldFilePath);
                console.log(`Successfully deleted old QR code: ${oldFilePath}`);
              }
            }
          } catch (deleteError) {
            console.error("Error deleting old QR code:", deleteError);
          }
        } else {
          console.log(`No current QR path provided for deletion`);
        }
        const filename = path6.parse(req.file.filename).name;
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
  app2.post("/api/admin/qr-codes/normalize", requireAdmin, async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "Upload URL is required" });
      }
      const { ObjectStorageService: ObjectStorageService2 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
      const objectStorageService = new ObjectStorageService2();
      const normalizedPath = objectStorageService.normalizeQRCodePath(uploadURL);
      res.json({ normalizedPath });
    } catch (error) {
      console.error("Error normalizing QR code path:", error);
      res.status(500).json({ error: "Failed to normalize QR code path" });
    }
  });
  app2.get("/api/admin/payment-gateways", requireAdmin, async (req, res) => {
    try {
      const gateways = await storage3.getAllPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ error: "Failed to fetch payment gateways" });
    }
  });
  app2.get("/api/admin/payment-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const gateway = await storage3.getPaymentGatewayById(req.params.id);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });
  app2.put("/api/admin/payment-gateways/:id", requireAdmin, async (req, res) => {
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
      let normalizedQRPath = qrCodeImagePath;
      if (qrCodeImagePath && qrCodeImagePath.startsWith("https://storage.googleapis.com/")) {
        const { ObjectStorageService: ObjectStorageService2 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
        const objectStorageService = new ObjectStorageService2();
        normalizedQRPath = objectStorageService.normalizeQRCodePath(qrCodeImagePath);
      }
      const gateway = await storage3.updatePaymentGateway(req.params.id, {
        displayName,
        walletAddress,
        qrCodeImagePath: normalizedQRPath,
        qrEnabled: qrEnabled !== void 0 ? Boolean(qrEnabled) : true,
        instructions: typeof instructions === "string" ? instructions : JSON.stringify(instructions),
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
  app2.get("/api/global-notifications", async (req, res) => {
    try {
      const notifications2 = await storage3.getActiveGlobalNotifications();
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching global notifications:", error);
      res.status(500).json({ error: "Failed to fetch global notifications" });
    }
  });
  app2.get("/api/admin/global-notifications", requireAdmin, async (req, res) => {
    try {
      const notifications2 = await storage3.getAllGlobalNotifications();
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching all global notifications:", error);
      res.status(500).json({ error: "Failed to fetch global notifications" });
    }
  });
  app2.post("/api/admin/global-notifications", requireAdmin, async (req, res) => {
    try {
      const notification = await storage3.createGlobalNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating global notification:", error);
      res.status(500).json({ error: "Failed to create global notification" });
    }
  });
  app2.patch("/api/admin/global-notifications/:id", requireAdmin, async (req, res) => {
    try {
      const notification = await storage3.updateGlobalNotification(req.params.id, req.body);
      if (!notification) {
        return res.status(404).json({ error: "Global notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error updating global notification:", error);
      res.status(500).json({ error: "Failed to update global notification" });
    }
  });
  app2.delete("/api/admin/global-notifications/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage3.deleteGlobalNotification(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Global notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting global notification:", error);
      res.status(500).json({ error: "Failed to delete global notification" });
    }
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }
      const { ObjectStorageService: ObjectStorageService2 } = await Promise.resolve().then(() => (init_objectStorage(), objectStorage_exports));
      const objectStorageService = new ObjectStorageService2();
      let file;
      if (filePath.startsWith("qr-codes/")) {
        try {
          file = await objectStorageService.getQRCodeFile(`/${filePath}`);
        } catch (error) {
          console.log("QR code file not found, trying public object search:", error.message);
          file = await objectStorageService.searchPublicObject(filePath);
        }
      } else {
        file = await objectStorageService.searchPublicObject(filePath);
      }
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving public object:", error);
      res.status(404).json({ error: "File not found" });
    }
  });
  app2.get("/api/social-links", async (req, res) => {
    try {
      const socialLinks2 = await storage3.getActiveSocialLinks();
      res.json(socialLinks2);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });
  app2.get("/api/admin/social-links", requireAdmin, async (req, res) => {
    try {
      const socialLinks2 = await storage3.getAllSocialLinks();
      res.json(socialLinks2);
    } catch (error) {
      console.error("Error fetching all social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });
  app2.post("/api/admin/social-links", requireAdmin, async (req, res) => {
    try {
      const { name, url, isActive } = req.body;
      const socialLink = await storage3.createSocialLink({ name, url, isActive });
      res.json(socialLink);
    } catch (error) {
      console.error("Error creating social link:", error);
      res.status(500).json({ message: "Failed to create social link" });
    }
  });
  app2.put("/api/admin/social-links/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, isActive } = req.body;
      const socialLink = await storage3.updateSocialLink(id, { name, url, isActive });
      if (!socialLink) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json(socialLink);
    } catch (error) {
      console.error("Error updating social link:", error);
      res.status(500).json({ message: "Failed to update social link" });
    }
  });
  app2.delete("/api/admin/social-links/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage3.deleteSocialLink(id);
      if (!deleted) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json({ message: "Social link deleted successfully" });
    } catch (error) {
      console.error("Error deleting social link:", error);
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });
  app2.post("/api/profile/upload", (req, res) => {
    uploadAvatar.single("file")(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Image must be 300x300 pixels and up to 1MB" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ error: "Invalid file format. Use JPG, PNG, GIF, or WebP" });
        }
        if (err.message && err.message.includes("Invalid file type")) {
          return res.status(400).json({ error: "Invalid file format. Use JPG, PNG, GIF, or WebP" });
        }
        return res.status(400).json({ error: "File upload failed" });
      }
      try {
        const user = req.session?.user;
        if (!user) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const processedPath = await processAvatarImage(req.file.path);
        const relativePath = processedPath.replace(process.cwd() + "/public", "");
        const updatedUser = await storage3.updateUserAvatar(user.id, relativePath);
        if (!updatedUser) {
          return res.status(500).json({ error: "Failed to update user avatar" });
        }
        req.session.user = { ...user, avatar: relativePath };
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
  app2.post("/api/profile/upload-url", async (req, res) => {
    try {
      const user = req.session?.user;
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
  app2.put("/api/profile/avatar", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { avatarURL } = req.body;
      if (!avatarURL) {
        return res.status(400).json({ error: "Avatar URL is required" });
      }
      const objectStorageService = new ObjectStorageService();
      const avatarPath = objectStorageService.normalizeProfilePicturePath(avatarURL, user.id);
      const updatedUser = await storage3.updateUserAvatar(user.id, avatarPath);
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user avatar" });
      }
      req.session.user = { ...user, avatar: avatarPath };
      res.json({
        avatarPath,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });
  app2.get("/api/profile/avatar/:path(*)", async (req, res) => {
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
  app2.get("/api/admin/referral-records", requireAdmin, async (req, res) => {
    try {
      const { status = "pending" } = req.query;
      const allCommissions = await db2.select({
        id: refCommissions2.id,
        referrerId: refCommissions2.referrerId,
        referredUserId: refCommissions2.referredUserId,
        orderId: refCommissions2.orderId,
        referralAmount: refCommissions2.referralAmount,
        status: refCommissions2.status,
        createdAt: refCommissions2.createdAt,
        updatedAt: refCommissions2.updatedAt,
        referrerUsername: users2.username,
        referrerFirstName: users2.firstName,
        referrerLastName: users2.lastName,
        referrerEmail: users2.email
      }).from(refCommissions2).innerJoin(users2, eq2(refCommissions2.referrerId, users2.id)).where(eq2(refCommissions2.status, status)).orderBy(desc2(refCommissions2.createdAt));
      const commissionsWithDetails = await Promise.all(
        allCommissions.map(async (commission) => {
          const referredUser = await storage3.getUser(commission.referredUserId);
          return {
            ...commission,
            referredUsername: referredUser?.username || "Unknown",
            referredFirstName: referredUser?.firstName || "Unknown",
            referredLastName: referredUser?.lastName || "Unknown",
            referredEmail: referredUser?.email || "Unknown"
          };
        })
      );
      res.json(commissionsWithDetails);
    } catch (error) {
      console.error("Error fetching referral records:", error);
      res.status(500).json({ message: "Failed to fetch referral records" });
    }
  });
  app2.get("/api/admin/referral-stats", requireAdmin, async (req, res) => {
    try {
      const allCommissions = await db2.select().from(refCommissions2);
      const stats = {
        totalCommissions: allCommissions.length,
        pendingCommissions: allCommissions.filter((c) => c.status === "pending").length,
        paidCommissions: allCommissions.filter((c) => c.status === "paid").length,
        totalPaid: allCommissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + (c.referralAmount || 0), 0),
        totalPending: allCommissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + (c.referralAmount || 0), 0)
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";

// shared/utils/basePath.ts
var DEFAULT_ADMIN_BASE_PATH = "/Alex1996admin";
var DEFAULT_EMPLOYEE_BASE_PATH = "/Alex1996employee";
var ADMIN_ENV_KEYS = [
  "VITE_ADMIN_BASE_PATH",
  "ADMIN_BASE_PATH",
  "REACT_APP_ADMIN_BASE_PATH"
];
var EMPLOYEE_ENV_KEYS = [
  "VITE_EMPLOYEE_BASE_PATH",
  "EMPLOYEE_BASE_PATH",
  "REACT_APP_EMPLOYEE_BASE_PATH"
];
var createBasePath = (envValue, fallback) => {
  const trimmedPath = typeof envValue === "string" ? envValue.trim() : "";
  const normalizedPath = trimmedPath.length > 0 ? trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}` : fallback;
  let sanitizedPath = normalizedPath;
  while (sanitizedPath.endsWith("/") && sanitizedPath !== "/") {
    sanitizedPath = sanitizedPath.slice(0, -1);
  }
  return sanitizedPath;
};

// server/vite.ts
var pickEnvValue = (keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return void 0;
};
var runtimeConfig = {
  ADMIN_BASE_PATH: createBasePath(
    pickEnvValue(ADMIN_ENV_KEYS),
    DEFAULT_ADMIN_BASE_PATH
  ),
  EMPLOYEE_BASE_PATH: createBasePath(
    pickEnvValue(EMPLOYEE_ENV_KEYS),
    DEFAULT_EMPLOYEE_BASE_PATH
  )
};
var serializedRuntimeConfig = JSON.stringify(runtimeConfig).replace(
  /</g,
  "\\u003C"
);
var runtimeConfigScript = [
  "<script>",
  "  (function() {",
  `    const runtime = ${serializedRuntimeConfig};`,
  "    const merge = (target) => Object.assign({}, target, runtime);",
  "    window.__APP_CONFIG__ = merge(window.__APP_CONFIG__);",
  "    window.__ENV__ = merge(window.__ENV__);",
  "  })();",
  "</script>"
].join("\n");
var injectRuntimeConfig = (html) => {
  const scriptTag = `${runtimeConfigScript}
`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${scriptTag}</head>`);
  }
  if (html.includes("</body>")) {
    return html.replace("</body>", `${scriptTag}</body>`);
  }
  return `${html}${scriptTag}`;
};
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const transformedTemplate = await vite.transformIndexHtml(url, template);
      const page = injectRuntimeConfig(transformedTemplate);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  const indexHtmlPath = path3.resolve(distPath, "index.html");
  let cachedIndexHtml;
  app2.use("*", async (_req, res, next) => {
    try {
      if (!cachedIndexHtml) {
        const template = await fs2.promises.readFile(indexHtmlPath, "utf-8");
        cachedIndexHtml = injectRuntimeConfig(template);
      }
      res.status(200).set({ "Content-Type": "text/html" }).send(cachedIndexHtml);
    } catch (error) {
      next(error);
    }
  });
}

// server/middleware/security.ts
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import helmet from "helmet";
var keyByUserOrIp = (req) => req.user?.id ? `u:${req.user.id}` : ipKeyGenerator(req);
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  message: {
    error: "Too many login attempts, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});
var registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 10,
  message: {
    error: "Too many registration attempts, please try again after 1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});
var passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 3,
  message: {
    error: "Too many password reset attempts, please try again after 1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});
var generalLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute for faster recovery
  max: 500,
  // 500 requests per minute per user/IP
  message: {
    error: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserOrIp
});
var pollLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 120,
  // 120 requests per minute per user/IP (2 per second)
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserOrIp
});
var securityHeaders = helmet({
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
        ...process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []
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
        ...process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []
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
        "https://www.facebook.com"
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
        "https://*.google.com",
        // <— add (covers /ccm/form-data, /pagead/form-data)
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com",
        "https://td.doubleclick.net"
      ],
      frameSrc: [
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google.com",
        "https://td.doubleclick.net"
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// server/seo-middleware.ts
import fs3 from "fs";
import path4 from "path";
import { fileURLToPath } from "url";

// server/seo-server.js
var seoConfig = null;
try {
  console.log("Loading built-in SEO config...");
  seoConfig = parseSEOConfigFromTS();
} catch (error) {
  console.error("Failed to load SEO config:", error.message);
  seoConfig = getDefaultSEOConfig();
}
function parseSEOConfigFromTS() {
  return {
    global: {
      siteName: "B2B Demo",
      baseUrl: "https://alexdu1996sec485space.space/",
      defaultImage: "/og-image.png",
      twitterSite: "@B2B Demo",
      googleSiteVerification: ""
    },
    globalScripts: {
      facebookPixel: {
        enabled: false,
        pixelId: ""
      }
    },
    pages: {
      home: {
        title: "B2B Demo - Guest Post & Link Collaboration Platform",
        description: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations and quality link partnerships.",
        robots: "noindex,nofollow",
        keywords: "guest posting, link building, collaboration, content marketing, SEO, website partnerships",
        canonical: "/",
        openGraph: {
          title: "B2B Demo - Guest Post & Link Collaboration Platform",
          description: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations.",
          type: "website"
        },
        twitter: {
          card: "summary_large_image",
          title: "B2B Demo - Guest Post & Link Collaboration Platform",
          description: "Connect with verified site owners for authentic guest posting opportunities."
        }
      },
      about: {
        title: "About Us - B2B Demo",
        description: "Learn about B2B Demo's mission to connect website owners, content creators, and marketers for authentic collaboration opportunities.",
        robots: "noindex,nofollow",
        keywords: "about B2B Demo, company mission, team, guest posting platform",
        canonical: "/about",
        openGraph: {
          title: "About B2B Demo",
          description: "Learn about our mission to connect website owners and content creators.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "About B2B Demo",
          description: "Learn about our mission to connect website owners and content creators."
        }
      },
      blog: {
        title: "Blog - B2B Demo",
        description: "Latest insights, tips, and news about guest posting, content collaboration, and digital marketing strategies.",
        robots: "noindex,nofollow",
        keywords: "guest posting blog, content marketing, SEO tips, link building strategies",
        canonical: "/blog",
        openGraph: {
          title: "B2B Demo Blog",
          description: "Latest insights about guest posting and content collaboration.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "B2B Demo Blog",
          description: "Latest insights about guest posting and content collaboration."
        }
      },
      contact: {
        title: "Contact Us - B2B Demo",
        description: "Get in touch with B2B Demo team. We're here to help with your guest posting and collaboration needs.",
        robots: "noindex,nofollow",
        keywords: "contact B2B Demo, support, help, guest posting support",
        canonical: "/contact",
        openGraph: {
          title: "Contact B2B Demo",
          description: "Get in touch with our team for support and inquiries.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "Contact B2B Demo",
          description: "Get in touch with our team for support and inquiries."
        }
      },
      faq: {
        title: "FAQ - B2B Demo",
        description: "Frequently asked questions about B2B Demo's guest posting platform, pricing, and collaboration process.",
        robots: "noindex,nofollow",
        keywords: "B2B Demo faq, help, questions, guest posting help",
        canonical: "/faq",
        openGraph: {
          title: "B2B Demo FAQ",
          description: "Frequently asked questions about our guest posting platform.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "B2B Demo FAQ",
          description: "Frequently asked questions about our platform."
        }
      },
      terms: {
        title: "Terms of Service - B2B Demo",
        description: "Terms and conditions for using B2B Demo's guest posting and collaboration platform.",
        robots: "noindex,nofollow",
        canonical: "/terms",
        openGraph: {
          title: "B2B Demo Terms of Service",
          description: "Terms and conditions for using our platform.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "Terms of Service",
          description: "Terms and conditions for using B2B Demo."
        }
      },
      privacy: {
        title: "Privacy Policy - B2B Demo",
        description: "B2B Demo's privacy policy explaining how we collect, use, and protect your personal information.",
        robots: "noindex,nofollow",
        canonical: "/privacy",
        openGraph: {
          title: "B2B Demo Privacy Policy",
          description: "How we collect, use, and protect your information.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "Privacy Policy",
          description: "How B2B Demo protects your privacy."
        }
      }
    }
  };
}
function getDefaultSEOConfig() {
  return {
    global: {
      siteName: "B2B Demo",
      baseUrl: "https://alexdu1996sec485space.space/",
      defaultImage: "/og-image.png",
      googleSiteVerification: "h_K6YJXbLNtPNRzLP3VY4qc1s9OT41mMy4CVQCz3d80"
    },
    globalScripts: {
      facebookPixel: {
        enabled: false,
        pixelId: "1694662417902669"
      }
    },
    pages: {
      home: {
        title: "B2B Demo - Guest Post & Link Collaboration Platform",
        description: "Connect with verified site owners for authentic guest posting opportunities.",
        robots: "noindex,nofollow"
      },
      about: {
        title: "About B2B Demo",
        description: "Learn about B2B Demo's mission to connect content creators.",
        robots: "noindex,nofollow"
      },
      contact: {
        title: "Contact Us - B2B Demo",
        description: "Get in touch with the B2B Demo team.",
        robots: "noindex,nofollow"
      },
      blog: {
        title: "Blog - B2B Demo",
        description: "Latest insights on guest posting and link building.",
        robots: "noindex,nofollow"
      },
      faq: {
        title: "FAQ - B2B Demo",
        description: "Frequently asked questions about B2B Demo.",
        robots: "noindex,nofollow"
      },
      terms: {
        title: "Terms of Service - B2B Demo",
        description: "Terms and conditions for using B2B Demo.",
        robots: "noindex,nofollow"
      },
      privacy: {
        title: "Privacy Policy - B2B Demo",
        description: "Privacy policy for B2B Demo users.",
        robots: "noindex,nofollow"
      },
      auth: {
        title: "Sign In - B2B Demo",
        description: "Access your collaboration dashboard",
        robots: "noindex,nofollow"
      }
    }
  };
}
function detectPageFromUrl(url) {
  const cleanUrl = url.split("?")[0].replace(/\/$/, "") || "/";
  if (cleanUrl === "/" || cleanUrl === "") return "home";
  if (cleanUrl === "/about") return "about";
  if (cleanUrl.startsWith("/blog/") && cleanUrl !== "/blog") {
    const slug = cleanUrl.replace("/blog/", "");
    return { type: "blogPost", slug };
  }
  if (cleanUrl === "/blog") return "blog";
  if (cleanUrl === "/contact") return "contact";
  if (cleanUrl === "/faq") return "faq";
  if (cleanUrl === "/terms") return "terms";
  if (cleanUrl === "/privacy") return "privacy";
  if (cleanUrl === "/auth" || cleanUrl === "/signup" || cleanUrl === "/login") return "auth";
  return "unknown";
}
function generateMetaTags(pageKey, dynamicData = null) {
  if (!seoConfig) {
    console.error("SEO config not loaded, using minimal fallback");
    return `
      <title>B2B Demo</title>
      <meta name="description" content="Guest posting and collaboration platform">
      <meta name="robots" content="noindex,nofollow">
    `;
  }
  const global = seoConfig.global;
  if (typeof pageKey === "object" && pageKey.type === "blogPost") {
    const blogPostData = getBlogPostBySlug(pageKey.slug);
    return generateBlogPostMeta(blogPostData, global);
  }
  const page = seoConfig.pages[pageKey];
  if (!page) {
    return `
      <title>Page - B2B Demo</title>
      <meta name="description" content="B2B Demo platform page">
      <meta name="robots" content="noindex,nofollow">
      <meta name="google-site-verification" content="${global.googleSiteVerification}">
      <meta property="og:site_name" content="${global.siteName}">
      <meta property="og:image" content="${global.baseUrl}${global.defaultImage}">
    `;
  }
  if (pageKey === "blogPost" && dynamicData) {
    return generateBlogPostMeta(dynamicData, global);
  }
  const canonicalUrl = global.baseUrl + (page.canonical || (pageKey === "home" ? "" : "/" + pageKey));
  let trackingScripts = "";
  if (seoConfig.globalScripts && (page.robots && page.robots.includes("index") || pageKey === "auth")) {
    if (seoConfig.globalScripts.facebookPixel?.enabled) {
      trackingScripts += `
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${seoConfig.globalScripts.facebookPixel.pixelId}');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${seoConfig.globalScripts.facebookPixel.pixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->`;
    }
  }
  return `
    <title>${page.title}</title>
    <meta name="description" content="${page.description}">
    <meta name="robots" content="${page.robots}">
    <meta name="google-site-verification" content="${global.googleSiteVerification}">
    ${page.keywords ? `<meta name="keywords" content="${page.keywords}">` : ""}
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${page.openGraph?.title || page.title}">
    <meta property="og:description" content="${page.openGraph?.description || page.description}">
    <meta property="og:type" content="${page.openGraph?.type || "website"}">
    <meta property="og:site_name" content="${global.siteName}">
    <meta property="og:image" content="${global.baseUrl}${page.openGraph?.image || global.defaultImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${canonicalUrl}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${page.twitter?.card || "summary"}">
    <meta name="twitter:title" content="${page.twitter?.title || page.title}">
    <meta name="twitter:description" content="${page.twitter?.description || page.description}">
    <meta name="twitter:image" content="${global.baseUrl}${page.twitter?.image || global.defaultImage}">
    ${global.twitterSite ? `<meta name="twitter:site" content="${global.twitterSite}">` : ""}
    
    ${trackingScripts}
  `;
}
function getBlogPostBySlug(slug) {
  const blogPosts = {
    "getting-started-with-link-building": {
      title: "Getting Started with Link Building",
      excerpt: "Learn the fundamentals of link building and how to create effective strategies for your website.",
      content: "Link building is one of the most important aspects of SEO...",
      category: "Link Building",
      author: "B2B Demo Team",
      slug: "getting-started-with-link-building",
      featuredImage: "/og-image.png"
    },
    "guest-posting-best-practices": {
      title: "Guest Posting Best Practices",
      excerpt: "Discover proven strategies for successful guest posting campaigns that build authority and drive traffic.",
      content: "Guest posting remains one of the most effective...",
      category: "Guest Posting",
      author: "B2B Demo Team",
      slug: "guest-posting-best-practices",
      featuredImage: "/og-image.png"
    }
  };
  return blogPosts[slug] || {
    title: "Blog Post",
    excerpt: "Read this article on B2B Demo blog.",
    slug,
    featuredImage: "/og-image.png"
  };
}
function generateBlogPostMeta(post, global) {
  const title = `${post.title} - B2B Demo Blog`;
  const description = post.excerpt || post.content?.substring(0, 160) || "Read this article on B2B Demo blog.";
  const canonicalUrl = `${global.baseUrl}/blog/${post.slug}`;
  const image = post.featuredImage || global.defaultImage;
  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="noindex,nofollow">
    <meta name="google-site-verification" content="${global.googleSiteVerification}">
    ${post.category ? `<meta name="keywords" content="${post.category}, blog, B2B Demo">` : ""}
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${global.siteName}">
    <meta property="og:image" content="${global.baseUrl}${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${canonicalUrl}">
    ${post.author ? `<meta property="article:author" content="${post.author}">` : ""}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${global.baseUrl}${image}">
    ${global.twitterSite ? `<meta name="twitter:site" content="${global.twitterSite}">` : ""}
  `;
}
function injectMetaIntoHTML(html, metaTags) {
  let cleanedHtml = html.replace(/<title>.*?<\/title>/gi, "").replace(/<meta[^>]*name="(description|robots|keywords|google-site-verification|twitter:[^"]*)"[^>]*>/gi, "").replace(/<meta[^>]*property="(og:[^"]*)"[^>]*>/gi, "").replace(/<link[^>]*rel="canonical"[^>]*>/gi, "").replace(/<!-- Note: JavaScript useSEO hook will override these for dynamic pages -->/gi, "").replace(/<!-- Default SEO Meta Tags for Social Media Crawlers -->/gi, "").replace(/<!-- Google Site Verification -->/gi, "").replace(/<!-- Open Graph Meta Tags -->/gi, "").replace(/<!-- Twitter Card Meta Tags -->/gi, "");
  cleanedHtml = cleanedHtml.replace(
    /(<meta\s+name="viewport"[^>]*>\s*)/i,
    `$1
${metaTags}
`
  );
  return cleanedHtml;
}

// server/seo-middleware.ts
function createSEOMiddleware() {
  let htmlTemplate = null;
  function getHTMLTemplate() {
    if (!htmlTemplate) {
      const currentFile = fileURLToPath(import.meta.url);
      const serverDir = path4.dirname(currentFile);
      const appRoot = path4.resolve(serverDir, "..");
      const htmlPath = process.env.NODE_ENV === "production" ? path4.join(appRoot, "dist/public/index.html") : path4.join(appRoot, "client/index.html");
      if (fs3.existsSync(htmlPath)) {
        const rawTemplate = fs3.readFileSync(htmlPath, "utf-8");
        htmlTemplate = injectRuntimeConfig(rawTemplate);
        console.log(`[SEO] HTML template loaded: ${htmlPath}`);
      } else {
        console.error(`[SEO] ERROR: HTML template not found at: ${htmlPath}`);
        console.log(
          `[SEO] App root: ${appRoot}, files:`,
          fs3.readdirSync(appRoot).join(", ")
        );
      }
    }
    return htmlTemplate;
  }
  return async (req, res, next) => {
    const url = req.originalUrl;
    const skipSEORoutes = [
      "/api/",
      "/@",
      "/verify-email",
      "verify-email",
      "token=",
      "&error=",
      "/auth/reset-password",
      "/auth/forgot-password"
    ];
    if (req.method !== "GET" || url.includes(".") || skipSEORoutes.some((route) => url.includes(route))) {
      return next();
    }
    if (process.env.NODE_ENV === "production") {
      const template = getHTMLTemplate();
      if (!template) {
        return next();
      }
      const pageKey = detectPageFromUrl(url);
      const metaTags = generateMetaTags(pageKey);
      const htmlWithSEO = injectMetaIntoHTML(template, metaTags);
      console.log(
        `[SEO] Serving dynamic HTML with SEO for: ${url}`,
        typeof pageKey === "object" ? JSON.stringify(pageKey) : pageKey
      );
      res.setHeader("Content-Type", "text/html");
      res.send(htmlWithSEO);
      return;
    } else {
      const pageKey = detectPageFromUrl(url);
      const metaTags = generateMetaTags(pageKey);
      res.locals.seoTags = metaTags;
      res.locals.pageKey = pageKey;
    }
    next();
  };
}

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
if (process.env.NODE_ENV === "production") {
  app.use(securityHeaders);
}
if (process.env.NODE_ENV === "production") {
  app.use(generalLimiter);
}
app.use("/api/messages/unread-count", pollLimiter);
app.use("/api/support/notifications/count", pollLimiter);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(express2.static(path5.join(process.cwd(), "public")));
var PgSession = connectPgSimple(session);
var pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  // Limit pool size to prevent connection exhaustion
  idleTimeoutMillis: 3e4,
  // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5e3
  // Timeout connection attempts after 5 seconds
});
pgPool.on("error", (err) => {
  console.error("Database pool error:", err);
});
pgPool.on("connect", () => {
  console.log("Database pool connected successfully");
});
pgPool.on("remove", () => {
  console.log("Database pool connection removed");
});
var sessionStore = new PgSession({
  pool: pgPool,
  tableName: "auth_session_store",
  createTableIfMissing: true,
  ttl: 48 * 60 * 60,
  // Extended to 48 hours for stability
  disableTouch: false,
  // Enable session refresh on activity
  pruneSessionInterval: 60 * 60 * 6
  // Reduced frequency: clean every 6 hours instead of 15 minutes
});
sessionStore.on("error", (err) => {
  console.error("Session store error:", err);
});
app.use(session({
  secret: process.env.SESSION_SECRET || "domain-exchange-secret",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  // Reset expiration on activity
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // HTTPS only in production
    httpOnly: true,
    // Prevent XSS attacks via document.cookie
    maxAge: 48 * 60 * 60 * 1e3,
    // Extended to 48 hours to match TTL
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
    // More flexible for production SPA
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN || void 0 : void 0
    // Set domain for production
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    app.use(createSEOMiddleware());
    await setupVite(app, server);
  } else {
    app.use(createSEOMiddleware());
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
