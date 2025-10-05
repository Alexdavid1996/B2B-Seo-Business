export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteWithUser {
  id: string;
  userId: string;
  domain: string;
  title: string;
  description?: string;
  category: string;
  domainAuthority: number;
  drScore: number;
  monthlyTraffic: number;
  language: string;
  purpose: 'exchange' | 'sales' | 'both';
  linkType: 'dofollow' | 'nofollow';
  casinoAllowed?: string;
  price?: number;
  deliveryTime?: number;
  purchaseCount?: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ExchangeWithDetails {
  id: string;
  requesterId: string;
  requestedUserId: string;
  requesterSiteId: string;
  requestedSiteId: string;
  status: 'pending' | 'active' | 'delivered' | 'completed' | 'cancelled' | 'rejected';
  message?: string;
  deliveryUrl?: string;
  requesterCompleted: boolean;
  requestedUserCompleted: boolean;
  deliveredBy?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  requesterSite?: SiteWithUser;
  requestedSite?: SiteWithUser;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  requestedUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MessageWithSender {
  id: string;
  exchangeId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'exchange_request' | 'exchange_accepted' | 'exchange_denied' | 'exchange_cancelled' | 'message' | 'exchange_pending' | 'exchange_completed' | 'order_received' | 'order_created' | 'order_completed' | 'order_cancelled' | 'order_refunded';
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  section?: 'exchange' | 'guest_post';
  subTab?: 'ongoing' | 'completed' | 'declined';
  priority?: 'normal' | 'high' | 'urgent';
  createdAt: Date;
}

// Marketplace types
export interface ListingData {
  id: string;
  userId: string;
  siteId: string;
  type: 'guest_post' | 'link_placement';
  price: number; // In cents
  serviceFee: number; // In cents
  isActive: boolean;
  requirements?: string;
  turnaroundTime?: number; // Days
  createdAt: Date;
  updatedAt: Date;
  site?: SiteWithUser;
}

export interface WalletData {
  id: string;
  userId: string;
  balance: number; // In cents
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderData {
  id: string;
  orderId: string; // Order number like #ORDER-001
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number; // Total amount in cents
  serviceFee: number; // Platform fee in cents
  sellerAmount: number; // Amount seller receives in cents
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  requirements?: string;
  googleDocLink?: string;
  targetLink?: string;
  deliveryUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  listing?: ListingData;
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TransactionData {
  id: string;
  userId: string;
  type: 'deposit' | 'purchase' | 'earning' | 'withdrawal';
  amount: number; // In cents
  description: string;
  orderId?: string;
  createdAt: Date;
}
