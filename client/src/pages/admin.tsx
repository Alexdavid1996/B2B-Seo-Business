import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  ShoppingCart,
  ArrowLeftRight,
  Clock,
  Settings,
  MessageSquare,
  Globe,
  BarChart3,
  LogOut,
  Wallet,
  CreditCard,
  Activity,
  FileText,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import AdminSettings from "@/components/admin/admin-settings";
import DomainManagement from "@/components/admin/domain-management";
import AdminFinances from "@/components/admin/admin-finances";
import AdminSupport from "@/components/admin/admin-support";
import EnhancedAdminUsers from "@/components/admin/enhanced-admin-users";
import AdminPaymentGateway from "@/components/admin/admin-payment-gateway";
import AdminPendingActivities from "@/components/admin/admin-pending-activities";

import LiveClock from "@/components/ui/live-clock";
import { useSEOPage } from "../hooks/use-seo";
import { ADMIN_BASE_PATH } from "@/lib/constants";

export default function AdminDashboard() {
  const { section = "overview" } = useParams();
  const { user, logout, isLoading } = useAuth();

  // SEO for admin dashboard
  useSEOPage('admin');

  // Always call ALL hooks first before any early returns
  const {
    data: stats = {
      totalRevenue: 0,
      totalUsers: 0,
      totalSales: 0,
      totalWalletFees: 0,
      totalSalesFees: 0,
      activeExchange: 0,
      pendingPosts: 0,
    },
  } = useQuery<{
    totalRevenue: number;
    totalUsers: number;
    totalSales: number;
    totalWalletFees: number;
    totalSalesFees: number;
    activeExchange: number;
    pendingPosts: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
  });

  const { data: recentActivity = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/recent-activity"],
    enabled: user?.role === "admin",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin",
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: user?.role === "admin",
  });

  // Use existing queries for pending items
  const { data: sites = [] } = useQuery({
    queryKey: ["/api/admin/sites"],
    enabled: user?.role === "admin",
  });

  const { data: depositRequests = [] } = useQuery({
    queryKey: ["/api/admin/wallet-transactions/top_up/processing"],
    enabled: user?.role === "admin",
  });

  const { data: withdrawalRequests = [] } = useQuery({
    queryKey: ["/api/admin/wallet-transactions/withdrawal/processing"],
    enabled: user?.role === "admin",
  });

  const { data: domains = [], isLoading: domainsLoading } = useQuery({
    queryKey: ["/api/admin/domains"],
    enabled: user?.role === "admin",
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/support-messages"],
    enabled: user?.role === "admin",
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: user?.role === "admin",
  });

  // Add queries for pending activities to match the Pending Activities page logic
  const { data: pendingActivities = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-activities"],
    enabled: user?.role === "admin",
  });

  // Use useEffect to handle logout to prevent infinite render loops
  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
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

  // Prevent non-admin users from accessing admin dashboard
  if (user?.role !== "admin") {
    return null;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Top-up, withdrawal & platform fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">
              All guest post purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalSalesFees || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform fees from sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Wallet Fees
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalWalletFees || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Top-up & withdrawal fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ongoing Guest Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                pendingActivities.filter(
                  (activity: any) =>
                    activity.type === "order" &&
                    ["accepted", "in_progress", "on_going"].includes(
                      activity.status,
                    ),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Active guest post orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Divider: Finances */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="mx-4 text-sm text-gray-500 font-medium">Finances</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Finance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Deposits
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(Array.isArray(depositRequests) ? depositRequests : []).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Manual deposits to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Withdrawals
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                (Array.isArray(withdrawalRequests) ? withdrawalRequests : [])
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Withdrawal requests to process
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Divider: Domains */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="mx-4 text-sm text-gray-500 font-medium">Domains</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Guest Post Domain
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                (Array.isArray(sites) ? sites : []).filter(
                  (site: any) =>
                    site.purpose === "sales" && site.status === "pending",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exchange Domain
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                (Array.isArray(sites) ? sites : []).filter(
                  (site: any) =>
                    site.purpose === "exchange" && site.status === "pending",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Divider: Activities */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="mx-4 text-sm text-gray-500 font-medium">Activities</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ongoing Exchange
            </CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                pendingActivities.filter(
                  (activity: any) =>
                    activity.type === "exchange" &&
                    activity.status === "active",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Active exchange requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Exchange
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                pendingActivities.filter(
                  (activity: any) =>
                    activity.type === "exchange" &&
                    activity.status === "pending",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Pending exchange requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              recentActivity.slice(0, 10).map((activity: any) => {
                const activityData = activity.data
                  ? JSON.parse(activity.data)
                  : {};
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">
                        {activity.type === "signup" ? (
                          <>
                            New user{" "}
                            <strong>
                              {activityData.firstName} {activityData.lastName}
                            </strong>{" "}
                            signed up
                            <span className="text-muted-foreground ml-2">
                              ({activityData.email})
                            </span>
                          </>
                        ) : (
                          `${activity.type} activity`
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                        {activityData.ipAddress && (
                          <span className="ml-2">
                            from {activityData.ipAddress}
                          </span>
                        )}
                      </p>
                    </div>
                    <Badge variant="secondary">{activity.type}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => {
    return <EnhancedAdminUsers />;
  };

  const renderFinances = () => {
    return <AdminFinances />;
  };

  const renderDomains = () => {
    return <DomainManagement />;
  };

  const renderChat = () => {
    return <AdminSupport />;
  };

  const renderSettings = () => {
    return <AdminSettings />;
  };

  const renderPaymentGateway = () => {
    return <AdminPaymentGateway />;
  };

  const renderPendingActivities = () => {
    return <AdminPendingActivities />;
  };

  const renderContent = () => {
    switch (section) {
      case "users":
        return renderUsers();
      case "finances":
        return renderFinances();
      case "payment-gateway":
        return renderPaymentGateway();
      case "domains":
        return renderDomains();
      case "chat":
        return renderChat();
      case "pending-activities":
        return renderPendingActivities();
      case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <Badge variant="outline">Administrator</Badge>
              <LiveClock
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 text-xs"
                showIcon={true}
                showDate={true}
                useAdminTimezone={true}
              />
            </div>
            <div className="flex items-center space-x-4">
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/")}
              >
                Back to Platform
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={section} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger
              value="overview"
              onClick={() => (window.location.href = ADMIN_BASE_PATH)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              onClick={() =>
                (window.location.href = `${ADMIN_BASE_PATH}/users`)
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="finances"
              onClick={() =>
                (window.location.href = `${ADMIN_BASE_PATH}/finances`)
              }
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Finances
            </TabsTrigger>
            <TabsTrigger
              value="payment-gateway"
              onClick={() =>
                (window.location.href = `${ADMIN_BASE_PATH}/payment-gateway`)
              }
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Gateway
            </TabsTrigger>
            <TabsTrigger
              value="domains"
              onClick={() =>
                (window.location.href = `${ADMIN_BASE_PATH}/domains`)
              }
            >
              <Globe className="w-4 h-4 mr-2" />
              Domains
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              onClick={() => (window.location.href = `${ADMIN_BASE_PATH}/chat`)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger
              value="pending-activities"
              onClick={() =>
                (window.location.href = `${ADMIN_BASE_PATH}/pending-activities`)
              }
            >
              <Activity className="w-4 h-4 mr-2" />
              Pending Activities
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() =>
                (window.location.href = `${ADMIN_BASE_PATH}/settings`)
              }
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value={section} className="space-y-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
