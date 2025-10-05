import {
  users,
  sites,
  siteCategories,
  exchanges,
  messages,
  notifications,
  listings,
  wallets,
  orders,
  transactions,
  walletTransactions,
  paymentGateways,
  supportMessages,
  supportTickets,
  supportNotifications,
  settings,
  feeRecords,
  financeSettings,
  userDepositSessions,
  securityLoginAccess,
  rejectionReasons,
  adminRecentActivity,
  bannedIps,
  bannedEmails,
  smtpSystem,
  emailVerificationTokens,
  passwordResetTokens,
  globalNotifications,
  cryptoTxIds,
  socialLinks,
  emailReminders,
  refCommissions,
  authSessionStore,
  type User,
  type Site,
  type SiteCategory,
  type Exchange,
  type Message,
  type Notification,
  type Listing,
  type Wallet,
  type Order,
  type Transaction,
  type WalletTransaction,
  type PaymentGateway,
  type SupportMessage,
  type SupportTicket,
  type SupportNotification,
  type Setting,
  type FeeRecord,
  type FinanceSetting,
  type UserDepositSession,
  type SecurityLoginAccess,
  type RejectionReason,
  type AdminRecentActivity,
  type BannedIp,
  type BannedEmail,
  type SmtpSystem,
  type EmailVerificationToken,
  type PasswordResetToken,
  type GlobalNotification,
  type CryptoTxId,
  type SocialLink,
  type EmailReminder,
  type RefCommission,
  type InsertUser,
  type InsertSite,
  type InsertSiteCategory,
  type InsertExchange,
  type InsertMessage,
  type InsertNotification,
  type InsertListing,
  type InsertWallet,
  type InsertOrder,
  type InsertTransaction,
  type InsertWalletTransaction,
  type InsertPaymentGateway,
  type InsertSupportMessage,
  type InsertSupportTicket,
  type InsertSupportNotification,
  type InsertSetting,
  type InsertFeeRecord,
  type InsertFinanceSetting,
  type InsertUserDepositSession,
  type InsertSecurityLoginAccess,
  type InsertGlobalNotification,
  type InsertRejectionReason,
  type InsertAdminRecentActivity,
  type InsertBannedIp,
  type InsertBannedEmail,
  type InsertSmtpSystem,
  type InsertEmailVerificationToken,
  type InsertPasswordResetToken,
  type InsertEmailReminder,
  type InsertCryptoTxId,
  type InsertSocialLink,
  type InsertRefCommission,
} from "@shared/schema";
import { db } from "./db";
import {
  eq,
  and,
  sql,
  desc,
  or,
  asc,
  gte,
  lte,
  isNull,
  ne,
  ilike,
  count,
  inArray,
  not,
  isNotNull,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  generateTransactionId,
  generateUniqueTransactionId,
} from "./transaction-id-generator";

// Complete storage interface with all backend functionality
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  updateUserBalance(
    userId: string,
    action: "add" | "deduct",
    amount: number,
  ): Promise<boolean>;
  updateUserAvatar(
    userId: string,
    avatarPath: string,
  ): Promise<User | undefined>;

  // Site operations
  getSite(id: string): Promise<Site | undefined>;
  getSiteById(id: string): Promise<Site | undefined>;
  getSitesByUserId(userId: string): Promise<Site[]>;
  getAllSites(): Promise<Site[]>;
  getAllApprovedSites(): Promise<Site[]>;
  createSite(site: InsertSite & { userId: string }): Promise<Site>;
  updateSite(id: string, site: Partial<Site>): Promise<Site | undefined>;
  deleteSite(id: string): Promise<boolean>;
  approveSite(id: string): Promise<Site | undefined>;
  rejectSite(id: string, reason: string): Promise<Site | undefined>;
  incrementSitePurchaseCount(siteId: string): Promise<boolean>;

  // Site Category operations
  getAllSiteCategories(): Promise<SiteCategory[]>;
  getSiteCategory(id: string): Promise<SiteCategory | undefined>;
  createSiteCategory(category: InsertSiteCategory): Promise<SiteCategory>;
  updateSiteCategory(
    id: string,
    category: Partial<SiteCategory>,
  ): Promise<SiteCategory | undefined>;
  deleteSiteCategory(id: string): Promise<boolean>;

  // Exchange operations
  getExchange(id: string): Promise<Exchange | undefined>;
  getExchangeById(id: string): Promise<Exchange | undefined>;
  getExchangesByUserId(userId: string): Promise<Exchange[]>;
  getAllExchanges(): Promise<Exchange[]>;
  getPendingExchanges(): Promise<Site[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchange(
    id: string,
    exchange: Partial<Exchange>,
  ): Promise<Exchange | undefined>;
  acceptExchange(id: string): Promise<Exchange | undefined>;
  declineExchange(id: string): Promise<Exchange | undefined>;
  completeExchange(id: string, userId: string): Promise<Exchange | undefined>;

  // Message operations
  getMessagesByExchangeId(exchangeId: string): Promise<Message[]>;
  getMessagesByOrderId(orderId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Notification operations
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  updateNotification(
    id: string,
    updates: Partial<Notification>,
  ): Promise<Notification | null>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Listing operations
  getAllListings(): Promise<Listing[]>;
  getListingById(id: string): Promise<Listing | undefined>;
  getListingsByUserId(userId: string): Promise<Listing[]>;
  createListing(
    listing: InsertListing & { userId: string; serviceFee: number },
  ): Promise<Listing>;
  updateListing(
    id: string,
    listing: Partial<Listing>,
  ): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<boolean>;

  // Wallet operations
  getWallet(
    userId: string,
  ): Promise<{ balance: number; userId: string } | undefined>;
  createWallet(userId: string): Promise<{ balance: number; userId: string }>;
  updateWalletBalance(
    userId: string,
    amount: number,
  ): Promise<{ balance: number; userId: string }>;
  addFunds(
    userId: string,
    amount: number,
    description: string,
  ): Promise<boolean>;
  deductFunds(
    userId: string,
    amount: number,
    description: string,
  ): Promise<boolean>;

  // Order operations
  getAllOrders(): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrdersByUserId(
    userId: string,
    type?: "buyer" | "seller",
  ): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;

  // Pending activities operations
  getAllPendingActivities(): Promise<any[]>;
  deleteOrderWithRefund(
    orderId: string,
  ): Promise<{ success: boolean; message?: string; refundAmount?: number }>;
  deleteExchange(exchangeId: string): Promise<boolean>;
  acceptOrder(id: string): Promise<Order | undefined>;
  declineOrder(id: string): Promise<Order | undefined>;
  completeOrder(id: string): Promise<Order | undefined>;

  // Transaction operations
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Payment Gateway operations
  getPaymentGateways(): Promise<PaymentGateway[]>;
  getActivePaymentGateways(): Promise<PaymentGateway[]>;
  getPaymentGateway(id: string): Promise<PaymentGateway | undefined>;
  getPaymentGatewayByName(name: string): Promise<PaymentGateway | undefined>;
  createPaymentGateway(gateway: InsertPaymentGateway): Promise<PaymentGateway>;
  updatePaymentGateway(
    id: string,
    updates: Partial<PaymentGateway>,
  ): Promise<PaymentGateway | undefined>;
  updatePaymentGatewayLimits(
    id: string,
    limits: {
      minDepositAmount: number;
      maxDepositAmount: number;
      minWithdrawalAmount: number;
      maxWithdrawalAmount: number;
    },
  ): Promise<PaymentGateway | undefined>;

  // Wallet Transaction operations
  getWalletTransaction(id: string): Promise<WalletTransaction | undefined>;
  getWalletTransactionsByUserId(userId: string): Promise<WalletTransaction[]>;
  getAllWalletTransactions(): Promise<WalletTransaction[]>;
  createWalletTransaction(
    transaction: InsertWalletTransaction,
  ): Promise<WalletTransaction>;
  processWalletTransaction(
    id: string,
    status: string,
    adminId: string,
    adminNote?: string,
    rejectionReason?: string,
  ): Promise<WalletTransaction | undefined>;

  // Support ticket and message operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicketsByUserId(userId: string): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<
    (SupportTicket & {
      user: { firstName: string; lastName: string; email: string };
    })[]
  >;
  updateSupportTicketStatus(
    ticketId: string,
    status: string,
    adminId?: string,
  ): Promise<SupportTicket | null>;
  getSupportMessagesByTicketId(ticketId: string): Promise<SupportMessage[]>;
  getSupportMessagesByUserId(userId: string): Promise<SupportMessage[]>;
  createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Fee Record operations
  getAllFeeRecords(): Promise<FeeRecord[]>;
  getFeeRecordsByUserId(userId: string): Promise<FeeRecord[]>;
  createFeeRecord(feeRecord: InsertFeeRecord): Promise<FeeRecord>;

  // Finance Settings operations
  getAllFinanceSettings(): Promise<FinanceSetting[]>;
  getFinanceSettingsByType(type: string): Promise<FinanceSetting[]>;
  createFinanceSetting(setting: InsertFinanceSetting): Promise<FinanceSetting>;
  updateFinanceSetting(
    id: string,
    updates: Partial<FinanceSetting>,
  ): Promise<FinanceSetting | undefined>;
  deleteFinanceSetting(id: string): Promise<boolean>;

  // Financial operations for admin
  getAllTransactionsWithUsers(): Promise<any[]>;
  getAllWalletTransactionsWithUsers(): Promise<any[]>;
  getWalletTransactionsByStatus(
    status: string,
    type?: string,
  ): Promise<WalletTransaction[]>;
  getWalletTransactionsByType(type: string): Promise<WalletTransaction[]>;

  // Admin analytics
  getAdminStats(): Promise<{
    totalRevenue: number;
    totalUsers: number;
    totalSales: number;
    activeExchange: number;
    pendingPosts: number;
  }>;

  // User Deposit Sessions
  createUserDepositSession(
    session: InsertUserDepositSession,
  ): Promise<UserDepositSession>;
  getUserDepositSessionByUserId(
    userId: string,
  ): Promise<UserDepositSession | undefined>;
  getUserDepositSessionBySessionId(
    sessionId: string,
  ): Promise<UserDepositSession | undefined>;
  updateUserDepositSession(
    id: string,
    session: Partial<UserDepositSession>,
  ): Promise<UserDepositSession | undefined>;
  expireUserDepositSession(id: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<number>;

  // Security login access operations (Anti-DDoS Brute Force protection)
  getSecurityLoginAccess(
    ipAddress: string,
  ): Promise<SecurityLoginAccess | undefined>;
  createSecurityLoginAccess(
    access: InsertSecurityLoginAccess,
  ): Promise<SecurityLoginAccess>;
  updateSecurityLoginAccess(
    ipAddress: string,
    access: Partial<SecurityLoginAccess>,
  ): Promise<SecurityLoginAccess | undefined>;
  getLockedIps(): Promise<SecurityLoginAccess[]>;
  isIpLocked(ipAddress: string): Promise<boolean>;
  clearExpiredLocks(): Promise<void>;
  cleanupExpiredSecurityLockouts(beforeDate: Date): Promise<void>;

  // Rejection Reasons Methods
  getRejectionReasons(): Promise<RejectionReason[]>;
  getActiveRejectionReasons(): Promise<RejectionReason[]>;
  createRejectionReason(
    reason: InsertRejectionReason,
  ): Promise<RejectionReason>;
  updateRejectionReason(
    id: string,
    reason: Partial<RejectionReason>,
  ): Promise<RejectionReason | undefined>;
  deleteRejectionReason(id: string): Promise<boolean>;

  // Admin Recent Activity Methods
  createAdminActivity(
    activity: InsertAdminRecentActivity,
  ): Promise<AdminRecentActivity>;
  getRecentAdminActivity(limit?: number): Promise<AdminRecentActivity[]>;

  // Security management - Banned IPs and Emails
  getAllBannedIPs(): Promise<BannedIp[]>;
  getAllBannedEmails(): Promise<BannedEmail[]>;
  banIP(ipAddress: string, reason: string, bannedBy: string): Promise<BannedIp>;
  banEmail(
    email: string,
    reason: string,
    bannedBy: string,
  ): Promise<BannedEmail>;
  unbanIP(id: string): Promise<boolean>;
  unbanEmail(id: string): Promise<boolean>;
  isIPBanned(ipAddress: string): Promise<boolean>;
  isEmailBanned(email: string): Promise<boolean>;

  // SMTP System operations
  getSmtpConfig(): Promise<SmtpSystem | undefined>;
  updateSmtpConfig(config: InsertSmtpSystem): Promise<SmtpSystem>;
  isSmtpEnabled(): Promise<boolean>;
  isEmailVerificationRequired(): Promise<boolean>;

  // Email Verification operations
  createEmailVerificationToken(
    data: InsertEmailVerificationToken,
  ): Promise<EmailVerificationToken>;
  getEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | undefined>;
  verifyEmailToken(token: string): Promise<boolean>;
  cleanupExpiredVerificationTokens(): Promise<void>;
  markUserEmailVerified(userId: string): Promise<boolean>;

  // Email Reminder operations
  createEmailReminder(data: InsertEmailReminder): Promise<EmailReminder>;
  checkEmailReminderExists(
    type: "guest_post" | "exchange",
    status: string,
    orderId?: string,
    exchangeId?: string,
  ): Promise<boolean>;
  deleteEmailRemindersForOrder(orderId: string): Promise<void>;
  deleteEmailRemindersForExchange(exchangeId: string): Promise<void>;

  // Admin-specific deletion with reminder cleanup
  adminDeletePendingOrder(
    orderId: string,
  ): Promise<{ success: boolean; message?: string; refundAmount?: number }>;
  adminDeletePendingExchange(exchangeId: string): Promise<boolean>;

  // Crypto Transaction ID operations
  createCryptoTxId(data: InsertCryptoTxId): Promise<CryptoTxId>;
  getCryptoTxIdByTxId(txId: string): Promise<CryptoTxId | undefined>;
  getCryptoTxIdsByUserId(userId: string): Promise<CryptoTxId[]>;

  // Social Links operations
  getAllSocialLinks(): Promise<SocialLink[]>;
  getActiveSocialLinks(): Promise<SocialLink[]>;
  getSocialLink(id: string): Promise<SocialLink | undefined>;
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(
    id: string,
    socialLink: Partial<SocialLink>,
  ): Promise<SocialLink | undefined>;
  deleteSocialLink(id: string): Promise<boolean>;

  // Referral Commission operations
  getRefCommissionsByUserId(
    userId: string,
    status?: string,
    page?: number,
    limit?: number,
  ): Promise<{
    referrals: RefCommission[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }>;
  createRefCommission(commission: InsertRefCommission): Promise<RefCommission>;
  updateRefCommissionStatus(
    id: string,
    status: string,
  ): Promise<RefCommission | undefined>;
  getReferralStats(
    userId: string,
  ): Promise<{
    totalEarnings: number;
    referredUserCount: number;
    pendingCount: number;
    paidCount: number;
  }>;
  processReferralCommission(orderId: string, buyerId: string): Promise<boolean>;
  getReferralCommissionAmount(): Promise<number>;
  createReferralRecord(
    referredUserId: string,
    referrerId: string,
    referredUserName: string,
  ): Promise<boolean>;
}

// Database storage implementation with full backend synchronization
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Skip user initialization - users are manually managed
    try {
      // Initialize default site categories (skip if any exist)
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
          { name: "Design", slug: "design" },
        ];

        // Use the safe createSiteCategory method that handles duplicates
        for (const category of defaultCategories) {
          await this.createSiteCategory(category).catch(() => {
            // Silently ignore all errors during initialization
          });
        }
      }

      // Platform fee setting can be configured in admin settings
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // USER OPERATIONS
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Case-insensitive email lookup using ILIKE
      const [user] = await db
        .select()
        .from(users)
        .where(ilike(users.email, email));
      return user;
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      return user;
    } catch (error) {
      return undefined;
    }
  }

  async getAllUsers(): Promise<(User & { wallet?: { balance: number } })[]> {
    try {
      const usersWithWallets = await db
        .select({
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
          walletBalance: wallets.balance,
        })
        .from(users)
        .leftJoin(wallets, eq(users.id, wallets.userId))
        .orderBy(desc(users.createdAt));

      return usersWithWallets.map((user) => ({
        ...user,
        wallet:
          user.walletBalance !== null
            ? { balance: user.walletBalance }
            : undefined,
        walletBalance: undefined, // Remove the flat property
      }));
    } catch (error) {
      console.error("Error fetching users with wallets:", error);
      return [];
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        createdAt: new Date(), // Ensure UTC timestamp
        updatedAt: new Date(),
      })
      .returning();

    // Create wallet for new user
    await this.createWallet(newUser.id);

    return newUser;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ ...user, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      return undefined;
    }
  }

  async updateUserAvatar(
    userId: string,
    avatarPath: string,
  ): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ avatar: avatarPath, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user avatar:", error);
      return undefined;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateUserBalance(
    userId: string,
    action: "add" | "deduct",
    amount: number,
  ): Promise<boolean> {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        await this.createWallet(userId);
      }

      const newBalance =
        action === "add"
          ? (wallet?.balance || 0) + amount
          : (wallet?.balance || 0) - amount;

      if (newBalance < 0) return false;

      await this.updateWalletBalance(userId, newBalance);

      // Create transaction record
      await this.createTransaction({
        userId,
        type: action === "add" ? "deposit" : "withdrawal",
        amount,
        description:
          action === "add"
            ? "Admin balance adjustment"
            : "Admin balance deduction",
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // SITE OPERATIONS
  async getSite(id: string): Promise<Site | undefined> {
    try {
      const [result] = await db
        .select({
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
            updatedAt: users.updatedAt,
          },
        })
        .from(sites)
        .leftJoin(users, eq(sites.userId, users.id))
        .where(eq(sites.id, id));
      return result;
    } catch (error) {
      return undefined;
    }
  }

  async getSiteById(id: string): Promise<Site | undefined> {
    return this.getSite(id);
  }

  async getSitesByUserId(userId: string): Promise<Site[]> {
    try {
      return await db
        .select()
        .from(sites)
        .where(eq(sites.userId, userId))
        .orderBy(desc(sites.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getAllSites(): Promise<Site[]> {
    try {
      const sitesWithUsers = await db
        .select({
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
          ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          ownerUsername: users.username,
        })
        .from(sites)
        .leftJoin(users, eq(sites.userId, users.id))
        .orderBy(desc(sites.createdAt));

      return sitesWithUsers;
    } catch (error) {
      console.error("Error fetching sites:", error);
      return [];
    }
  }

  async getAllApprovedSites(): Promise<Site[]> {
    try {
      const result = await db
        .select({
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
            updatedAt: users.updatedAt,
          },
        })
        .from(sites)
        .leftJoin(users, eq(sites.userId, users.id))
        .where(eq(sites.status, "approved"))
        .orderBy(desc(sites.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching approved sites:", error);
      return [];
    }
  }

  async createSite(site: InsertSite & { userId: string }): Promise<Site> {
    // First, normalize the domain to check for duplicates
    const normalizedDomain = this.normalizeDomain(site.domain);

    // Check if this domain already exists for this user in the same purpose
    const existingSite = await this.checkDomainExistsInSites(
      site.userId,
      normalizedDomain,
      site.purpose,
    );
    if (existingSite) {
      // Get appropriate message based on status and purpose
      const purposeText =
        site.purpose === "sales"
          ? "guest post marketplace"
          : "Exchange program";
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

    // Create the site
    const [newSite] = await db
      .insert(sites)
      .values({
        ...site,
        domain: normalizedDomain,
        updatedAt: new Date(),
      })
      .returning();

    return newSite;
  }

  // Helper method to normalize domain (remove protocol, www, trailing slash)
  private normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^https?:\/\//, "") // Remove protocol
      .replace(/^www\./, "") // Remove www
      .replace(/\/$/, ""); // Remove trailing slash
  }

  // Check if domain already exists for user in sites table with the same purpose
  async checkDomainExistsInSites(
    userId: string,
    domain: string,
    purpose?: string,
  ): Promise<Site | null> {
    try {
      const normalizedDomain = this.normalizeDomain(domain);
      const conditions = [
        eq(sites.userId, userId),
        eq(sites.domain, normalizedDomain),
      ];

      // If purpose is provided, only check within that purpose
      if (purpose) {
        conditions.push(eq(sites.purpose, purpose));
      }

      const [existing] = await db
        .select()
        .from(sites)
        .where(and(...conditions));
      return existing || null;
    } catch (error) {
      return null;
    }
  }

  async updateSite(id: string, site: Partial<Site>): Promise<Site | undefined> {
    try {
      const [updatedSite] = await db
        .update(sites)
        .set({ ...site, updatedAt: new Date() })
        .where(eq(sites.id, id))
        .returning();
      return updatedSite;
    } catch (error) {
      return undefined;
    }
  }

  async incrementSitePurchaseCount(siteId: string): Promise<boolean> {
    try {
      console.log(
        `[PURCHASE COUNT] Incrementing purchase count for site: ${siteId}`,
      );
      const result = await db
        .update(sites)
        .set({
          purchaseCount: sql`${sites.purchaseCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(sites.id, siteId))
        .returning();
      console.log(
        `[PURCHASE COUNT] Updated site ${siteId}, new purchase count: ${result[0]?.purchaseCount}`,
      );
      return true;
    } catch (error) {
      console.error("Error incrementing site purchase count:", error);
      return false;
    }
  }

  async deleteSite(id: string): Promise<boolean> {
    try {
      // First delete related listings
      await db.delete(listings).where(eq(listings.siteId, id));

      // Delete related exchanges (as requester site)
      await db.delete(exchanges).where(eq(exchanges.requesterSiteId, id));

      // Delete related exchanges (as requested site)
      await db.delete(exchanges).where(eq(exchanges.requestedSiteId, id));

      // Finally delete the site
      await db.delete(sites).where(eq(sites.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting site:", error);
      return false;
    }
  }

  async approveSite(
    id: string,
    employeeUsername?: string,
  ): Promise<Site | undefined> {
    try {
      // Get site details first
      const [site] = await db.select().from(sites).where(eq(sites.id, id));
      if (!site) {
        return undefined;
      }

      // Get user details for fee record
      const user = await this.getUser(site.userId);
      if (!user) {
        return undefined;
      }

      // Update site status to approved with tracking info
      const updatedSite = await this.updateSite(id, {
        status: "approved",
        approvedBy: employeeUsername ? `Approved by ${employeeUsername}` : null,
        processedAt: new Date(),
      });

      // Create notification for user about site approval
      await this.createNotification({
        userId: site.userId,
        type: "site_approved",
        title: "Site Approved",
        message: `Your site "${site.domain}" has been approved and is now live on the platform`,
        isRead: false,
        relatedEntityId: site.id,
        section: "sites",
        subTab: "approved",
        priority: "high",
      });

      // Note: Fee record for sales fees will be created when order is completed, not when site is approved

      return updatedSite;
    } catch (error) {
      console.error("Error approving site:", error);
      return undefined;
    }
  }

  async rejectSite(
    id: string,
    reason: string,
    employeeUsername?: string,
  ): Promise<Site | undefined> {
    // Get site details first for notification
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    if (site) {
      // Create notification for user about site rejection
      await this.createNotification({
        userId: site.userId,
        type: "site_rejected",
        title: "Site Rejected",
        message: `Your site "${site.domain}" has been rejected. Reason: ${reason}`,
        isRead: false,
        relatedEntityId: site.id,
        section: "sites",
        subTab: "rejected",
        priority: "high",
      });
    }

    return this.updateSite(id, {
      status: "rejected",
      rejectionReason: reason,
      rejectedBy: employeeUsername ? `Rejected by ${employeeUsername}` : null,
      processedAt: new Date(),
    });
  }

  // SITE CATEGORY OPERATIONS
  async getAllSiteCategories(): Promise<SiteCategory[]> {
    try {
      return await db
        .select()
        .from(siteCategories)
        .orderBy(siteCategories.name);
    } catch (error) {
      return [];
    }
  }

  async getSiteCategory(id: string): Promise<SiteCategory | undefined> {
    try {
      const [category] = await db
        .select()
        .from(siteCategories)
        .where(eq(siteCategories.id, id));
      return category;
    } catch (error) {
      return undefined;
    }
  }

  async createSiteCategory(
    category: InsertSiteCategory,
  ): Promise<SiteCategory> {
    try {
      const [newCategory] = await db
        .insert(siteCategories)
        .values(category)
        .returning();
      return newCategory;
    } catch (error) {
      // Check if category already exists by name
      if (error.code === "23505") {
        // Unique constraint violation
        const existingCategory = await db
          .select()
          .from(siteCategories)
          .where(eq(siteCategories.name, category.name))
          .limit(1);
        if (existingCategory.length > 0) {
          return existingCategory[0];
        }
      }
      throw error;
    }
  }

  async updateSiteCategory(
    id: string,
    category: Partial<SiteCategory>,
  ): Promise<SiteCategory | undefined> {
    try {
      const [updatedCategory] = await db
        .update(siteCategories)
        .set(category)
        .where(eq(siteCategories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      return undefined;
    }
  }

  async deleteSiteCategory(id: string): Promise<boolean> {
    try {
      await db.delete(siteCategories).where(eq(siteCategories.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // EXCHANGE OPERATIONS
  async getExchange(id: string): Promise<Exchange | undefined> {
    try {
      const [exchange] = await db
        .select()
        .from(exchanges)
        .where(eq(exchanges.id, id));
      return exchange;
    } catch (error) {
      return undefined;
    }
  }

  async getExchangeById(id: string): Promise<Exchange | undefined> {
    return this.getExchange(id);
  }

  async getExchangesByUserId(userId: string): Promise<Exchange[]> {
    try {
      return await db
        .select()
        .from(exchanges)
        .where(
          sql`${exchanges.requesterId} = ${userId} OR ${exchanges.requestedUserId} = ${userId}`,
        )
        .orderBy(desc(exchanges.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getAllExchanges(): Promise<Exchange[]> {
    try {
      return await db
        .select()
        .from(exchanges)
        .orderBy(desc(exchanges.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getPendingExchanges(): Promise<Site[]> {
    try {
      return await db
        .select()
        .from(sites)
        .where(and(eq(sites.purpose, "exchange"), eq(sites.status, "pending")))
        .orderBy(desc(sites.createdAt));
    } catch (error) {
      return [];
    }
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const [newExchange] = await db
      .insert(exchanges)
      .values({
        ...exchange,
        updatedAt: new Date(),
      })
      .returning();
    return newExchange;
  }

  async updateExchange(
    id: string,
    exchange: Partial<Exchange>,
  ): Promise<Exchange | undefined> {
    try {
      const [updatedExchange] = await db
        .update(exchanges)
        .set({ ...exchange, updatedAt: new Date() })
        .where(eq(exchanges.id, id))
        .returning();
      return updatedExchange;
    } catch (error) {
      return undefined;
    }
  }

  async acceptExchange(id: string): Promise<Exchange | undefined> {
    return this.updateExchange(id, { status: "active" });
  }

  async declineExchange(id: string): Promise<Exchange | undefined> {
    return this.updateExchange(id, { status: "cancelled" });
  }

  async completeExchange(
    id: string,
    userId: string,
  ): Promise<Exchange | undefined> {
    try {
      const exchange = await this.getExchange(id);
      if (!exchange) return undefined;

      const isRequester = exchange.requesterId === userId;
      const updateData: Partial<Exchange> = isRequester
        ? { requesterCompleted: true }
        : { requestedUserCompleted: true };

      // If both users have completed, mark as completed
      if (
        (isRequester && exchange.requestedUserCompleted) ||
        (!isRequester && exchange.requesterCompleted)
      ) {
        updateData.status = "completed";
      }

      return this.updateExchange(id, updateData);
    } catch (error) {
      return undefined;
    }
  }

  // MESSAGE OPERATIONS
  async getMessagesByExchangeId(exchangeId: string): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.exchangeId, exchangeId))
        .orderBy(messages.createdAt);
    } catch (error) {
      return [];
    }
  }

  async getMessagesByOrderId(orderId: string): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.orderId, orderId))
        .orderBy(messages.createdAt);
    } catch (error) {
      return [];
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        isRead: false, // New messages are unread by default
        createdAt: new Date(), // Ensure UTC timestamp
      })
      .returning();
    return newMessage;
  }

  // Mark messages as read when user opens chat
  async markMessagesAsRead(
    userId: string,
    exchangeId?: string,
    orderId?: string,
  ): Promise<void> {
    try {
      const conditions = [
        ne(messages.senderId, userId), // Don't mark own messages as read
      ];

      if (exchangeId) {
        conditions.push(eq(messages.exchangeId, exchangeId));
      }
      if (orderId) {
        conditions.push(eq(messages.orderId, orderId));
      }

      await db
        .update(messages)
        .set({
          isRead: true,
          readBy: userId,
          readAt: new Date(),
        })
        .where(and(...conditions));
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  // Get unread message count for a user
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Count unread messages where user is not the sender
      const result = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(messages)
        .leftJoin(exchanges, eq(messages.exchangeId, exchanges.id))
        .leftJoin(orders, eq(messages.orderId, orders.id))
        .where(
          and(
            ne(messages.senderId, userId), // Not sent by this user
            eq(messages.isRead, false), // Unread
            or(
              // Messages in exchanges where user is involved
              and(
                isNotNull(messages.exchangeId),
                or(
                  eq(exchanges.requesterId, userId),
                  eq(exchanges.requestedUserId, userId),
                ),
              ),
              // Messages in orders where user is involved
              and(
                isNotNull(messages.orderId),
                or(eq(orders.buyerId, userId), eq(orders.sellerId, userId)),
              ),
            ),
          ),
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting unread message count:", error);
      return 0;
    }
  }

  // NOTIFICATION OPERATIONS
  async getNotification(id: string): Promise<Notification | undefined> {
    try {
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id));
      return notification || undefined;
    } catch (error) {
      console.error("Error fetching notification:", error);
      return undefined;
    }
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      return [];
    }
  }

  async createNotification(
    notification: InsertNotification,
  ): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateNotification(
    id: string,
    updates: Partial<Notification>,
  ): Promise<Notification | null> {
    try {
      const [notification] = await db
        .update(notifications)
        .set(updates)
        .where(eq(notifications.id, id))
        .returning();
      return notification || null;
    } catch (error) {
      console.error("Error updating notification:", error);
      return null;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // LISTING OPERATIONS
  async getAllListings(): Promise<Listing[]> {
    try {
      return await db
        .select()
        .from(listings)
        .where(eq(listings.isActive, true))
        .orderBy(desc(listings.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getListingById(id: string): Promise<Listing | undefined> {
    try {
      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, id));
      return listing;
    } catch (error) {
      return undefined;
    }
  }

  async getListingsByUserId(userId: string): Promise<Listing[]> {
    try {
      return await db
        .select()
        .from(listings)
        .where(eq(listings.userId, userId))
        .orderBy(desc(listings.createdAt));
    } catch (error) {
      return [];
    }
  }

  async createListing(
    listing: InsertListing & { userId: string; serviceFee: number },
  ): Promise<Listing> {
    const [newListing] = await db
      .insert(listings)
      .values({
        ...listing,
        updatedAt: new Date(),
      })
      .returning();
    return newListing;
  }

  async updateListing(
    id: string,
    listing: Partial<Listing>,
  ): Promise<Listing | undefined> {
    try {
      const [updatedListing] = await db
        .update(listings)
        .set({ ...listing, updatedAt: new Date() })
        .where(eq(listings.id, id))
        .returning();
      return updatedListing;
    } catch (error) {
      return undefined;
    }
  }

  async deleteListing(id: string): Promise<boolean> {
    try {
      await db.delete(listings).where(eq(listings.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // WALLET OPERATIONS
  async getWallet(
    userId: string,
  ): Promise<{ balance: number; userId: string } | undefined> {
    try {
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId));
      return wallet
        ? { balance: wallet.balance, userId: wallet.userId }
        : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async createWallet(
    userId: string,
  ): Promise<{ balance: number; userId: string }> {
    const [newWallet] = await db
      .insert(wallets)
      .values({
        userId,
        balance: 0,
        updatedAt: new Date(),
      })
      .returning();
    return { balance: newWallet.balance, userId: newWallet.userId };
  }

  async updateWalletBalance(
    userId: string,
    amount: number,
  ): Promise<{ balance: number; userId: string }> {
    const [updatedWallet] = await db
      .update(wallets)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
      .returning();
    return { balance: updatedWallet.balance, userId: updatedWallet.userId };
  }

  async addFunds(
    userId: string,
    amount: number,
    description: string,
  ): Promise<boolean> {
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
        description,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async deductFunds(
    userId: string,
    amount: number,
    description: string,
  ): Promise<boolean> {
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
        description,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // ORDER OPERATIONS
  async getAllOrders(): Promise<Order[]> {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    try {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.status, "pending"))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      return undefined;
    }
  }

  async getOrdersByUserId(
    userId: string,
    type?: "buyer" | "seller",
  ): Promise<Order[]> {
    try {
      if (type === "buyer") {
        return await db
          .select()
          .from(orders)
          .where(eq(orders.buyerId, userId))
          .orderBy(desc(orders.createdAt));
      } else if (type === "seller") {
        return await db
          .select()
          .from(orders)
          .where(eq(orders.sellerId, userId))
          .orderBy(desc(orders.createdAt));
      } else {
        return await db
          .select()
          .from(orders)
          .where(or(eq(orders.buyerId, userId), eq(orders.sellerId, userId)))
          .orderBy(desc(orders.createdAt));
      }
    } catch (error) {
      console.error("Error fetching orders by user ID:", error);
      return [];
    }
  }

  async createOrder(
    order: InsertOrder & { serviceFee: number; sellerAmount: number },
  ): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(
    id: string,
    order: Partial<Order>,
  ): Promise<Order | undefined> {
    try {
      const [updatedOrder] = await db
        .update(orders)
        .set({ ...order, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();
      return updatedOrder;
    } catch (error) {
      return undefined;
    }
  }

  async acceptOrder(id: string): Promise<Order | undefined> {
    return this.updateOrder(id, { status: "accepted" });
  }

  async declineOrder(id: string): Promise<Order | undefined> {
    return this.updateOrder(id, { status: "cancelled" });
  }

  async completeOrder(id: string): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      if (!order) return undefined;

      const { sellerId, sellerAmount, serviceFee } = order;

      // Transfer funds to seller
      await this.addFunds(sellerId, sellerAmount, `Payment for order ${id}`);

      // Create fee record for successful sales transaction
      if (serviceFee > 0) {
        const seller = await this.getUser(sellerId);
        if (seller) {
          // Generate short ID for seller fee
          const generateShortId = (): string => {
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
            status: "success",
          });
        }
      }

      // Process referral commission if buyer was referred
      try {
        await this.processReferralCommission(id, order.buyerId);
      } catch (referralError) {
        console.error("Error processing referral commission:", referralError);
        // Don't fail the order completion for referral errors
      }

      return this.updateOrder(id, { status: "completed" });
    } catch (error) {
      return undefined;
    }
  }

  // PENDING ACTIVITIES OPERATIONS
  async getAllPendingActivities(): Promise<any[]> {
    try {
      // Create aliases for proper table referencing
      const buyerUsers = alias(users, "buyer");
      const sellerUsers = alias(users, "seller");

      // Get ONLY pending and ongoing orders (not completed or delivered)
      const orderResults = await db
        .select({
          id: orders.id,
          displayId: orders.orderId,
          status: orders.status,
          amount: orders.amount,
          createdAt: orders.createdAt,
          buyerEmail: buyerUsers.email,
          sellerEmail: sellerUsers.email,
          domain: sites.domain,
        })
        .from(orders)
        .leftJoin(buyerUsers, eq(orders.buyerId, buyerUsers.id))
        .leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id))
        .leftJoin(listings, eq(orders.listingId, listings.id))
        .leftJoin(sites, eq(listings.siteId, sites.id))
        .where(
          sql`${orders.status} IN ('pending', 'accepted', 'in_progress', 'on_going')`,
        )
        .orderBy(desc(orders.createdAt));

      // Create aliases for exchange tables
      const requesterUsers = alias(users, "requester");
      const requestedUsers = alias(users, "requested");
      const requesterSites = alias(sites, "requester_site");
      const requestedSites = alias(sites, "requested_site");

      // Get ONLY pending, active, and delivered exchanges (not completed, cancelled, or rejected)
      // 'delivered' status means both parties completed but waiting for admin review
      const exchangeResults = await db
        .select({
          id: exchanges.id,
          displayId: exchanges.orderId,
          status: exchanges.status,
          createdAt: exchanges.createdAt,
          requesterEmail: requesterUsers.email,
          requestedEmail: requestedUsers.email,
          requesterDomain: requesterSites.domain,
          requestedDomain: requestedSites.domain,
        })
        .from(exchanges)
        .leftJoin(requesterUsers, eq(exchanges.requesterId, requesterUsers.id))
        .leftJoin(
          requestedUsers,
          eq(exchanges.requestedUserId, requestedUsers.id),
        )
        .leftJoin(
          requesterSites,
          eq(exchanges.requesterSiteId, requesterSites.id),
        )
        .leftJoin(
          requestedSites,
          eq(exchanges.requestedSiteId, requestedSites.id),
        )
        .where(sql`${exchanges.status} IN ('pending', 'active', 'delivered')`)
        .orderBy(desc(exchanges.createdAt));

      // Combine and format results
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
          domain: order.domain,
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
          exchangeInfo: `${exchange.requesterDomain} ↔ ${exchange.requestedDomain}`,
        })),
      ];

      return activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error fetching pending activities:", error);
      return [];
    }
  }

  // New method for delivered activities
  async getDeliveredActivities(): Promise<any[]> {
    try {
      // Create aliases for proper table referencing
      const buyerUsers = alias(users, "buyer");
      const sellerUsers = alias(users, "seller");

      // Get completed orders
      const orderResults = await db
        .select({
          id: orders.id,
          displayId: orders.orderId,
          status: orders.status,
          amount: orders.amount,
          createdAt: orders.createdAt,
          buyerEmail: buyerUsers.email,
          sellerEmail: sellerUsers.email,
          domain: sites.domain,
        })
        .from(orders)
        .leftJoin(buyerUsers, eq(orders.buyerId, buyerUsers.id))
        .leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id))
        .leftJoin(listings, eq(orders.listingId, listings.id))
        .leftJoin(sites, eq(listings.siteId, sites.id))
        .where(sql`${orders.status} = 'completed'`)
        .orderBy(desc(orders.createdAt));

      // Create aliases for exchange tables
      const requesterUsers = alias(users, "requester");
      const requestedUsers = alias(users, "requested");
      const requesterSites = alias(sites, "requester_site");
      const requestedSites = alias(sites, "requested_site");

      // Get delivered/completed exchanges
      const exchangeResults = await db
        .select({
          id: exchanges.id,
          displayId: exchanges.orderId,
          status: exchanges.status,
          createdAt: exchanges.createdAt,
          requesterEmail: requesterUsers.email,
          requestedEmail: requestedUsers.email,
          requesterDomain: requesterSites.domain,
          requestedDomain: requestedSites.domain,
        })
        .from(exchanges)
        .leftJoin(requesterUsers, eq(exchanges.requesterId, requesterUsers.id))
        .leftJoin(
          requestedUsers,
          eq(exchanges.requestedUserId, requestedUsers.id),
        )
        .leftJoin(
          requesterSites,
          eq(exchanges.requesterSiteId, requesterSites.id),
        )
        .leftJoin(
          requestedSites,
          eq(exchanges.requestedSiteId, requestedSites.id),
        )
        .where(sql`${exchanges.status} IN ('delivered', 'completed')`)
        .orderBy(desc(exchanges.createdAt));

      // Combine and format results
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
          domain: order.domain,
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
          exchangeInfo: `${exchange.requesterDomain} ↔ ${exchange.requestedDomain}`,
        })),
      ];

      return activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error fetching delivered activities:", error);
      return [];
    }
  }

  // New method for rejected activities
  async getRejectedActivities(): Promise<any[]> {
    try {
      // Create aliases for proper table referencing
      const buyerUsers = alias(users, "buyer");
      const sellerUsers = alias(users, "seller");

      // Get rejected/cancelled orders (if any exist)
      const orderResults = await db
        .select({
          id: orders.id,
          displayId: orders.orderId,
          status: orders.status,
          amount: orders.amount,
          createdAt: orders.createdAt,
          buyerEmail: buyerUsers.email,
          sellerEmail: sellerUsers.email,
          domain: sites.domain,
        })
        .from(orders)
        .leftJoin(buyerUsers, eq(orders.buyerId, buyerUsers.id))
        .leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id))
        .leftJoin(listings, eq(orders.listingId, listings.id))
        .leftJoin(sites, eq(listings.siteId, sites.id))
        .where(
          sql`${orders.status} IN ('rejected', 'cancelled', 'declined', 'refunded')`,
        )
        .orderBy(desc(orders.createdAt));

      // Create aliases for exchange tables
      const requesterUsers = alias(users, "requester");
      const requestedUsers = alias(users, "requested");
      const requesterSites = alias(sites, "requester_site");
      const requestedSites = alias(sites, "requested_site");

      // Get rejected/cancelled exchanges
      const exchangeResults = await db
        .select({
          id: exchanges.id,
          displayId: exchanges.orderId,
          status: exchanges.status,
          createdAt: exchanges.createdAt,
          requesterEmail: requesterUsers.email,
          requestedEmail: requestedUsers.email,
          requesterDomain: requesterSites.domain,
          requestedDomain: requestedSites.domain,
        })
        .from(exchanges)
        .leftJoin(requesterUsers, eq(exchanges.requesterId, requesterUsers.id))
        .leftJoin(
          requestedUsers,
          eq(exchanges.requestedUserId, requestedUsers.id),
        )
        .leftJoin(
          requesterSites,
          eq(exchanges.requesterSiteId, requesterSites.id),
        )
        .leftJoin(
          requestedSites,
          eq(exchanges.requestedSiteId, requestedSites.id),
        )
        .where(
          sql`${exchanges.status} IN ('rejected', 'cancelled', 'declined', 'refunded')`,
        )
        .orderBy(desc(exchanges.createdAt));

      // Combine and format results
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
          domain: order.domain,
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
          exchangeInfo: `${exchange.requesterDomain} ↔ ${exchange.requestedDomain}`,
        })),
      ];

      return activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error fetching rejected activities:", error);
      return [];
    }
  }

  async deleteOrderWithRefund(
    orderId: string,
  ): Promise<{ success: boolean; message?: string; refundAmount?: number }> {
    try {
      // Get order details first
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        return { success: false, message: "Order not found" };
      }

      // Only refund if order hasn't been completed
      if (order.status === "completed") {
        return { success: false, message: "Cannot delete completed order" };
      }

      // Delete related transactions first (to avoid foreign key constraint)
      await db.delete(transactions).where(eq(transactions.orderId, orderId));

      // Delete related messages first
      await db.delete(messages).where(eq(messages.orderId, orderId));

      // Refund buyer if they paid (create separate transaction not linked to order)
      if (order.amount > 0) {
        await this.addFunds(
          order.buyerId,
          order.amount,
          `Refund for deleted order #${order.orderId || order.id}`,
        );

        // Record refund transaction (without orderId to avoid foreign key constraint)
        await this.createTransaction({
          userId: order.buyerId,
          type: "refund",
          amount: order.amount,
          description: `Refund for deleted order #${order.orderId || order.id}`,
          // Don't link to orderId since we're deleting the order
        });
      }

      // Delete the order
      await db.delete(orders).where(eq(orders.id, orderId));

      return {
        success: true,
        message: "Order deleted and buyer refunded successfully",
        refundAmount: order.amount,
      };
    } catch (error) {
      console.error("Error deleting order with refund:", error);
      return { success: false, message: "Failed to delete order" };
    }
  }

  async deleteExchange(exchangeId: string): Promise<boolean> {
    try {
      // Delete related messages first
      await db.delete(messages).where(eq(messages.exchangeId, exchangeId));

      // Delete the exchange
      const result = await db
        .delete(exchanges)
        .where(eq(exchanges.id, exchangeId));

      return true;
    } catch (error) {
      console.error("Error deleting exchange:", error);
      return false;
    }
  }

  // TRANSACTION OPERATIONS
  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    try {
      return await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));
    } catch (error) {
      return [];
    }
  }

  async createTransaction(
    transaction: InsertTransaction,
  ): Promise<Transaction> {
    // Generate appropriate transaction ID based on type
    let transactionType: "top_up" | "withdrawal" | "seller_fee";
    if (transaction.type === "deposit") {
      transactionType = "top_up";
    } else if (transaction.type === "withdrawal") {
      transactionType = "withdrawal";
    } else {
      transactionType = "top_up"; // Default for other types like purchase, earning
    }

    const transactionId = generateTransactionId(transactionType);

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        ...transaction,
        transactionId,
        createdAt: new Date(), // Ensure UTC timestamp
      })
      .returning();
    return newTransaction;
  }

  // PAYMENT GATEWAY OPERATIONS
  async getPaymentGateways(): Promise<PaymentGateway[]> {
    try {
      return await db
        .select()
        .from(paymentGateways)
        .orderBy(paymentGateways.name);
    } catch (error) {
      return [];
    }
  }

  async getActivePaymentGateways(): Promise<PaymentGateway[]> {
    try {
      return await db
        .select()
        .from(paymentGateways)
        .where(eq(paymentGateways.isActive, true))
        .orderBy(paymentGateways.name);
    } catch (error) {
      return [];
    }
  }

  async getPaymentGateway(id: string): Promise<PaymentGateway | undefined> {
    try {
      const [gateway] = await db
        .select()
        .from(paymentGateways)
        .where(eq(paymentGateways.id, id));
      return gateway || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getPaymentGatewayByName(
    name: string,
  ): Promise<PaymentGateway | undefined> {
    try {
      const [gateway] = await db
        .select()
        .from(paymentGateways)
        .where(eq(paymentGateways.name, name));
      return gateway || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async updatePaymentGatewayLimits(
    id: string,
    limits: {
      minDepositAmount: number;
      maxDepositAmount: number;
      minWithdrawalAmount: number;
      maxWithdrawalAmount: number;
    },
  ): Promise<PaymentGateway | undefined> {
    try {
      const [gateway] = await db
        .update(paymentGateways)
        .set({
          minDepositAmount: limits.minDepositAmount,
          maxDepositAmount: limits.maxDepositAmount,
          minWithdrawalAmount: limits.minWithdrawalAmount,
          maxWithdrawalAmount: limits.maxWithdrawalAmount,
          updatedAt: new Date(),
        })
        .where(eq(paymentGateways.id, id))
        .returning();
      return gateway || undefined;
    } catch (error) {
      console.error("Error updating payment gateway limits:", error);
      return undefined;
    }
  }

  async createPaymentGateway(
    gateway: InsertPaymentGateway,
  ): Promise<PaymentGateway> {
    const [newGateway] = await db
      .insert(paymentGateways)
      .values({
        ...gateway,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newGateway;
  }

  // WALLET TRANSACTION OPERATIONS
  async getWalletTransaction(
    id: string,
  ): Promise<WalletTransaction | undefined> {
    try {
      const [transaction] = await db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.id, id));
      return transaction || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getWalletTransactionsByUserId(
    userId: string,
  ): Promise<WalletTransaction[]> {
    try {
      return await db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.userId, userId))
        .orderBy(desc(walletTransactions.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getWalletTransactionsByUserIdPaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    try {
      const [transactions, totalResult] = await Promise.all([
        db
          .select()
          .from(walletTransactions)
          .where(eq(walletTransactions.userId, userId))
          .orderBy(desc(walletTransactions.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(walletTransactions)
          .where(eq(walletTransactions.userId, userId)),
      ]);

      return {
        transactions,
        total: totalResult[0]?.count || 0,
      };
    } catch (error) {
      return { transactions: [], total: 0 };
    }
  }

  async getAllWalletTransactions(): Promise<WalletTransaction[]> {
    try {
      return await db
        .select()
        .from(walletTransactions)
        .orderBy(desc(walletTransactions.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getAllWalletTransactionsPaginated(
    limit: number,
    offset: number,
    status?: string,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    try {
      const whereCondition = status
        ? eq(walletTransactions.status, status)
        : undefined;

      const [transactions, totalResult] = await Promise.all([
        db
          .select()
          .from(walletTransactions)
          .where(whereCondition)
          .orderBy(desc(walletTransactions.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(walletTransactions)
          .where(whereCondition),
      ]);

      return {
        transactions,
        total: totalResult[0]?.count || 0,
      };
    } catch (error) {
      return { transactions: [], total: 0 };
    }
  }

  async createWalletTransaction(
    transaction: InsertWalletTransaction,
  ): Promise<WalletTransaction> {
    // Generate unique transaction ID using the proper generator
    const transactionType =
      transaction.type === "top_up" ? "top_up" : "withdrawal";
    const transactionId = generateTransactionId(transactionType);

    const [newTransaction] = await db
      .insert(walletTransactions)
      .values({
        ...transaction,
        transactionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newTransaction;
  }

  async processWalletTransaction(
    id: string,
    status: string,
    adminId: string,
    employeeUsername?: string,
    adminNote?: string,
    rejectionReason?: string,
  ): Promise<WalletTransaction | undefined> {
    try {
      const transaction = await this.getWalletTransaction(id);
      if (!transaction || transaction.status !== "processing") {
        return undefined;
      }

      // Get user details for fee record
      const user = await this.getUser(transaction.userId);
      if (!user) {
        return undefined;
      }

      // Update the transaction status with employee tracking
      const [updatedTransaction] = await db
        .update(walletTransactions)
        .set({
          status,
          processedBy: adminId,
          processedAt: new Date(),
          adminNote: adminNote || null,
          rejectionReason: rejectionReason || null,
          approvedBy: status === "approved" ? adminId : null,
          rejectedBy: status === "failed" ? adminId : null,
          updatedAt: new Date(),
        })
        .where(eq(walletTransactions.id, id))
        .returning();

      // If approved, process the actual wallet update AND create fee record
      if (status === "approved") {
        if (transaction.type === "top_up") {
          // CORRECTED: For top-ups, no funds were deducted on submission, just add the requested amount
          // User submitted $500, they should get exactly $500 added to their balance
          await this.addFunds(
            transaction.userId,
            transaction.amount, // Add only the actual top-up amount requested by user
            `Top-up Successfully Processed: $${transaction.amount.toFixed(2)} credited to wallet`,
          );

          // Create success notification for top-up
          await this.createNotification({
            userId: transaction.userId,
            type: "wallet_topup_approved",
            title: "Top-up Successful",
            message: `Your top-up of $${transaction.amount.toFixed(2)} has been added to your wallet.`,
            isRead: false,
            relatedEntityId: transaction.id,
            section: "wallet",
            subTab: "transactions",
            priority: "normal",
          });

          // Create fee record for top-up fee (only after approval)
          if (transaction.fee > 0) {
            await this.createFeeRecord({
              feeType: "top_up",
              username: user.username,
              email: user.email,
              amount: transaction.fee,
              originalAmount: transaction.amount + transaction.fee,
              referenceId: transaction.transactionId || transaction.id,
              status: "success",
            });
          }
        } else if (transaction.type === "withdrawal") {
          // FUNDS ALREADY DEDUCTED ON SUBMISSION - No need to deduct again on approval
          // Just create the fee record to document the successful processing

          // Create success notification for withdrawal
          await this.createNotification({
            userId: transaction.userId,
            type: "wallet_withdrawal_approved",
            title: "Withdrawal Successful",
            message: `Your withdrawal of $${transaction.amount.toFixed(2)} has been processed.`,
            isRead: false,
            relatedEntityId: transaction.id,
            section: "wallet",
            subTab: "transactions",
            priority: "normal",
          });

          if (transaction.fee > 0) {
            await this.createFeeRecord({
              feeType: "withdrawal",
              username: user.username,
              email: user.email,
              amount: transaction.fee,
              originalAmount: transaction.amount + transaction.fee,
              referenceId: transaction.transactionId || transaction.id,
              status: "success",
            });
          }
        }
      } else if (status === "failed") {
        // REJECTION LOGIC: For top-ups, no refund needed since funds were never deducted
        if (transaction.type === "top_up") {
          // For top-ups: No funds were deducted on submission, so no refund is needed
          // Just record the rejection reason in the transaction (already updated above)
          // No transaction record or fee record needed since no money was involved

          // Create failure notification for top-up
          await this.createNotification({
            userId: transaction.userId,
            type: "wallet_topup_failed",
            title: "Top-up Failed",
            message: `Your top-up of $${transaction.amount.toFixed(2)} was rejected. ${rejectionReason || "Please contact support for more information."}`,
            isRead: false,
            relatedEntityId: transaction.id,
            section: "wallet",
            subTab: "transactions",
            priority: "high",
          });
        } else if (transaction.type === "withdrawal") {
          // For withdrawals: User had amount + fee deducted upfront, refund FULL amount including fee when rejected
          const fullRefundAmount = transaction.amount + transaction.fee;
          await this.addFunds(
            transaction.userId,
            fullRefundAmount,
            `Withdrawal Rejected - Full Refund (including $${transaction.fee.toFixed(2)} processing fee): ${rejectionReason || "No reason provided"}`,
          );

          // Create failure notification for withdrawal
          await this.createNotification({
            userId: transaction.userId,
            type: "wallet_withdrawal_failed",
            title: "Withdrawal Failed",
            message: `Your withdrawal of $${transaction.amount.toFixed(2)} was rejected and fully refunded (including $${transaction.fee.toFixed(2)} processing fee). ${rejectionReason || "Please contact support for more information."}`,
            isRead: false,
            relatedEntityId: transaction.id,
            section: "wallet",
            subTab: "transactions",
            priority: "high",
          });

          // Create rejection refund transaction record
          await this.createTransaction({
            userId: transaction.userId,
            type: "rejection_refund",
            amount: fullRefundAmount,
            description: `Withdrawal rejection full refund for ${transaction.transactionId} - Original amount: $${transaction.amount.toFixed(2)}, Fee refunded: $${transaction.fee.toFixed(2)}, Total refund: $${fullRefundAmount.toFixed(2)}`,
            referenceId: transaction.id,
          });

          // Note: Full refund provided on rejection - no fee records needed as transaction was rejected
        }
      }

      return updatedTransaction;
    } catch (error) {
      console.error("Error processing wallet transaction:", error);
      return undefined;
    }
  }

  // ENHANCED SUPPORT TICKET SYSTEM

  // Utility function to sanitize content and prevent XSS/injection
  private sanitizeContent(content: string): string {
    // Remove HTML tags but keep URLs as plain text
    return (
      content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        // URLs are kept as plain text for support messages
        .replace(/[<>]/g, "") // Remove only dangerous HTML characters
        .trim()
    );
  }

  // Generate unique ticket number
  private async generateTicketNumber(): Promise<string> {
    const count = await db.$count(supportTickets);
    return `#T${(count + 1).toString().padStart(3, "0")}`;
  }

  async createSupportTicket(
    ticket: InsertSupportTicket,
  ): Promise<SupportTicket> {
    // Sanitize input content
    const sanitizedTicket = {
      ...ticket,
      subject: this.sanitizeContent(ticket.subject),
      description: this.sanitizeContent(ticket.description),
    };

    const ticketNumber = await this.generateTicketNumber();

    const [newTicket] = await db
      .insert(supportTickets)
      .values({
        ...sanitizedTicket,
        ticketNumber,
        status: "open",
      })
      .returning();

    return newTicket;
  }

  async getSupportTicketsByUserId(userId: string): Promise<SupportTicket[]> {
    try {
      return await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId))
        .orderBy(desc(supportTickets.createdAt));
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      return [];
    }
  }

  async getAllSupportTickets(): Promise<
    (SupportTicket & {
      user: { firstName: string; lastName: string; email: string };
    })[]
  > {
    try {
      const result = await db
        .select({
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
            email: users.email,
          },
        })
        .from(supportTickets)
        .leftJoin(users, eq(supportTickets.userId, users.id))
        .orderBy(desc(supportTickets.createdAt));

      return result as any;
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      return [];
    }
  }

  async updateSupportTicketStatus(
    ticketId: string,
    status: string,
    adminId?: string,
  ): Promise<SupportTicket | null> {
    try {
      // Get current ticket to check previous status
      const [currentTicket] = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, ticketId));
      if (!currentTicket) {
        return null;
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === "closed") {
        updateData.closedAt = new Date();
        if (adminId) {
          updateData.closedBy = adminId;
        }
      }

      const [updatedTicket] = await db
        .update(supportTickets)
        .set(updateData)
        .where(eq(supportTickets.id, ticketId))
        .returning();

      // Only create notifications for specific status changes and only if it's the first time
      if (updatedTicket && currentTicket.status !== status) {
        const shouldNotify = ["investigating", "resolved", "closed"].includes(
          status,
        );

        if (shouldNotify) {
          // Create notification for status change (simplified - no duplicate check for now)
          try {
            await this.createSupportNotification({
              userId: updatedTicket.userId,
              ticketId: ticketId,
              type: "status_change",
              metadata: JSON.stringify({ status }),
            });
          } catch (notificationError) {
            // Log error but don't fail the status update
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

  async getSupportMessagesByTicketId(
    ticketId: string,
  ): Promise<SupportMessage[]> {
    try {
      return await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, ticketId))
        .orderBy(supportMessages.createdAt);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      return [];
    }
  }

  async getSupportMessagesByUserId(userId: string): Promise<SupportMessage[]> {
    try {
      return await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.userId, userId))
        .orderBy(desc(supportMessages.createdAt));
    } catch (error) {
      return [];
    }
  }

  async createSupportMessage(
    message: InsertSupportMessage,
  ): Promise<SupportMessage> {
    // Sanitize message content
    const sanitizedMessage = {
      ...message,
      message: this.sanitizeContent(message.message),
    };

    const [newMessage] = await db
      .insert(supportMessages)
      .values({
        ...sanitizedMessage,
        createdAt: new Date(), // Ensure UTC timestamp
      })
      .returning();

    // Update ticket status and create notification for admin replies
    if (message.ticketId && message.sender === "admin") {
      // Get ticket to find user first
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, message.ticketId));
      if (ticket) {
        // Update status to 'replied' without notification
        await db
          .update(supportTickets)
          .set({
            status: "replied",
            updatedAt: new Date(),
          })
          .where(eq(supportTickets.id, message.ticketId));

        // Create notification only for the admin reply, not status change
        await this.createSupportNotification({
          userId: ticket.userId,
          ticketId: message.ticketId,
          type: "reply",
        });
      }
    } else if (message.ticketId && message.sender === "user") {
      // User reply - update status to 'open'
      await db
        .update(supportTickets)
        .set({
          status: "open",
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, message.ticketId));
    }

    return newMessage;
  }

  // SUPPORT NOTIFICATION OPERATIONS
  async createSupportNotification(
    notification: InsertSupportNotification,
  ): Promise<SupportNotification> {
    const [newNotification] = await db
      .insert(supportNotifications)
      .values({
        ...notification,
        createdAt: new Date(),
      })
      .returning();
    return newNotification;
  }

  async getSupportNotificationCount(userId: string): Promise<number> {
    try {
      const [result] = await db
        .select({ count: count() })
        .from(supportNotifications)
        .where(
          and(
            eq(supportNotifications.userId, userId),
            eq(supportNotifications.isRead, false),
          ),
        );
      return result?.count || 0;
    } catch (error) {
      console.error("Error getting notification count:", error);
      return 0;
    }
  }

  async markSupportNotificationsAsRead(
    userId: string,
    ticketId: string,
  ): Promise<void> {
    try {
      await db
        .update(supportNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(supportNotifications.userId, userId),
            eq(supportNotifications.ticketId, ticketId),
          ),
        );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }

  async getSupportNotifications(
    userId: string,
  ): Promise<SupportNotification[]> {
    try {
      return await db
        .select()
        .from(supportNotifications)
        .where(eq(supportNotifications.userId, userId))
        .orderBy(desc(supportNotifications.createdAt));
    } catch (error) {
      console.error("Error fetching support notifications:", error);
      return [];
    }
  }

  // SETTINGS OPERATIONS
  async getSetting(key: string): Promise<Setting | undefined> {
    try {
      const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key));
      return setting;
    } catch (error) {
      return undefined;
    }
  }

  async getPlatformName(): Promise<string> {
    try {
      const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "platform_name"));
      return setting?.value || "CollabPro"; // Fallback to default
    } catch (error) {
      return "CollabPro"; // Fallback to default on error
    }
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    try {
      const [existingSetting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, setting.key));

      if (existingSetting) {
        const [updatedSetting] = await db
          .update(settings)
          .set({
            value: setting.value,
            description: setting.description,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, setting.key))
          .returning();
        return updatedSetting;
      } else {
        const [newSetting] = await db
          .insert(settings)
          .values({
            ...setting,
            updatedAt: new Date(),
          })
          .returning();
        return newSetting;
      }
    } catch (error) {
      throw error;
    }
  }

  async getRecentActivity(): Promise<any[]> {
    try {
      // Get recent orders, exchanges, and user registrations
      const [recentOrders, recentExchanges, recentUsers] = await Promise.all([
        db
          .select({
            id: orders.id,
            type: sql<string>`'order'`,
            description: sql<string>`'New order created'`,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .orderBy(desc(orders.createdAt))
          .limit(5),

        db
          .select({
            id: exchanges.id,
            type: sql<string>`'exchange'`,
            description: sql<string>`'New exchange request'`,
            createdAt: exchanges.createdAt,
          })
          .from(exchanges)
          .orderBy(desc(exchanges.createdAt))
          .limit(5),

        db
          .select({
            id: users.id,
            type: sql<string>`'user'`,
            description: sql<string>`'New user registered'`,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.role, "user"))
          .orderBy(desc(users.createdAt))
          .limit(5),
      ]);

      // Combine and sort all activities
      const allActivity = [...recentOrders, ...recentExchanges, ...recentUsers]
        .sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime(),
        )
        .slice(0, 10);

      return allActivity;
    } catch (error) {
      return [];
    }
  }

  async adjustUserBalance(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<any> {
    try {
      // Get user's current wallet
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId));

      if (!wallet) {
        throw new Error("User wallet not found");
      }

      const newBalance = wallet.balance + amount;

      // Update wallet balance
      await db
        .update(wallets)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(wallets.userId, userId));

      // Create transaction record
      const transactionType = amount > 0 ? "deposit" : "withdrawal";
      const transactionId = generateTransactionId(
        amount > 0 ? "top_up" : "withdrawal",
      );
      const [transaction] = await db
        .insert(transactions)
        .values({
          transactionId,
          userId,
          type: transactionType,
          amount: Math.abs(amount),
          description: reason || "Admin balance adjustment",
        })
        .returning();

      return { transaction, newBalance };
    } catch (error) {
      throw new Error("Failed to adjust user balance");
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      const [order] = await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
      return order;
    } catch (error) {
      throw new Error("Failed to update order status");
    }
  }

  async updateSiteApproval(siteId: string, approved: boolean): Promise<any> {
    try {
      const status = approved ? "approved" : "rejected";
      const [site] = await db
        .update(sites)
        .set({ status, updatedAt: new Date() })
        .where(eq(sites.id, siteId))
        .returning();
      return site;
    } catch (error) {
      throw new Error("Failed to update site approval");
    }
  }

  async getPlatformSettings(): Promise<Setting[]> {
    try {
      const allSettings = await db.select().from(settings);
      return allSettings;
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      return [];
    }
  }

  async updatePlatformSettings(settingsData: any): Promise<any> {
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

  async getAllSupportMessages(): Promise<any[]> {
    try {
      const messages = await db
        .select({
          id: supportMessages.id,
          userId: supportMessages.userId,
          message: supportMessages.message,
          sender: supportMessages.sender,
          isRead: supportMessages.isRead,
          createdAt: supportMessages.createdAt,
          userName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
          userEmail: users.email,
        })
        .from(supportMessages)
        .leftJoin(users, eq(supportMessages.userId, users.id))
        .orderBy(desc(supportMessages.createdAt));

      return messages;
    } catch (error) {
      return [];
    }
  }

  // FEE RECORD OPERATIONS
  async getAllFeeRecords(): Promise<FeeRecord[]> {
    try {
      // Get all fee records with successful status - fee records already have their own status field
      // that indicates if the fee was successfully collected
      return await db
        .select()
        .from(feeRecords)
        .where(eq(feeRecords.status, "success"))
        .orderBy(desc(feeRecords.createdAt));
    } catch (error) {
      console.error("Error fetching fee records:", error);
      return [];
    }
  }

  // CRYPTO TXID OPERATIONS
  async getAllCryptoTxIds(): Promise<any[]> {
    try {
      return await db
        .select({
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
          transaction_date: walletTransactions.createdAt,
        })
        .from(cryptoTxIds)
        .leftJoin(users, eq(cryptoTxIds.userId, users.id))
        .leftJoin(
          walletTransactions,
          eq(cryptoTxIds.walletTransactionId, walletTransactions.id),
        )
        .orderBy(desc(cryptoTxIds.createdAt));
    } catch (error) {
      console.error("Error fetching crypto TxIDs:", error);
      return [];
    }
  }

  async getFeeRecordsByUserId(userId: string): Promise<FeeRecord[]> {
    try {
      return await db
        .select()
        .from(feeRecords)
        .where(eq(feeRecords.username, userId)) // Note: fee records use username, not userId
        .orderBy(desc(feeRecords.createdAt));
    } catch (error) {
      return [];
    }
  }

  async createFeeRecord(feeRecord: InsertFeeRecord): Promise<FeeRecord> {
    // Generate appropriate transaction ID based on fee type
    let transactionType: "top_up" | "withdrawal" | "seller_fee";

    if (feeRecord.feeType === "top_up") {
      transactionType = "top_up";
    } else if (feeRecord.feeType === "withdrawal") {
      transactionType = "withdrawal";
    } else {
      transactionType = "seller_fee"; // For seller_domain_fee and other seller fees
    }

    const referenceId = generateTransactionId(transactionType);

    const [newFeeRecord] = await db
      .insert(feeRecords)
      .values({
        ...feeRecord,
        referenceId,
      })
      .returning();
    return newFeeRecord;
  }

  // FINANCIAL OPERATIONS FOR ADMIN
  async getAllTransactionsWithUsers(): Promise<any[]> {
    try {
      return await db
        .select({
          id: transactions.id,
          transactionId:
            sql`COALESCE(${transactions.id}, CONCAT('TXN-', EXTRACT(EPOCH FROM ${transactions.createdAt})::text))`.as(
              "transactionId",
            ),
          userId: transactions.userId,
          type: transactions.type,
          amount: transactions.amount,
          description: transactions.description,
          createdAt: transactions.createdAt,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          },
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .orderBy(desc(transactions.createdAt));
    } catch (error) {
      console.error("Error fetching transactions with users:", error);
      return [];
    }
  }

  async getAllWalletTransactionsWithUsers(): Promise<any[]> {
    try {
      return await db
        .select({
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
            email: users.email,
          },
        })
        .from(walletTransactions)
        .leftJoin(users, eq(walletTransactions.userId, users.id))
        .orderBy(desc(walletTransactions.createdAt));
    } catch (error) {
      console.error(
        "Error fetching all wallet transactions with users:",
        error,
      );
      return [];
    }
  }

  async getWalletTransactionsByStatus(
    status: string,
    type?: string,
  ): Promise<WalletTransaction[]> {
    try {
      const query = db
        .select({
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
          txId: cryptoTxIds.txId, // Include TxID from crypto_tx_ids table
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          },
        })
        .from(walletTransactions)
        .leftJoin(users, eq(walletTransactions.userId, users.id))
        .leftJoin(
          cryptoTxIds,
          eq(walletTransactions.id, cryptoTxIds.walletTransactionId),
        )
        .where(eq(walletTransactions.status, status));

      if (type) {
        const finalQuery = db
          .select({
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
            txId: cryptoTxIds.txId, // Include TxID from crypto_tx_ids table
            user: {
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
            },
          })
          .from(walletTransactions)
          .leftJoin(users, eq(walletTransactions.userId, users.id))
          .leftJoin(
            cryptoTxIds,
            eq(walletTransactions.id, cryptoTxIds.walletTransactionId),
          )
          .where(
            and(
              eq(walletTransactions.status, status),
              eq(walletTransactions.type, type),
            ),
          );
        const result = await finalQuery.orderBy(
          desc(walletTransactions.createdAt),
        );
        return result;
      }

      const result = await query.orderBy(desc(walletTransactions.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching wallet transactions by status:", error);
      return [];
    }
  }

  async getWalletTransactionsByType(
    type: string,
  ): Promise<WalletTransaction[]> {
    try {
      const result = await db
        .select({
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
          processedAt: walletTransactions.processedAt,
        })
        .from(walletTransactions)
        .where(eq(walletTransactions.type, type))
        .orderBy(desc(walletTransactions.createdAt));

      return result.map((item) => ({
        ...item,
        rejectionReason: null,
      }));
    } catch (error) {
      console.error("Error fetching wallet transactions by type:", error);
      return [];
    }
  }

  // ADMIN ANALYTICS
  async getAdminStats(): Promise<{
    totalRevenue: number;
    totalUsers: number;
    totalSales: number;
    totalWalletFees: number;
    totalSalesFees: number;
    activeExchange: number;
    pendingPosts: number;
  }> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          COALESCE((SELECT SUM(amount) FROM fee_records WHERE status = 'success'), 0) as total_platform_fees,
          COALESCE((SELECT SUM(service_fee) FROM orders WHERE status = 'completed'), 0) as total_sales_fees,
          COALESCE((SELECT SUM(fee) FROM wallet_transactions WHERE status = 'approved'), 0) as total_wallet_fees,
          (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
          (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_sales,
          (SELECT COUNT(*) FROM exchanges WHERE status = 'active') as active_exchange,
          (SELECT COUNT(*) FROM sites WHERE status = 'pending') as pending_posts
      `);

      const result = stats.rows[0] as any;
      const totalPlatformFees = parseInt(result.total_platform_fees || "0");
      const totalSalesFees = parseInt(result.total_sales_fees || "0"); // Already in dollars
      const totalWalletFees = parseInt(result.total_wallet_fees || "0"); // Already in dollars

      return {
        totalRevenue: totalSalesFees + totalWalletFees, // Sales fees + wallet fees (both already in dollars)
        totalSales: parseInt(result.total_sales || "0"),
        totalWalletFees: totalWalletFees, // Top-up + withdrawal fees (already in dollars)
        totalSalesFees: totalSalesFees, // Platform fees from completed orders (already in dollars)
        totalUsers: parseInt(result.total_users || "0"),
        activeExchange: parseInt(result.active_exchange || "0"),
        pendingPosts: parseInt(result.pending_posts || "0"),
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
        pendingPosts: 0,
      };
    }
  }

  // Finance Settings operations
  async getAllFinanceSettings(): Promise<FinanceSetting[]> {
    try {
      const settings = await db.select().from(financeSettings);
      return settings;
    } catch (error) {
      console.error("Error fetching finance settings:", error);
      return [];
    }
  }

  async getFinanceSettingsByType(type: string): Promise<FinanceSetting[]> {
    try {
      const settings = await db
        .select()
        .from(financeSettings)
        .where(
          and(
            eq(financeSettings.type, type),
            eq(financeSettings.isActive, true),
          ),
        );
      return settings;
    } catch (error) {
      console.error("Error fetching finance settings by type:", error);
      return [];
    }
  }

  async createFinanceSetting(
    setting: InsertFinanceSetting,
  ): Promise<FinanceSetting> {
    const [newSetting] = await db
      .insert(financeSettings)
      .values({
        ...setting,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newSetting;
  }

  async updateFinanceSetting(
    id: string,
    updates: Partial<FinanceSetting>,
  ): Promise<FinanceSetting | undefined> {
    try {
      const [updatedSetting] = await db
        .update(financeSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(financeSettings.id, id))
        .returning();
      return updatedSetting;
    } catch (error) {
      console.error("Error updating finance setting:", error);
      return undefined;
    }
  }

  async deleteFinanceSetting(id: string): Promise<boolean> {
    try {
      await db.delete(financeSettings).where(eq(financeSettings.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting finance setting:", error);
      return false;
    }
  }

  // Order messaging methods - using existing getMessagesByOrderId method above

  async createOrderMessage(messageData: {
    orderId: string;
    senderId: string;
    content: string;
  }): Promise<any> {
    try {
      const [message] = await db
        .insert(messages)
        .values({
          orderId: messageData.orderId,
          senderId: messageData.senderId,
          content: messageData.content,
        })
        .returning();

      // Get the message with sender info
      const [messageWithSender] = await db
        .select({
          id: messages.id,
          orderId: messages.orderId,
          senderId: messages.senderId,
          content: messages.content,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.id, message.id));

      return messageWithSender;
    } catch (error) {
      console.error("Error creating order message:", error);
      throw error;
    }
  }

  // User Deposit Sessions implementation
  async createUserDepositSession(
    session: InsertUserDepositSession,
  ): Promise<UserDepositSession> {
    const [created] = await db
      .insert(userDepositSessions)
      .values(session)
      .returning();
    return created;
  }

  async getUserDepositSessionByUserId(
    userId: string,
  ): Promise<UserDepositSession | undefined> {
    const [session] = await db
      .select()
      .from(userDepositSessions)
      .where(
        and(
          eq(userDepositSessions.userId, userId),
          eq(userDepositSessions.isActive, true),
          gte(userDepositSessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(userDepositSessions.createdAt))
      .limit(1);
    return session;
  }

  async getUserDepositSessionBySessionId(
    sessionId: string,
  ): Promise<UserDepositSession | undefined> {
    const [session] = await db
      .select()
      .from(userDepositSessions)
      .where(
        and(
          eq(userDepositSessions.sessionId, sessionId),
          eq(userDepositSessions.isActive, true),
          gte(userDepositSessions.expiresAt, new Date()),
        ),
      );
    return session;
  }

  async updateUserDepositSession(
    id: string,
    updates: Partial<UserDepositSession>,
  ): Promise<UserDepositSession | undefined> {
    const [updated] = await db
      .update(userDepositSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userDepositSessions.id, id))
      .returning();
    return updated;
  }

  async expireUserDepositSession(id: string): Promise<boolean> {
    try {
      await db
        .update(userDepositSessions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(userDepositSessions.id, id));
      return true;
    } catch (error) {
      console.error("Error expiring deposit session:", error);
      return false;
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await db
        .update(userDepositSessions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(userDepositSessions.isActive, true),
            lte(userDepositSessions.expiresAt, new Date()),
          ),
        );
      return 0; // Return count - adjust based on your needs
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }

  // Security login access operations (Anti-DDoS Brute Force protection)
  async getSecurityLoginAccess(
    ipAddress: string,
  ): Promise<SecurityLoginAccess | undefined> {
    const [access] = await db
      .select()
      .from(securityLoginAccess)
      .where(eq(securityLoginAccess.ipAddress, ipAddress));
    return access || undefined;
  }

  async createSecurityLoginAccess(
    access: InsertSecurityLoginAccess,
  ): Promise<SecurityLoginAccess> {
    const [newAccess] = await db
      .insert(securityLoginAccess)
      .values(access)
      .returning();
    return newAccess;
  }

  async updateSecurityLoginAccess(
    ipAddress: string,
    access: Partial<SecurityLoginAccess>,
  ): Promise<SecurityLoginAccess | undefined> {
    const [updatedAccess] = await db
      .update(securityLoginAccess)
      .set({ ...access, updatedAt: new Date() })
      .where(eq(securityLoginAccess.ipAddress, ipAddress))
      .returning();
    return updatedAccess || undefined;
  }

  async getLockedIps(): Promise<SecurityLoginAccess[]> {
    const now = new Date();
    return await db
      .select()
      .from(securityLoginAccess)
      .where(
        and(
          gte(securityLoginAccess.lockedUntil, now),
          gte(securityLoginAccess.attemptCount, 3),
        ),
      )
      .orderBy(desc(securityLoginAccess.lastAttempt));
  }

  async isIpLocked(ipAddress: string): Promise<boolean> {
    const access = await this.getSecurityLoginAccess(ipAddress);
    if (!access || !access.lockedUntil) return false;

    const now = new Date();
    return access.attemptCount >= 3 && access.lockedUntil > now;
  }

  async clearExpiredLocks(): Promise<void> {
    const now = new Date();
    await db
      .update(securityLoginAccess)
      .set({
        attemptCount: 0,
        lockedUntil: null,
        updatedAt: now,
      })
      .where(lte(securityLoginAccess.lockedUntil, now));
  }

  async cleanupExpiredSecurityLockouts(beforeDate: Date): Promise<void> {
    try {
      await db
        .update(securityLoginAccess)
        .set({
          attemptCount: 0,
          lockedUntil: null,
          updatedAt: beforeDate,
        })
        .where(lte(securityLoginAccess.lockedUntil, beforeDate));
      console.log(
        `Cleaned up expired lockouts before ${beforeDate.toISOString()}`,
      );
    } catch (error) {
      console.error("Failed to cleanup expired security lockouts:", error);
      throw error;
    }
  }

  // Rejection Reasons Storage Methods
  async getRejectionReasons(): Promise<RejectionReason[]> {
    try {
      return await db
        .select()
        .from(rejectionReasons)
        .orderBy(desc(rejectionReasons.createdAt));
    } catch (error) {
      return [];
    }
  }

  async getActiveRejectionReasons(): Promise<RejectionReason[]> {
    try {
      return await db
        .select()
        .from(rejectionReasons)
        .where(eq(rejectionReasons.isActive, true))
        .orderBy(asc(rejectionReasons.reasonText));
    } catch (error) {
      return [];
    }
  }

  async createRejectionReason(
    reason: InsertRejectionReason,
  ): Promise<RejectionReason> {
    const [newReason] = await db
      .insert(rejectionReasons)
      .values({
        ...reason,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newReason;
  }

  async updateRejectionReason(
    id: string,
    reason: Partial<RejectionReason>,
  ): Promise<RejectionReason | undefined> {
    try {
      const [updated] = await db
        .update(rejectionReasons)
        .set({ ...reason, updatedAt: new Date() })
        .where(eq(rejectionReasons.id, id))
        .returning();
      return updated;
    } catch (error) {
      return undefined;
    }
  }

  async deleteRejectionReason(id: string): Promise<boolean> {
    try {
      await db.delete(rejectionReasons).where(eq(rejectionReasons.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Payment Gateway Management Methods
  async getAllPaymentGateways(): Promise<PaymentGateway[]> {
    try {
      return await db
        .select()
        .from(paymentGateways)
        .orderBy(asc(paymentGateways.displayName));
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      return [];
    }
  }

  async getPaymentGatewayById(id: string): Promise<PaymentGateway | undefined> {
    try {
      const [gateway] = await db
        .select()
        .from(paymentGateways)
        .where(eq(paymentGateways.id, id));
      return gateway;
    } catch (error) {
      console.error("Error fetching payment gateway by ID:", error);
      return undefined;
    }
  }

  async updatePaymentGateway(
    id: string,
    updates: Partial<PaymentGateway>,
  ): Promise<PaymentGateway | undefined> {
    try {
      const [updated] = await db
        .update(paymentGateways)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(paymentGateways.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating payment gateway:", error);
      return undefined;
    }
  }

  // Admin Recent Activity Implementation
  async createAdminActivity(
    activity: InsertAdminRecentActivity,
  ): Promise<AdminRecentActivity> {
    try {
      const [created] = await db
        .insert(adminRecentActivity)
        .values(activity)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating admin activity:", error);
      throw error;
    }
  }

  async getRecentAdminActivity(
    limit: number = 50,
  ): Promise<AdminRecentActivity[]> {
    try {
      return await db
        .select()
        .from(adminRecentActivity)
        .orderBy(desc(adminRecentActivity.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching recent admin activity:", error);
      return [];
    }
  }

  // Security management - Banned IPs and Emails implementation
  async getAllBannedIPs(): Promise<BannedIp[]> {
    try {
      return await db
        .select()
        .from(bannedIps)
        .where(eq(bannedIps.isActive, true))
        .orderBy(desc(bannedIps.createdAt));
    } catch (error) {
      console.error("Error fetching banned IPs:", error);
      return [];
    }
  }

  async getAllBannedEmails(): Promise<BannedEmail[]> {
    try {
      return await db
        .select()
        .from(bannedEmails)
        .where(eq(bannedEmails.isActive, true))
        .orderBy(desc(bannedEmails.createdAt));
    } catch (error) {
      console.error("Error fetching banned emails:", error);
      return [];
    }
  }

  async banIP(
    ipAddress: string,
    reason: string,
    bannedBy: string,
  ): Promise<BannedIp> {
    // Check if IP is already banned
    const existingBan = await this.isIPBanned(ipAddress);
    if (existingBan) {
      throw new Error(`IP address ${ipAddress} is already banned`);
    }

    const [bannedIp] = await db
      .insert(bannedIps)
      .values({
        ipAddress,
        reason,
        bannedBy,
        isActive: true,
      })
      .returning();
    return bannedIp;
  }

  async banEmail(
    email: string,
    reason: string,
    bannedBy: string,
  ): Promise<BannedEmail> {
    // Check if email is already banned
    const existingBan = await this.isEmailBanned(email);
    if (existingBan) {
      throw new Error(`Email address ${email} is already banned`);
    }

    const [bannedEmail] = await db
      .insert(bannedEmails)
      .values({
        email,
        reason,
        bannedBy,
        isActive: true,
      })
      .returning();
    return bannedEmail;
  }

  async unbanIP(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(bannedIps)
        .where(eq(bannedIps.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      console.error("Error unbanning IP:", error);
      return false;
    }
  }

  async unbanEmail(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(bannedEmails)
        .where(eq(bannedEmails.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      console.error("Error unbanning email:", error);
      return false;
    }
  }

  async isIPBanned(ipAddress: string): Promise<boolean> {
    try {
      const [banned] = await db
        .select()
        .from(bannedIps)
        .where(
          and(eq(bannedIps.ipAddress, ipAddress), eq(bannedIps.isActive, true)),
        );
      return !!banned;
    } catch (error) {
      console.error("Error checking if IP is banned:", error);
      return false;
    }
  }

  async isEmailBanned(email: string): Promise<boolean> {
    try {
      // Case-insensitive email lookup using ILIKE
      const [banned] = await db
        .select()
        .from(bannedEmails)
        .where(
          and(
            ilike(bannedEmails.email, email),
            eq(bannedEmails.isActive, true),
          ),
        );
      return !!banned;
    } catch (error) {
      console.error("Error checking if email is banned:", error);
      return false;
    }
  }

  // Terminate all sessions for a banned email
  async terminateSessionsByEmail(email: string): Promise<void> {
    try {
      // Query the session table directly using raw SQL to find and delete sessions
      // The session table stores user data in the sess JSON column
      await db.execute(sql`
        DELETE FROM auth_session_store 
        WHERE sess::jsonb -> 'user' ->> 'email' ILIKE ${email}
      `);
      console.log(`Terminated sessions for banned email: ${email}`);
    } catch (error) {
      console.error("Error terminating sessions by email:", error);
    }
  }

  // Terminate all sessions for a banned IP  
  async terminateSessionsByIP(ipAddress: string): Promise<void> {
    try {
      // Log for now - IP-based session termination would require additional session tracking
      console.log(`IP ${ipAddress} banned - new logins from this IP will be blocked`);
    } catch (error) {
      console.error("Error terminating sessions by IP:", error);
    }
  }

  // SMTP System operations
  async getSmtpConfig(): Promise<SmtpSystem | undefined> {
    try {
      const [config] = await db.select().from(smtpSystem).limit(1);
      return config;
    } catch (error) {
      console.error("Error getting SMTP config:", error);
      return undefined;
    }
  }

  async updateSmtpConfig(config: InsertSmtpSystem): Promise<SmtpSystem> {
    try {
      // First try to get existing config
      const existing = await this.getSmtpConfig();

      if (existing) {
        // Update existing config
        const [updated] = await db
          .update(smtpSystem)
          .set({ ...config, updatedAt: new Date() })
          .where(eq(smtpSystem.id, existing.id))
          .returning();
        return updated;
      } else {
        // Create new config
        const [created] = await db
          .insert(smtpSystem)
          .values(config)
          .returning();
        return created;
      }
    } catch (error) {
      console.error("Error updating SMTP config:", error);
      throw error;
    }
  }

  async updateSmtpEmailVerificationSetting(
    requireVerification: boolean,
  ): Promise<void> {
    try {
      // Get existing config or create default one
      let existing = await this.getSmtpConfig();

      if (existing) {
        // Update existing config
        await db
          .update(smtpSystem)
          .set({
            requireEmailVerification: requireVerification,
            updatedAt: new Date(),
          })
          .where(eq(smtpSystem.id, existing.id));
      } else {
        // Create new config with default values
        await db.insert(smtpSystem).values({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: "",
          password: "",
          enabled: false,
          requireEmailVerification: requireVerification,
        });
      }
    } catch (error) {
      console.error("Error updating SMTP email verification setting:", error);
      throw error;
    }
  }

  async isSmtpEnabled(): Promise<boolean> {
    try {
      const config = await this.getSmtpConfig();
      return config?.enabled || false;
    } catch (error) {
      console.error("Error checking SMTP status:", error);
      return false;
    }
  }

  async isEmailVerificationRequired(): Promise<boolean> {
    try {
      const config = await this.getSmtpConfig();
      return config?.requireEmailVerification ?? true; // Default to true if not set
    } catch (error) {
      console.error("Error checking email verification requirement:", error);
      return true; // Default to requiring verification for security
    }
  }

  // Email Verification operations
  async createEmailVerificationToken(
    data: InsertEmailVerificationToken,
  ): Promise<EmailVerificationToken> {
    try {
      // First, delete any existing tokens for this user to ensure clean state
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, data.userId));

      const [created] = await db
        .insert(emailVerificationTokens)
        .values(data)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating email verification token:", error);
      throw error;
    }
  }

  async getLatestVerificationTokenForUser(
    userId: string,
  ): Promise<EmailVerificationToken | undefined> {
    try {
      const [token] = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, userId))
        .orderBy(desc(emailVerificationTokens.createdAt))
        .limit(1);

      return token || undefined;
    } catch (error) {
      console.error("Error getting latest verification token:", error);
      return undefined;
    }
  }

  async getEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | undefined> {
    try {
      const [verificationToken] = await db
        .select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            gte(emailVerificationTokens.expiresAt, new Date()),
          ),
        );
      return verificationToken;
    } catch (error) {
      console.error("Error getting email verification token:", error);
      return undefined;
    }
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    try {
      const verificationToken = await this.getEmailVerificationToken(token);

      if (!verificationToken) {
        return false;
      }

      // Delete the token instead of marking as used
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, verificationToken.id));

      // Mark user email as verified
      await this.markUserEmailVerified(verificationToken.userId);

      return true;
    } catch (error) {
      console.error("Error verifying email token:", error);
      return false;
    }
  }

  async cleanupExpiredVerificationTokens(): Promise<void> {
    try {
      await db
        .delete(emailVerificationTokens)
        .where(
          or(
            eq(emailVerificationTokens.isUsed, true),
            lte(emailVerificationTokens.expiresAt, new Date()),
          ),
        );
    } catch (error) {
      console.error("Error cleaning up expired verification tokens:", error);
    }
  }

  // Password Reset Token methods
  async createPasswordResetToken(
    data: InsertPasswordResetToken,
  ): Promise<PasswordResetToken> {
    try {
      // First, delete any existing tokens for this user to ensure clean state
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, data.userId));

      const [created] = await db
        .insert(passwordResetTokens)
        .values(data)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating password reset token:", error);
      throw error;
    }
  }

  async getPasswordResetToken(
    token: string,
  ): Promise<PasswordResetToken | undefined> {
    try {
      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.isUsed, false),
            gte(passwordResetTokens.expiresAt, new Date()),
          ),
        );
      return resetToken;
    } catch (error) {
      console.error("Error getting password reset token:", error);
      return undefined;
    }
  }

  async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    try {
      await db
        .update(passwordResetTokens)
        .set({ isUsed: true })
        .where(eq(passwordResetTokens.id, tokenId));
    } catch (error) {
      console.error("Error marking password reset token as used:", error);
      throw error;
    }
  }

  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    try {
      await db
        .delete(passwordResetTokens)
        .where(
          or(
            eq(passwordResetTokens.isUsed, true),
            lte(passwordResetTokens.expiresAt, new Date()),
          ),
        );
    } catch (error) {
      console.error("Error cleaning up expired password reset tokens:", error);
    }
  }

  async markUserEmailVerified(userId: string): Promise<boolean> {
    try {
      const [updated] = await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, userId))
        .returning();
      return !!updated;
    } catch (error) {
      console.error("Error marking user email as verified:", error);
      return false;
    }
  }

  // Email Reminder operations
  async createEmailReminder(data: InsertEmailReminder): Promise<EmailReminder> {
    try {
      const [created] = await db
        .insert(emailReminders)
        .values(data)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating email reminder:", error);
      throw error;
    }
  }

  async checkEmailReminderExists(
    type: "guest_post" | "exchange",
    status: string,
    orderId?: string,
    exchangeId?: string,
  ): Promise<boolean> {
    try {
      let conditions = [
        eq(emailReminders.type, type),
        eq(emailReminders.status, status),
      ];

      if (type === "guest_post" && orderId) {
        conditions.push(eq(emailReminders.orderId, orderId));
      } else if (type === "exchange" && exchangeId) {
        conditions.push(eq(emailReminders.exchangeId, exchangeId));
      }

      const [reminder] = await db
        .select()
        .from(emailReminders)
        .where(and(...conditions))
        .limit(1);

      return !!reminder;
    } catch (error) {
      console.error("Error checking email reminder existence:", error);
      return false;
    }
  }

  async deleteEmailRemindersForOrder(orderId: string): Promise<void> {
    try {
      await db
        .delete(emailReminders)
        .where(eq(emailReminders.orderId, orderId));
    } catch (error) {
      console.error("Error deleting email reminders for order:", error);
      // Don't throw - this is cleanup, shouldn't block main deletion
    }
  }

  async deleteEmailRemindersForExchange(exchangeId: string): Promise<void> {
    try {
      await db
        .delete(emailReminders)
        .where(eq(emailReminders.exchangeId, exchangeId));
    } catch (error) {
      console.error("Error deleting email reminders for exchange:", error);
      // Don't throw - this is cleanup, shouldn't block main deletion
    }
  }

  // Admin-specific deletion functions with reminder cleanup
  async adminDeletePendingOrder(
    orderId: string,
  ): Promise<{ success: boolean; message?: string; refundAmount?: number }> {
    try {
      // Clean up email reminders for this order first
      await this.deleteEmailRemindersForOrder(orderId);

      // Then call the regular delete function
      return await this.deleteOrderWithRefund(orderId);
    } catch (error) {
      console.error("Error in admin delete pending order:", error);
      return { success: false, message: "Failed to delete order" };
    }
  }

  async adminDeletePendingExchange(exchangeId: string): Promise<boolean> {
    try {
      // Clean up email reminders for this exchange first
      await this.deleteEmailRemindersForExchange(exchangeId);

      // Then call the regular delete function
      return await this.deleteExchange(exchangeId);
    } catch (error) {
      console.error("Error in admin delete pending exchange:", error);
      return false;
    }
  }

  // Global Notifications operations
  async getActiveGlobalNotifications(): Promise<GlobalNotification[]> {
    try {
      // Get all active notifications first
      const notifications = await db
        .select()
        .from(globalNotifications)
        .where(eq(globalNotifications.isActive, true))
        .orderBy(desc(globalNotifications.createdAt));

      // Get system timezone from settings
      const appTimezoneSetting = await this.getSetting("appTimezone");
      const systemTimezone = appTimezoneSetting?.value || "UTC";

      // Filter out expired notifications based on system timezone
      const now = new Date();
      const activeNotifications = notifications.filter((notification) => {
        if (!notification.durationDays) return true; // No expiry if no duration

        const createdAt = new Date(notification.createdAt);
        const expiryDate = new Date(
          createdAt.getTime() + notification.durationDays * 24 * 60 * 60 * 1000,
        );

        // Compare times in system timezone
        const nowInSystemTZ = new Date(
          now.toLocaleString("en-US", { timeZone: systemTimezone }),
        );
        const expiryInSystemTZ = new Date(
          expiryDate.toLocaleString("en-US", { timeZone: systemTimezone }),
        );

        return nowInSystemTZ <= expiryInSystemTZ;
      });

      return activeNotifications;
    } catch (error) {
      console.error("Error fetching active global notifications:", error);
      return [];
    }
  }

  async getAllGlobalNotifications(): Promise<GlobalNotification[]> {
    try {
      const notifications = await db
        .select()
        .from(globalNotifications)
        .orderBy(desc(globalNotifications.createdAt));
      return notifications;
    } catch (error) {
      console.error("Error fetching all global notifications:", error);
      return [];
    }
  }

  async createGlobalNotification(
    data: InsertGlobalNotification,
  ): Promise<GlobalNotification> {
    try {
      const [created] = await db
        .insert(globalNotifications)
        .values(data)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating global notification:", error);
      throw error;
    }
  }

  async updateGlobalNotification(
    id: string,
    data: Partial<InsertGlobalNotification>,
  ): Promise<GlobalNotification | undefined> {
    try {
      const [updated] = await db
        .update(globalNotifications)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(globalNotifications.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating global notification:", error);
      throw error;
    }
  }

  async deleteGlobalNotification(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(globalNotifications)
        .where(eq(globalNotifications.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      console.error("Error deleting global notification:", error);
      return false;
    }
  }

  // CRYPTO TRANSACTION ID OPERATIONS
  async createCryptoTxId(data: InsertCryptoTxId): Promise<CryptoTxId> {
    try {
      const [created] = await db.insert(cryptoTxIds).values(data).returning();
      return created;
    } catch (error) {
      console.error("Error creating crypto TxID:", error);
      throw error;
    }
  }

  async getCryptoTxIdByTxId(txId: string): Promise<CryptoTxId | undefined> {
    try {
      const [record] = await db
        .select()
        .from(cryptoTxIds)
        .where(eq(cryptoTxIds.txId, txId));
      return record || undefined;
    } catch (error) {
      console.error("Error fetching crypto TxID by txId:", error);
      return undefined;
    }
  }

  async getCryptoTxIdsByUserId(userId: string): Promise<CryptoTxId[]> {
    try {
      const records = await db
        .select()
        .from(cryptoTxIds)
        .where(eq(cryptoTxIds.userId, userId))
        .orderBy(desc(cryptoTxIds.createdAt));
      return records;
    } catch (error) {
      console.error("Error fetching crypto TxIDs by userId:", error);
      return [];
    }
  }

  // SOCIAL LINKS OPERATIONS
  async getAllSocialLinks(): Promise<SocialLink[]> {
    try {
      return await db.select().from(socialLinks).orderBy(asc(socialLinks.name));
    } catch (error) {
      console.error("Error getting all social links:", error);
      return [];
    }
  }

  async getActiveSocialLinks(): Promise<SocialLink[]> {
    try {
      return await db
        .select()
        .from(socialLinks)
        .where(eq(socialLinks.isActive, true))
        .orderBy(asc(socialLinks.name));
    } catch (error) {
      console.error("Error getting active social links:", error);
      return [];
    }
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    try {
      const [link] = await db
        .select()
        .from(socialLinks)
        .where(eq(socialLinks.id, id));
      return link || undefined;
    } catch (error) {
      console.error("Error getting social link:", error);
      return undefined;
    }
  }

  async createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink> {
    try {
      const [newLink] = await db
        .insert(socialLinks)
        .values({
          ...socialLink,
          createdAt: new Date(),
        })
        .returning();
      return newLink;
    } catch (error) {
      console.error("Error creating social link:", error);
      throw error;
    }
  }

  async updateSocialLink(
    id: string,
    socialLink: Partial<SocialLink>,
  ): Promise<SocialLink | undefined> {
    try {
      const [updated] = await db
        .update(socialLinks)
        .set(socialLink)
        .where(eq(socialLinks.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating social link:", error);
      return undefined;
    }
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    try {
      await db.delete(socialLinks).where(eq(socialLinks.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting social link:", error);
      return false;
    }
  }

  // REFERRAL COMMISSION OPERATIONS
  async getRefCommissionsByUserId(
    userId: string,
    status: string = "pending",
    page: number = 1,
    limit: number = 5,
  ): Promise<{
    referrals: RefCommission[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }> {
    try {
      // Count total records with status filter
      const totalQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(refCommissions)
        .where(
          and(
            eq(refCommissions.referrerId, userId),
            eq(refCommissions.status, status),
          ),
        );

      const total = totalQuery[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get paginated results
      const referrals = await db
        .select()
        .from(refCommissions)
        .where(
          and(
            eq(refCommissions.referrerId, userId),
            eq(refCommissions.status, status),
          ),
        )
        .orderBy(desc(refCommissions.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        referrals,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error getting referral commissions:", error);
      return {
        referrals: [],
        pagination: { total: 0, totalPages: 0, currentPage: page, limit },
      };
    }
  }

  async createRefCommission(
    commission: InsertRefCommission,
  ): Promise<RefCommission> {
    try {
      const [newCommission] = await db
        .insert(refCommissions)
        .values({
          ...commission,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newCommission;
    } catch (error) {
      console.error("Error creating referral commission:", error);
      throw error;
    }
  }

  async updateRefCommissionStatus(
    id: string,
    status: string,
  ): Promise<RefCommission | undefined> {
    try {
      const [updated] = await db
        .update(refCommissions)
        .set({ status, updatedAt: new Date() })
        .where(eq(refCommissions.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating referral commission status:", error);
      return undefined;
    }
  }

  async getReferralStats(
    userId: string,
  ): Promise<{
    totalEarnings: number;
    referredUserCount: number;
    pendingCount: number;
    paidCount: number;
  }> {
    try {
      const commissions = await db
        .select()
        .from(refCommissions)
        .where(eq(refCommissions.referrerId, userId));

      const totalEarnings = commissions.reduce((sum, commission) => {
        return (
          sum + (commission.status === "paid" ? commission.referralAmount : 0)
        );
      }, 0);

      const referredUserCount = commissions.length;
      const pendingCount = commissions.filter(
        (c) => c.status === "pending",
      ).length;
      const paidCount = commissions.filter((c) => c.status === "paid").length;

      return { totalEarnings, referredUserCount, pendingCount, paidCount };
    } catch (error) {
      console.error("Error getting referral stats:", error);
      return {
        totalEarnings: 0,
        referredUserCount: 0,
        pendingCount: 0,
        paidCount: 0,
      };
    }
  }

  // Get referral commission amount from settings
  async getReferralCommissionAmount(): Promise<number> {
    try {
      const setting = await this.getSetting("Referral_Commission");
      return setting ? parseFloat(setting.value) : 3; // Default 3 USDT in dollars
    } catch (error) {
      console.error("Error getting referral commission amount:", error);
      return 3; // Default fallback in dollars
    }
  }

  // Secure method to process referral commission on first order completion
  async processReferralCommission(
    orderId: string,
    buyerId: string,
  ): Promise<boolean> {
    try {
      // Check if buyer was referred by someone
      const buyer = await this.getUser(buyerId);
      if (!buyer || !buyer.referredBy) {
        console.log(`Buyer ${buyerId} not found or not referred by anyone`);
        return false;
      }

      // Check if there's already a pending commission for this referral
      const existingCommissions = await db
        .select()
        .from(refCommissions)
        .where(
          and(
            eq(refCommissions.referrerId, buyer.referredBy),
            eq(refCommissions.referredUserId, buyerId),
          ),
        );

      if (existingCommissions.length === 0) {
        console.log(`No referral commission record found for buyer ${buyerId}`);
        return false;
      }

      // Find pending commission for this user
      const pendingCommission = existingCommissions.find(
        (c) => c.status === "pending",
      );
      if (!pendingCommission) {
        console.log(
          `No pending referral commission found for buyer ${buyerId}`,
        );
        return false;
      }

      // Check if this is buyer's first completed order (should only be 1 - the current one)
      const completedOrders = await db
        .select()
        .from(orders)
        .where(
          and(eq(orders.buyerId, buyerId), eq(orders.status, "completed")),
        );

      if (completedOrders.length > 1) {
        console.log(
          `Buyer ${buyerId} has already completed ${completedOrders.length} orders, referral commission not applicable`,
        );
        return false;
      }

      // Get commission amount from settings
      const commissionAmount = await this.getReferralCommissionAmount();

      // Update the commission record to paid and link to this order
      await db
        .update(refCommissions)
        .set({
          status: "paid",
          orderId: orderId,
          referralAmount: commissionAmount,
          updatedAt: new Date(),
        })
        .where(eq(refCommissions.id, pendingCommission.id));

      // Add commission to referrer's wallet balance
      await this.addFunds(
        buyer.referredBy,
        commissionAmount,
        `Referral commission for ${buyer.username}'s first order`,
      );

      console.log(
        `Referral commission of $${commissionAmount} processed for referrer ${buyer.referredBy}`,
      );
      return true;
    } catch (error) {
      console.error("Error processing referral commission:", error);
      return false;
    }
  }

  // Create referral commission record when user registers with referral
  async createReferralRecord(
    referredUserId: string,
    referrerId: string,
    referredUserName: string,
  ): Promise<boolean> {
    try {
      // Check if commission record already exists
      const existing = await db
        .select()
        .from(refCommissions)
        .where(
          and(
            eq(refCommissions.referrerId, referrerId),
            eq(refCommissions.referredUserId, referredUserId),
          ),
        );

      if (existing.length > 0) {
        console.log(
          `Referral commission record already exists for user ${referredUserId}`,
        );
        return false;
      }

      // Get commission amount from settings
      const commissionAmount = await this.getReferralCommissionAmount();

      // Create pending commission record
      await this.createRefCommission({
        referrerId,
        referredUserId,
        referralAmount: commissionAmount,
        status: "pending",
        referredUserName,
      });

      console.log(
        `Referral commission record created for ${referredUserName} referred by ${referrerId}`,
      );
      return true;
    } catch (error) {
      console.error("Error creating referral record:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
