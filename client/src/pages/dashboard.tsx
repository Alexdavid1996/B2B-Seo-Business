import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { SupportChat } from "@/components/layout/support-chat";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import TopSites from "@/components/dashboard/top-sites";
import SiteCard from "@/components/sites/site-card";
import AddSiteForm from "@/components/sites/add-site-form";
import DirectoryFilters from "@/components/directory/directory-filters";
import DirectoryResults from "@/components/directory/directory-results";
import ExchangeFilters from "@/components/exchanges/exchange-filters";
import ExchangeCard from "@/components/exchanges/exchange-card";
import ChatList from "@/components/chat/chat-list";
import ChatMessages from "@/components/chat/chat-messages";
import ProfileForm from "@/components/profile/profile-form";
import SecuritySettings from "@/components/profile/security-settings";
import ProfileSidebar from "@/components/profile/profile-sidebar";
import { useAuth } from "../hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Footer from "@/components/layout/footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SiteWithUser,
  ExchangeWithDetails,
  NotificationData,
  MessageWithSender,
  ListingData,
  OrderData,
  WalletData,
  TransactionData,
} from "../types";
import { useSEOPage } from "../hooks/use-seo";
import SellListingForm from "@/components/marketplace/sell-listing-form";
import ListingCard from "@/components/marketplace/listing-card";
import GuestPostCard from "@/components/orders/guest-post-card";
import OrderList from "@/components/orders/order-list";
import OrderMessages from "@/components/orders/order-messages";

import LiveClock from "@/components/ui/live-clock";
import WalletContent from "@/components/wallet/wallet-content";
import TransactionHistory from "@/components/wallet/transaction-history";
import MySitesPaginated from "@/components/sites/my-sites-paginated";
import GlobalNotification from "@/components/layout/global-notification";

const SECTIONS = {
  dashboard: "Dashboard",
  sites: "My Sites",
  directory: "Marketplace",
  wallet: "Wallet / Top Up",
  orders: "Orders & Requests",
  referral: "Referral Program",
  profile: "Profile",
  support: "Support",
};

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const [location] = useLocation();

  // Parse section from URL - handle both /dashboard/section and /section formats
  const pathParts = location.split("/").filter(Boolean);
  let section = "dashboard";

  if (pathParts[0] === "dashboard" && pathParts[1]) {
    section = pathParts[1];
  } else if (pathParts[0] && pathParts[0] !== "dashboard") {
    // Direct routes like /sites, /wallet, etc.
    section = pathParts[0];
  }

  // Fetch public settings to get referral commission amount
  const { data: settings } = useQuery({
    queryKey: ["/api/settings/public"],
  });

  // SEO for dashboard - dynamic based on section
  const seoPageKey = section === "dashboard" ? "dashboard" : 
    section === "sites" ? "dashboard-sites" :
    section === "wallet" ? "dashboard-wallet" :
    section === "orders" ? "dashboard-orders" :
    section === "messages" ? "messages" :
    section === "referral" ? "referral" :
    section === "profile" ? "profile" :
    section === "support" ? "support" :
    "dashboard";
  
  useSEOPage(seoPageKey);

  // All hooks must be called before any early returns
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(
    null,
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderMessages, setShowOrderMessages] = useState(false);
  const [siteStatusFilter, setSiteStatusFilter] = useState<
    "approved" | "pending" | "rejected"
  >("approved");
  const [directoryMode, setDirectoryMode] = useState<
    "exchange" | "marketplace"
  >("marketplace");
  const [directoryFilters, setDirectoryFilters] = useState({
    search: "",
    category: "all",
    domainAuthority: "any",
    traffic: "any",
  });
  const [directorySortType, setDirectorySortType] = useState<"bestSales" | "highTraffic" | null>("bestSales");
  const [orderTab, setOrderTab] = useState<"guest_posts" | "exchanges">(
    "guest_posts",
  );
  const [exchangeSubTab, setExchangeSubTab] = useState<
    "pending" | "ongoing" | "completed" | "rejected"
  >("pending");
  const [guestPostSubTab, setGuestPostSubTab] = useState<
    "ongoing" | "completed" | "declined"
  >("ongoing");
  const [messageTab, setMessageTab] = useState<"guest_posts" | "exchanges">(
    "guest_posts",
  );
  const [messageFilter, setMessageFilter] = useState<
    "all" | "pending" | "ongoing" | "completed"
  >("all");

  // Track viewed sub-tabs to clear notifications
  const [viewedSubTabs, setViewedSubTabs] = useState<Set<string>>(new Set());
  
  // Referral history sub-tab state
  const [referralSubTab, setReferralSubTab] = useState<"pending" | "paid">("pending");
  const [referralPage, setReferralPage] = useState(1);
  const referralLimit = 5;

  // Referral data queries - outside switch statement to avoid hook order issues
  const { data: referralStats, isLoading: referralStatsLoading } = useQuery({
    queryKey: ['/api/referrals', user?.id, 'stats'],
    enabled: !!user?.id,
  });

  const { data: referralHistoryData, isLoading: referralHistoryLoading } = useQuery({
    queryKey: ['/api/referrals', user?.id, 'history', referralSubTab, referralPage, referralLimit],
    enabled: !!user?.id,
  });

  // Extract referral history and pagination from response
  const referralHistory = referralHistoryData?.referrals || [];
  const referralPagination = referralHistoryData?.pagination;

  const { data: userSites = [], isLoading: sitesLoading } = useQuery<
    SiteWithUser[]
  >({
    queryKey: ["/api/sites/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: directorySites = [], isLoading: directoryLoading } = useQuery<
    SiteWithUser[]
  >({
    queryKey: ["/api/sites/directory"],
  });

  const { data: exchanges = [], isLoading: exchangesLoading } = useQuery<
    ExchangeWithDetails[]
  >({
    queryKey: ["/api/exchanges/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: notifications = [] } = useQuery<NotificationData[]>({
    queryKey: ["/api/notifications/user", user?.id],
    enabled: !!user?.id,
  });

  // Mark messages as read when visiting Orders & Requests section (for chat notifications)
  useEffect(() => {
    if (section === "orders" && user?.id) {
      apiRequest("/api/orders/mark-section-viewed", {
        method: "POST",
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count", user.id] });
      }).catch(error => {
        console.error("Failed to mark orders section as viewed:", error);
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count", user.id] });
      });
    }
  }, [section, user?.id]);

  // Mutation to mark order-related notifications as read when visiting orders section
  const markOrderNotificationsAsRead = useMutation({
    mutationFn: async () => {
      const orderNotifications = notifications.filter(
        (n) =>
          !n.isRead &&
          (n.section === "guest_post" ||
            (n.type &&
              (n.type.includes("order") || n.type.includes("exchange")))),
      );

      // Mark each order-related notification as read
      for (const notification of orderNotifications) {
        await apiRequest(`/api/notifications/${notification.id}`, {
          method: "PUT",
          body: { isRead: true },
        });
      }
    },
    onSuccess: () => {
      // Refresh notifications after marking as read
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/user", user?.id],
      });
    },
  });

  // Marketplace data queries
  const { data: userListings = [], isLoading: listingsLoading } = useQuery<
    ListingData[]
  >({
    queryKey: ["/api/listings/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: userOrders = [], isLoading: ordersLoading } = useQuery<
    OrderData[]
  >({
    queryKey: ["/api/orders/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: wallet } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user?.id,
  });

  const { data: userStats } = useQuery<{
    totalSites: number;
    completedExchanges: number;
    pendingApproval: number;
    totalSales: number;
  }>({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user?.id,
  });

  const { data: transactions = [] } = useQuery<TransactionData[]>({
    queryKey: ["/api/transactions", user?.id],
    enabled: !!user?.id,
  });

  // Auto-mark order notifications as read when visiting orders section
  useEffect(() => {
    if (section === "orders" && notifications.length > 0) {
      const hasUnreadOrderNotifications = notifications.some(
        (n) =>
          !n.isRead &&
          (n.section === "guest_post" ||
            (n.type &&
              (n.type.includes("order") || n.type.includes("exchange")))),
      );

      if (hasUnreadOrderNotifications) {
        markOrderNotificationsAsRead.mutate();
      }
    }
  }, [section, notifications]);

  // Use useEffect to handle logout to prevent infinite render loops
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      logout();
    }
  }, [user?.role, isLoading, logout]);

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Prevent admin users from accessing regular dashboard
  if (user?.role === "admin") {
    return null;
  }

  const renderContent = () => {
    switch (section) {
      case "dashboard":
        return (
          <div className="p-4 sm:p-6">
            {/* Global Notification Banner */}
            <div className="mb-6">
              <GlobalNotification />
            </div>

            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's what's happening with your domains.
              </p>
            </div>

            <StatsCards
              sites={userSites}
              exchanges={exchanges}
              userStats={userStats}
              totalSales={userStats?.totalSales || 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              <RecentActivity exchanges={exchanges} orders={userOrders} />
              <TopSites sites={directorySites} orders={userOrders} />
            </div>
          </div>
        );

      case "sites":
        // Filter sites based on status
        const filteredSites = userSites.filter((site) => {
          if (siteStatusFilter === "approved")
            return site.status === "approved";
          if (siteStatusFilter === "pending") return site.status === "pending";
          if (siteStatusFilter === "rejected")
            return site.status === "rejected";
          return false;
        });

        // Count sites by status
        const approvedCount = userSites.filter(
          (site) => site.status === "approved",
        ).length;
        const pendingCount = userSites.filter(
          (site) => site.status === "pending",
        ).length;
        const rejectedCount = userSites.filter(
          (site) => site.status === "rejected",
        ).length;

        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  My Sites
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your domain portfolio and submission status.
                </p>
              </div>
              <Dialog
                open={showAddSiteModal}
                onOpenChange={setShowAddSiteModal}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Site
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl mx-4">
                  <DialogHeader>
                    <DialogTitle>Add New Site</DialogTitle>
                  </DialogHeader>
                  <AddSiteForm onSuccess={() => setShowAddSiteModal(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <Tabs
              value={siteStatusFilter}
              onValueChange={(value) =>
                setSiteStatusFilter(
                  value as "approved" | "pending" | "rejected",
                )
              }
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger
                  value="approved"
                  className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-1.5"
                >
                  <span className="hidden sm:inline">Approved</span>
                  <span className="sm:hidden">App.</span>
                  <span className="ml-1">({approvedCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-1.5"
                >
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pend.</span>
                  <span className="ml-1">({pendingCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-1.5"
                >
                  <span className="hidden sm:inline">Disapproved</span>
                  <span className="sm:hidden">Disapp.</span>
                  <span className="ml-1">({rejectedCount})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="approved">
                <MySitesPaginated
                  sites={filteredSites}
                  loading={sitesLoading}
                  emptyState={{
                    title: "No approved sites yet",
                    description:
                      "Your sites will appear here once they are approved by our team.",
                    action: (
                      <Button
                        onClick={() => setShowAddSiteModal(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Site
                      </Button>
                    ),
                  }}
                />
              </TabsContent>

              <TabsContent value="pending">
                <MySitesPaginated
                  sites={filteredSites}
                  loading={sitesLoading}
                  emptyState={{
                    title: "No pending sites",
                    description:
                      "All your sites have been reviewed and approved.",
                    action: null,
                  }}
                />
              </TabsContent>

              <TabsContent value="rejected">
                <MySitesPaginated
                  sites={filteredSites}
                  loading={sitesLoading}
                  emptyState={{
                    title: "No disapproved sites",
                    description: "None of your sites have been disapproved.",
                    action: null,
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        );

      case "directory":
        return (
          <div className="p-4 sm:p-6">
            {/* Global Notification Banner */}
            <div className="mb-6">
              <GlobalNotification />
            </div>

            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Global Directory
              </h1>
              <p className="text-gray-600 mt-2">
                🔍 Discover and connect with high-quality domains for potential
                collaboration.
              </p>
            </div>

            <DirectoryFilters
              mode={directoryMode}
              onModeChange={setDirectoryMode}
              filters={directoryFilters}
              onFiltersChange={setDirectoryFilters}
              onSortChange={setDirectorySortType}
            />

            {directoryLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <DirectoryResults
                sites={directorySites}
                userSites={userSites}
                mode={directoryMode}
                filters={directoryFilters}
                sortType={directorySortType}
              />
            )}
          </div>
        );

      case "exchanges":
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Exchange Management
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your ongoing domain exchanges.
              </p>
            </div>

            <ExchangeFilters />

            {exchangesLoading ? (
              <div className="space-y-6 mt-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6 mt-8">
                {exchanges.map((exchange) => (
                  <ExchangeCard
                    key={exchange.id}
                    exchange={exchange}
                    currentUserId={user?.id || ""}
                    onOpenChat={setSelectedExchangeId}
                  />
                ))}
                {exchanges.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No exchanges yet
                    </h3>
                    <p className="text-gray-600">
                      Start exploring the directory to find potential exchange
                      partners.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "wallet":
        return <WalletContent wallet={wallet} transactions={transactions} />;

      case "orders":
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Orders & Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your collaboration requests and guest post orders.
              </p>

              {/* Tab Navigation with notification counts */}
              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 mt-4 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
                <button
                  onClick={() => setOrderTab("guest_posts")}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto ${
                    orderTab === "guest_posts"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="hidden sm:inline">Guest Post</span>
                  <span className="sm:hidden">Guest</span>
                  {(() => {
                    // Count only ongoing guest post orders (same logic as exchanges - only active/ongoing count)
                    const totalGuestPostCount = userOrders.filter(order =>
                      order.status === "on_going"
                    ).length;
                    return totalGuestPostCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                        {totalGuestPostCount}
                      </span>
                    ) : null;
                  })()}
                </button>
                <button
                  onClick={() => setOrderTab("exchanges")}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto ${
                    orderTab === "exchanges"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="hidden sm:inline">Exchange</span>
                  <span className="sm:hidden">Exch.</span>
                  {(() => {
                    // Count all exchange activities - pending, active, delivered
                    const totalExchangeCount = exchanges.filter(exchange =>
                      exchange.status === "pending" || 
                      exchange.status === "active" || 
                      exchange.status === "delivered"
                    ).length;
                    return totalExchangeCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                        {totalExchangeCount}
                      </span>
                    ) : null;
                  })()}
                </button>
              </div>
            </div>

            {orderTab === "guest_posts" ? (
              <div>
                {/* Guest Post Sub-tabs with notification counts - No Pending tab as orders go straight to On Going */}
                <div className="flex flex-wrap gap-1 mt-4 bg-gray-50 p-1 rounded-lg w-full overflow-x-auto mb-6">
                  <button
                    onClick={() => setGuestPostSubTab("ongoing")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      guestPostSubTab === "ongoing"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">On Going</span>
                    <span className="sm:hidden">Ongoing</span>
                    {(() => {
                      // ALWAYS show current total ongoing orders  
                      const ongoingCount = userOrders.filter(
                        (order) =>
                          order.status === "accepted" ||
                          order.status === "in_progress" ||
                          order.status === "on_going"
                      ).length;
                      return ongoingCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                          {ongoingCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    onClick={() => setGuestPostSubTab("completed")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      guestPostSubTab === "completed"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                    {(() => {
                      // ALWAYS show total completed orders (never clear)
                      const completedCount = userOrders.filter(
                        (order) => order.status === "completed"
                      ).length;
                      return completedCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full">
                          {completedCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    onClick={() => setGuestPostSubTab("declined")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      guestPostSubTab === "declined"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">Declined</span>
                    <span className="sm:hidden">Dec.</span>
                    {(() => {
                      // ALWAYS show total declined orders (never clear)
                      const declinedCount = userOrders.filter(
                        (order) => 
                          order.status === "cancelled" ||
                          order.status === "refunded"
                      ).length;
                      return declinedCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {declinedCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                </div>

                {/* Guest Post Content */}
                {ordersLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  (() => {
                    // Filter orders based on selected sub-tab (no pending - orders go straight to ongoing)
                    const filteredOrders = userOrders.filter((order) => {
                      switch (guestPostSubTab) {
                        case "ongoing":
                          return (
                            order.status === "accepted" ||
                            order.status === "in_progress" ||
                            order.status === "on_going"
                          );
                        case "completed":
                          return order.status === "completed";
                        case "declined":
                          return (
                            order.status === "cancelled" ||
                            order.status === "refunded"
                          );
                        default:
                          return true;
                      }
                    });

                    return filteredOrders.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No{" "}
                          {guestPostSubTab === "ongoing"
                            ? "ongoing"
                            : guestPostSubTab}{" "}
                          orders
                        </h3>
                        <p className="text-gray-600">
                          {guestPostSubTab === "ongoing" &&
                            "Active guest post orders in progress will appear here."}
                          {guestPostSubTab === "completed" &&
                            "Successfully completed guest post orders will appear here."}
                          {guestPostSubTab === "declined" &&
                            "Declined or cancelled guest post orders will appear here."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredOrders.map((order) => (
                          <GuestPostCard
                            key={order.id}
                            order={order}
                            currentUserId={user?.id || ""}
                            onOpenChat={setSelectedOrderId}
                          />
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            ) : null}

            {/* Order Chat Modal for Guest Posts */}
            {selectedOrderId && orderTab === "guest_posts" && (
              <Dialog
                open={!!selectedOrderId}
                onOpenChange={() => setSelectedOrderId(null)}
              >
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      Order Chat - Sales #{selectedOrderId.slice(0, 6)}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <OrderMessages
                      orderId={selectedOrderId}
                      currentUserId={user?.id || ""}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {orderTab === "exchanges" ? (
              <div>
                {/* Exchange Sub-tabs with notification counts */}
                <div className="flex flex-wrap gap-1 mt-4 bg-gray-50 p-1 rounded-lg w-full overflow-x-auto mb-6">
                  <button
                    onClick={() => setExchangeSubTab("pending")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      exchangeSubTab === "pending"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">Pend.</span>
                    {(() => {
                      // ALWAYS show current total pending exchanges
                      const pendingCount = exchanges.filter(
                        (e) => e.status === "pending"
                      ).length;
                      return pendingCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {pendingCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    onClick={() => setExchangeSubTab("ongoing")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      exchangeSubTab === "ongoing"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">On Going</span>
                    <span className="sm:hidden">Ongoing</span>
                    {(() => {
                      // ALWAYS show current total ongoing exchanges
                      const ongoingCount = exchanges.filter(
                        (e) => e.status === "active"
                      ).length;
                      return ongoingCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                          {ongoingCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    onClick={() => setExchangeSubTab("completed")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      exchangeSubTab === "completed"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                    {(() => {
                      // ALWAYS show total completed exchanges (never clear)
                      const completedCount = exchanges.filter(
                        (e) => e.status === "completed",
                      ).length;
                      return completedCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full">
                          {completedCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    onClick={() => setExchangeSubTab("rejected")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      exchangeSubTab === "rejected"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">Rejected</span>
                    <span className="sm:hidden">Rej.</span>
                    {(() => {
                      // ALWAYS show total rejected exchanges (never clear)
                      const rejectedCount = exchanges.filter(
                        (e) => e.status === "cancelled",
                      ).length;
                      return rejectedCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {rejectedCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                </div>

                {/* Exchange Content */}
                {exchangesLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  (() => {
                    // Filter exchanges based on selected sub-tab
                    const filteredExchanges = exchanges.filter((exchange) => {
                      switch (exchangeSubTab) {
                        case "pending":
                          return exchange.status === "pending";
                        case "ongoing":
                          return exchange.status === "active";
                        case "completed":
                          return exchange.status === "completed";
                        case "rejected":
                          return exchange.status === "cancelled";
                        default:
                          return true;
                      }
                    });

                    return filteredExchanges.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No{" "}
                          {exchangeSubTab === "ongoing"
                            ? "ongoing"
                            : exchangeSubTab}{" "}
                          collaborations
                        </h3>
                        <p className="text-gray-600">
                          {exchangeSubTab === "pending" &&
                            "Requests you’ve sent or received will be shown here."}
                          {exchangeSubTab === "ongoing" &&
                            "Active collaborations in progress will appear here."}
                          {exchangeSubTab === "completed" &&
                            "Completed link collaborations will appear here."}
                          {exchangeSubTab === "rejected" &&
                            "Declined partnerships will be listed here."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredExchanges.map((exchange) => (
                          <ExchangeCard
                            key={exchange.id}
                            exchange={exchange}
                            currentUserId={user?.id || ""}
                            onOpenChat={setSelectedExchangeId}
                          />
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            ) : null}

            {/* Chat Modal for Exchange */}
            {selectedExchangeId && (
              <Dialog
                open={!!selectedExchangeId}
                onOpenChange={() => setSelectedExchangeId(null)}
              >
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Exchange Chat</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <ChatMessages
                      exchangeId={selectedExchangeId}
                      currentUserId={user?.id || ""}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account information and preferences.
              </p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
                <ProfileForm user={user} />
                <SecuritySettings />
              </div>
              <div className="order-1 lg:order-2">
                <ProfileSidebar user={user} />
              </div>
            </div>
          </div>
        );

      case "support":
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Support Center
              </h1>
              <p className="text-gray-600 mt-2">
                Get help with your account, report issues, or ask questions.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <SupportChat />
            </div>
          </div>
        );

      case "referral":
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Refer & Earn</h1>
              <p className="text-gray-600">Earn rewards by referring new users to our platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <span className="mr-2">💰</span> Total Earned
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {referralStatsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      `$${(referralStats?.totalEarnings || 0).toFixed(2)} USDT`
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">From referrals</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <span className="mr-2">👥</span> Total Referrals
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {referralStatsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : (
                      referralStats?.referredUserCount || 0
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Users referred</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <span className="mr-2">📈</span> Conversion Rate
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {referralStatsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : (
                      referralHistory.length > 0 ? 
                        Math.round((referralHistory.filter((r: any) => r.status === 'paid').length / referralHistory.length) * 100) : 0
                    )}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Success rate</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Share Your Link */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="mr-2">🔗</span>
                    <h3 className="text-lg font-semibold">Your Referral Link</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Share this link with friends to start earning</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Referral Link</label>
                      <div className="flex space-x-2">
                        <input 
                          type="text"
                          value={user ? `${window.location.origin}/signup?ref=${user.username}` : ""}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <button 
                          onClick={() => {
                            if (user) {
                              navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${user.username}`);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="mr-2">🎁</span>
                    <h3 className="text-lg font-semibold">How It Works</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Share your link</p>
                        <p className="text-sm text-gray-600">Send your referral link to friends and colleagues</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">They sign up</p>
                        <p className="text-sm text-gray-600">New users register using your referral link</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">You earn ${settings?.referralCommission || 3} USDT</p>
                        <p className="text-sm text-gray-600">Receive commission when they make their first order</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You earn commission only on the first order made by each referred user. 
                        The reward is automatically added to your wallet balance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral History */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="mr-2">⏰</span>
                  <h3 className="text-lg font-semibold">Referral History</h3>
                </div>
                <p className="text-gray-600 mb-6">Track your referral earnings and status</p>
                
                {/* Sub-tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => {
                      setReferralSubTab("pending");
                      setReferralPage(1);
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      referralSubTab === "pending"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pending
                    {referralStats?.pendingCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-yellow-500 rounded-full">
                        {referralStats.pendingCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setReferralSubTab("paid");
                      setReferralPage(1);
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      referralSubTab === "paid"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Paid
                    {referralStats?.paidCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full">
                        {referralStats.paidCount}
                      </span>
                    )}
                  </button>
                </div>
                
                {referralHistoryLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : referralHistory.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {referralHistory.map((referral: any) => (
                        <div 
                          key={referral.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              referral.status === 'paid' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                            }`}>
                              <span className="text-white text-sm">
                                {referral.status === 'paid' ? '✅' : '⏳'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {referral.referredUsername || 'Referred User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(referral.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium text-green-600">
                                ${(referral.referralAmount || 3.00).toFixed(2)} USDT
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                referral.status === 'paid' ? 
                                  'bg-green-100 text-green-800' : 
                                  'bg-yellow-100 text-yellow-800'
                              }`}>
                                {referral.status === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {referralPagination && referralPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Showing {((referralPage - 1) * referralLimit) + 1} to {Math.min(referralPage * referralLimit, referralPagination.total)} of {referralPagination.total} results
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setReferralPage(referralPage - 1)}
                            disabled={referralPage === 1}
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          <div className="flex space-x-1">
                            {Array.from({ length: Math.min(5, referralPagination.totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setReferralPage(pageNum)}
                                  className={`px-3 py-1 text-sm border rounded-md ${
                                    referralPage === pageNum
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setReferralPage(referralPage + 1)}
                            disabled={referralPage === referralPagination.totalPages}
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">
                      {referralSubTab === 'pending' ? '⏳' : '💰'}
                    </span>
                    <p className="text-gray-500 mb-2">
                      No {referralSubTab} referrals yet
                    </p>
                    <p className="text-sm text-gray-400">
                      {referralSubTab === 'pending' 
                        ? 'Pending referrals will appear here when users sign up with your link'
                        : 'Paid commissions will appear here when referred users make their first order'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar
          currentSection={section}
          exchanges={exchanges}
          sites={userSites}
          orders={userOrders}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="h-full w-full max-w-full">{renderContent()}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
