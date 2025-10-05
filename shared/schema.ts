import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  bio: text("bio"),
  avatar: text("avatar"),
  status: text("status").default("active"), // active, banned
  role: text("role").default("user"), // user, admin, employee
  emailVerified: boolean("email_verified").notNull().default(false), // Email verification status
  referredBy: varchar("referred_by").references(() => users.id), // User who referred this user
  registrationIp: text("registration_ip"), // IP address when user registered
  lastLoginIp: text("last_login_ip"), // IP address from last login
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteCategories = pgTable("site_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sites = pgTable("sites", {
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
  purpose: text("purpose").notNull().default("exchange"), // exchange, sales, both
  linkType: text("link_type").notNull().default("dofollow"), // dofollow, nofollow
  casinoAllowed: text("casino_allowed").default("N/A"), // yes, no, N/A
  price: integer("price"), // Price in cents (for sales purpose)
  deliveryTime: integer("delivery_time"), // Days for delivery (for sales purpose)
  purchaseCount: integer("purchase_count").notNull().default(0), // Total completed guest post purchases
  status: text("status").notNull().default("pending"), // pending, approved, rejected, blacklisted
  rejectionReason: text("rejection_reason"), // Reason for rejection/blacklisting
  approvedBy: text("approved_by"), // Username of employee who approved
  rejectedBy: text("rejected_by"), // Username of employee who rejected
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed
  processedAt: timestamp("processed_at"), // When approved/rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exchanges = pgTable("exchanges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").unique(), // Unique order ID like #EX0001
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  requestedUserId: varchar("requested_user_id").notNull().references(() => users.id),
  requesterSiteId: varchar("requester_site_id").notNull().references(() => sites.id),
  requestedSiteId: varchar("requested_site_id").notNull().references(() => sites.id),
  status: text("status").notNull().default("pending"), // pending, active, delivered, completed, cancelled, declined, rejected
  message: text("message"),
  deliveryUrl: text("delivery_url"), // URL where content was published
  requesterCompleted: boolean("requester_completed").notNull().default(false), // Requester marked as completed
  requestedUserCompleted: boolean("requested_user_completed").notNull().default(false), // Requested user marked as completed
  deliveredBy: varchar("delivered_by").references(() => users.id), // Who marked as delivered
  deliveredAt: timestamp("delivered_at"), // When marked as delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exchangeId: varchar("exchange_id").references(() => exchanges.id),
  orderId: varchar("order_id").references(() => orders.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readBy: varchar("read_by").references(() => users.id), // Who read the message
  readAt: timestamp("read_at"), // When it was read
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // exchange_request, exchange_accepted, exchange_denied, exchange_cancelled, message
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedEntityId: varchar("related_entity_id"), // exchange id or message id
  section: text("section"), // "exchange" or "guest_post"
  subTab: text("sub_tab"), // "ongoing", "completed", "declined", etc.
  priority: text("priority").default("normal"), // "normal", "high", "urgent"
  createdAt: timestamp("created_at").defaultNow(),
});

// New marketplace tables
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  siteId: varchar("site_id").notNull().references(() => sites.id),
  type: text("type").notNull(), // "guest_post" or "link_placement"
  price: integer("price").notNull(), // Price in cents
  serviceFee: integer("service_fee").notNull(), // 5% fee in cents
  isActive: boolean("is_active").notNull().default(true),
  requirements: text("requirements"), // Special requirements or guidelines
  turnaroundTime: integer("turnaround_time"), // Days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  balance: integer("balance").notNull().default(0), // Balance in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").unique(), // Unique order ID like #ORDER-001
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  amount: integer("amount").notNull(), // Total amount paid in cents
  serviceFee: integer("service_fee").notNull(), // Platform fee in cents
  sellerAmount: integer("seller_amount").notNull(), // Amount seller receives in cents
  status: text("status").notNull().default("pending"), // pending, accepted, in_progress, delivered, completed, cancelled
  requirements: text("requirements"), // Buyer's specific requirements
  googleDocLink: text("google_doc_link"), // Google Doc link provided by buyer
  targetLink: text("target_link"), // Target URL where link should point
  deliveryUrl: text("delivery_url"), // URL where content was published
  buyerCompleted: boolean("buyer_completed").notNull().default(false), // Buyer confirmed completion
  sellerDelivered: boolean("seller_delivered").notNull().default(false), // Seller marked as delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").unique().notNull(), // Display ID like TX-ABC123, WD-XYZ789
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "deposit", "purchase", "earning", "withdrawal"
  amount: integer("amount").notNull(), // Amount in cents
  description: text("description").notNull(),
  orderId: varchar("order_id").references(() => orders.id), // If related to an order
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment gateways for wallet transactions
export const paymentGateways = pgTable("payment_gateways", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  type: text("type").notNull(), // 'crypto', 'credit_card', 'bank_transfer', etc.
  isActive: boolean("is_active").notNull().default(true),
  settings: text("settings"), // JSON string for gateway-specific settings
  walletAddress: text("wallet_address"), // Wallet address for crypto payments
  qrCodeImagePath: text("qr_code_image_path"), // Path to QR code image in object storage
  qrEnabled: boolean("qr_enabled").notNull().default(true), // Whether to show QR code to users
  instructions: text("instructions"), // JSON array of instruction steps
  minDepositAmount: integer("min_deposit_amount").notNull().default(500), // Minimum deposit in cents ($5.00)
  maxDepositAmount: integer("max_deposit_amount").notNull().default(100000), // Maximum deposit in cents ($1000.00)
  minWithdrawalAmount: integer("min_withdrawal_amount").notNull().default(500), // Minimum withdrawal in cents ($5.00)
  maxWithdrawalAmount: integer("max_withdrawal_amount").notNull().default(100000), // Maximum withdrawal in cents ($1000.00)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet transactions for top-ups and withdrawals with admin approval
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").unique().notNull(), // Display ID like #TXN-001
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "top_up", "withdrawal"
  amount: integer("amount").notNull(), // Amount in cents
  fee: integer("fee").notNull().default(0), // Processing fee in cents
  status: text("status").notNull().default("processing"), // "processing", "approved", "failed"
  gatewayId: varchar("gateway_id").references(() => paymentGateways.id),
  paymentMethod: text("payment_method"), // For top-ups: "bank_transfer", "card", etc.
  withdrawalMethod: text("withdrawal_method"), // For withdrawals: "bank_account", "paypal", etc.
  txId: text("tx_id"), // User-provided transaction ID for crypto deposits
  adminNote: text("admin_note"), // Admin's note on approval/rejection
  rejectionReason: text("rejection_reason"), // Detailed rejection reason from finance_settings
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed
  processedAt: timestamp("processed_at"), // When admin processed
  approvedBy: text("approved_by"), // Username of employee who approved
  rejectedBy: text("rejected_by"), // Username of employee who rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User deposit sessions table for secure deposit flow
export const userDepositSessions = pgTable("user_deposit_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull().unique(),
  amount: integer("amount").notNull(), // Amount in cents
  walletAddress: varchar("wallet_address").notNull(),
  qrCodeData: text("qr_code_data").notNull(),
  instructions: text("instructions").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral commission tracking
export const refCommissions = pgTable("ref_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // User who made the referral
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id), // User who was referred
  orderId: varchar("order_id").references(() => orders.id), // First order that triggered the commission
  referralAmount: integer("referral_amount").notNull().default(300), // Commission amount in cents (3 USDT = 300 cents)
  status: text("status").notNull().default("pending"), // pending, paid
  referredUserName: text("referred_user_name").notNull(), // Store name for history display
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin support chat messages
export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ticketId: varchar("ticket_id").notNull(), // Groups messages into tickets
  subject: text("subject"), // Only for first message in ticket
  message: text("message").notNull(),
  sender: text("sender").notNull(), // "user" or "admin"
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number").notNull().unique(), // e.g., #T001
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, replied, investigating, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  category: text("category").notNull().default("general"), // general, technical, billing, account
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  closedBy: varchar("closed_by").references(() => users.id),
});

// Support Notifications table for tracking unread ticket updates
export const supportNotifications = pgTable("support_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id),
  type: text("type").notNull(), // "reply", "status_change"
  metadata: text("metadata"), // JSON string for storing additional data like status
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee records for tracking all platform fees (only approved fees)
export const feeRecords = pgTable("fee_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feeType: text("fee_type").notNull(), // "top_up", "withdrawal", "seller_domain_fee"
  username: text("username").notNull(),
  email: text("email").notNull(),
  amount: integer("amount").notNull(), // fee value in cents
  originalAmount: integer("original_amount"), // optional - original transaction amount
  dateTime: timestamp("date_time").defaultNow(), // UTC timestamp
  referenceId: text("reference_id").notNull(), // transaction ID, domain ID, etc.
  status: text("status").notNull().default("success"), // always "success" for approved fees
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rejectionReasons = pgTable("rejection_reasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reasonText: text("reason_text").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin recent activity for persistent activity tracking
export const adminRecentActivity = pgTable("admin_recent_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'signup', 'login', 'transaction', etc.
  data: text("data"), // JSON string containing activity details
  createdAt: timestamp("created_at").defaultNow(),
});

// SMTP system configuration table (sensitive credentials stored in environment variables)
export const smtpSystem = pgTable("smtp_system", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enabled: boolean("enabled").notNull().default(false),
  requireEmailVerification: boolean("require_email_verification").notNull().default(true), // Whether email verification is required after registration
  smtpHost: text("smtp_host"), // SMTP server address (e.g., smtp.gmail.com)
  smtpPort: integer("smtp_port"), // SMTP port (e.g., 587)
  // Note: smtpUser and smtpPass are now stored securely in environment variables SMTP_USER and SMTP_PASS
  fromEmail: text("from_email"), // Sender email
  fromName: text("from_name"), // Sender name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email verification tokens table
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  token: varchar("token").notNull().unique(), // Unique verification token
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  token: varchar("token").notNull().unique(), // Unique reset token
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email reminders tracking table
export const emailReminders = pgTable("email_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "guest_post" or "exchange"
  orderId: varchar("order_id"), // For guest post orders
  exchangeId: varchar("exchange_id"), // For exchanges
  status: text("status").notNull(), // Current status when reminder was sent
  sentBy: varchar("sent_by").notNull().references(() => users.id), // Admin who sent the reminder
  recipientEmails: text("recipient_emails").notNull(), // JSON array of emails sent to
  emailResults: text("email_results"), // JSON object with send results
  createdAt: timestamp("created_at").defaultNow(),
});

// Create base insert schemas with validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
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
  ).optional(),
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
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
    (desc) => !desc || !/[<>\"'&]/.test(desc),
    "Description contains invalid characters"
  ).optional(),
  monthlyTraffic: z.number().min(0).max(5999999, "Monthly traffic must be less than 6,000,000"),
});

export const insertExchangeSchema = createInsertSchema(exchanges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
}).extend({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message must be 2000 characters or less").refine(
    (content) => !/[<>\"'&]/.test(content),
    "Message contains invalid characters"
  ),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  userId: true,
  serviceFee: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  requirements: z.string().max(500, "Requirements must be 500 characters or less").refine(
    (req) => !req || !/[<>\"'&]/.test(req),
    "Requirements contain invalid characters"
  ).optional(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  serviceFee: true,
  sellerAmount: true,
  createdAt: true,
  updatedAt: true,
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
  ).optional(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionId: true,
  createdAt: true,
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  transactionId: true,
  processedBy: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDepositSessionSchema = createInsertSchema(userDepositSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true,
});

// Security validation function for subject (backend)
const sanitizeSubject = (subject: string): string => {
  // Remove HTML tags and special characters
  const cleaned = subject.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
  // Remove URLs (simple pattern)
  const noUrls = cleaned.replace(/(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,})/gi, '');
  // Keep only alphanumeric, spaces, basic punctuation
  const textOnly = noUrls.replace(/[^a-zA-Z0-9\s\.\,\!\?\-]/g, '');
  // Trim and limit to 30 characters
  return textOnly.trim().substring(0, 30);
};

export const insertSupportTicketSchema = createInsertSchema(supportTickets, {
  subject: z.string()
    .min(1, "Subject is required")
    .max(30, "Subject must be 30 characters or less")
    .transform(sanitizeSubject)
    .refine((val) => val.length >= 5, "Subject must be at least 5 characters after sanitization"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  status: z.enum(["open", "replied", "investigating", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["general", "technical", "billing", "account"]),
}).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
  closedBy: true,
});

export const insertSupportNotificationSchema = createInsertSchema(supportNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertRefCommissionSchema = createInsertSchema(refCommissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertSiteCategorySchema = createInsertSchema(siteCategories).omit({
  id: true,
  createdAt: true,
});

export const insertFeeRecordSchema = createInsertSchema(feeRecords).omit({
  id: true,
  createdAt: true,
});

export const insertEmailReminderSchema = createInsertSchema(emailReminders).omit({
  id: true,
  createdAt: true,
});



export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type InsertSiteCategory = z.infer<typeof insertSiteCategorySchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type InsertUserDepositSession = z.infer<typeof insertUserDepositSessionSchema>;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertSupportNotification = z.infer<typeof insertSupportNotificationSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type InsertRefCommission = z.infer<typeof insertRefCommissionSchema>;
export type InsertFeeRecord = z.infer<typeof insertFeeRecordSchema>;
export type InsertSmtpSystem = z.infer<typeof insertSmtpSystemSchema>;
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type InsertEmailReminder = z.infer<typeof insertEmailReminderSchema>;





export type User = typeof users.$inferSelect;
export type Site = typeof sites.$inferSelect;
export type SiteCategory = typeof siteCategories.$inferSelect;
export type Exchange = typeof exchanges.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type UserDepositSession = typeof userDepositSessions.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportNotification = typeof supportNotifications.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type FeeRecord = typeof feeRecords.$inferSelect;
export type RefCommission = typeof refCommissions.$inferSelect;
export type SmtpSystem = typeof smtpSystem.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Finance Settings table for rejection reasons
export const financeSettings = pgTable("finance_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reason: text("reason").notNull(),
  type: text("type").notNull(), // "deposit" or "withdrawal"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFinanceSettingSchema = createInsertSchema(financeSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRejectionReasonSchema = createInsertSchema(rejectionReasons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminRecentActivitySchema = createInsertSchema(adminRecentActivity).omit({
  id: true,
  createdAt: true,
});

export const insertSmtpSystemSchema = createInsertSchema(smtpSystem).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type RejectionReason = typeof rejectionReasons.$inferSelect;
export type AdminRecentActivity = typeof adminRecentActivity.$inferSelect;
export type InsertAdminRecentActivity = typeof insertAdminRecentActivitySchema._type;
export type InsertRejectionReason = z.infer<typeof insertRejectionReasonSchema>;

export type InsertFinanceSetting = z.infer<typeof insertFinanceSettingSchema>;
export type FinanceSetting = typeof financeSettings.$inferSelect;

// Security Login Access table for Anti-DDoS Brute Force protection
export const securityLoginAccess = pgTable("security_login_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull(),
  attemptCount: integer("attempt_count").notNull().default(1),
  lastAttempt: timestamp("last_attempt").defaultNow(),
  lockedUntil: timestamp("locked_until"),
  lastEmail: text("last_email"), // Last email attempted for login from this IP
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSecurityLoginAccessSchema = createInsertSchema(securityLoginAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSecurityLoginAccess = z.infer<typeof insertSecurityLoginAccessSchema>;

// Social Links table for dynamic footer social icons
export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Facebook", "Twitter", "LinkedIn"
  url: text("url").notNull(), // Social media URL
  isActive: boolean("is_active").notNull().default(true), // Controls visibility
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
  createdAt: true,
});

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SecurityLoginAccess = typeof securityLoginAccess.$inferSelect;

// Blacklist tables for admin security management
export const bannedIps = pgTable("banned_ips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull().unique(),
  reason: text("reason"),
  bannedBy: varchar("banned_by").references(() => users.id), // Admin who banned
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bannedEmails = pgTable("banned_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  reason: text("reason"),
  bannedBy: varchar("banned_by").references(() => users.id), // Admin who banned
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSummaryStats = pgTable("user_summary_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalSales: integer("total_sales").notNull().default(0), // Completed guest post orders sold
  totalPurchases: integer("total_purchases").notNull().default(0), // Completed guest post orders purchased  
  totalExchanges: integer("total_exchanges").notNull().default(0), // Completed link exchanges
  activeDomains: integer("active_domains").notNull().default(0), // Approved sites
  walletBalance: integer("wallet_balance").notNull().default(0), // Current wallet balance in cents
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Schema exports for new tables
export const insertBannedIpSchema = createInsertSchema(bannedIps);
export const insertBannedEmailSchema = createInsertSchema(bannedEmails);
export const insertUserSummaryStatsSchema = createInsertSchema(userSummaryStats);

// Type exports for new tables
export type BannedIp = typeof bannedIps.$inferSelect;
export type InsertBannedIp = z.infer<typeof insertBannedIpSchema>;
export type BannedEmail = typeof bannedEmails.$inferSelect;
export type InsertBannedEmail = z.infer<typeof insertBannedEmailSchema>;
export type UserSummaryStats = typeof userSummaryStats.$inferSelect;
export type InsertUserSummaryStats = z.infer<typeof insertUserSummaryStatsSchema>;

// Global notifications table for platform-wide announcements
export const globalNotifications = pgTable("global_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notificationType: varchar("notification_type", { length: 50 }).default("announcement"),
  durationDays: integer("duration_days").default(30),
  flashTime: integer("flash_time").default(10), // Flash interval in seconds
  cycleTime: integer("cycle_time").default(8), // Cycle interval between notifications in seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGlobalNotificationSchema = createInsertSchema(globalNotifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  message: z.string().min(1, "Message is required").max(500, "Message must be 500 characters or less"),
  durationDays: z.number().min(1, "Duration must be at least 1 day").max(365, "Duration cannot exceed 365 days").optional(),
});

// Crypto Transaction ID tracking table
export const cryptoTxIds = pgTable("crypto_txids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  txId: text("tx_id").notNull().unique(), // User-provided transaction ID
  username: text("username").notNull(), // Username who submitted the TxID
  userId: varchar("user_id").notNull().references(() => users.id),
  walletTransactionId: varchar("wallet_transaction_id").notNull().references(() => walletTransactions.id),
  createdAt: timestamp("created_at").defaultNow(), // System time from settings
});

export const insertCryptoTxIdSchema = createInsertSchema(cryptoTxIds).omit({
  id: true,
  createdAt: true,
});

export type GlobalNotification = typeof globalNotifications.$inferSelect;
export type InsertGlobalNotification = z.infer<typeof insertGlobalNotificationSchema>;
export type CryptoTxId = typeof cryptoTxIds.$inferSelect;
export type InsertCryptoTxId = z.infer<typeof insertCryptoTxIdSchema>;

// Session store table for express-session persistence
export const authSessionStore = pgTable("auth_session_store", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export type AuthSessionStore = typeof authSessionStore.$inferSelect;
