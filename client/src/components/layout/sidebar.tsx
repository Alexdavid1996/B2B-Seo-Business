import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Globe, 
  Search, 
  MessageSquare, 
  User,
  Users,
  LogOut,
  Wallet,
  ShoppingCart,
  Headphones
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ExchangeWithDetails, SiteWithUser, NotificationData } from "../../types";

interface SidebarProps {
  currentSection: string;
  exchanges: ExchangeWithDetails[];
  sites: SiteWithUser[];
  orders?: any[];
  notifications?: NotificationData[];
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Sites", href: "/sites", icon: Globe },
  { name: "Marketplace", href: "/directory", icon: Search },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Orders & Requests", href: "/orders", icon: ShoppingCart },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Referral Program", href: "/referral", icon: Users },
  { name: "Support", href: "/support", icon: Headphones },
];

export default function Sidebar({ currentSection, exchanges, sites, orders = [], notifications = [] }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { user } = useAuth();

  // Fetch support notification count
  const { data: supportNotificationData } = useQuery({
    queryKey: ["/api/support/notifications/count", user?.id],
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch unread message count for chat notifications
  const { data: unreadMessageData } = useQuery({
    queryKey: ["/api/messages/unread-count", user?.id],
    enabled: !!user?.id,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time notifications
  });

  const supportNotificationCount = (supportNotificationData as any)?.count || 0;
  const unreadMessageCount = (unreadMessageData as any)?.count || 0;

  const pendingExchanges = exchanges.filter(e => e.status === "pending").length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const totalPendingMessages = pendingExchanges + pendingOrders;
  const approvedSitesCount = sites.filter(site => site.status === "approved").length;
  
  // Notifications should only appear in bell icon, not affect tab counts
  // Tab counts should be based on actual data, not notifications

  const getBadgeCount = (href: string) => {
    switch (href) {
      case "/sites":
        // Don't show a notification badge for sites - this should show count in a different way
        return null;
      case "/directory":
        // Show pending guest post orders for marketplace
        const pendingGuestPostOrders = orders.filter(o => 
          o.status === "pending" && o.sellerId === user?.id
        ).length;
        return pendingGuestPostOrders > 0 ? pendingGuestPostOrders : null;
      case "/orders":
        // PERSISTENT notifications (stay until status changes): Pending + Ongoing
        const pendingSellerOrders = orders.filter(o => 
          o.status === "pending" && o.sellerId === user?.id
        ).length;
        const ongoingSellerOrders = orders.filter(o => 
          (o.status === "accepted" || o.status === "in_progress" || o.status === "on_going") && o.sellerId === user?.id
        ).length;
        const ongoingBuyerOrders = orders.filter(o => 
          (o.status === "delivered" || o.status === "on_going") && o.buyerId === user?.id
        ).length;
        const pendingExchanges = exchanges.filter(e => 
          e.status === "pending" && (e.requesterId === user?.id || e.requestedUserId === user?.id)
        ).length;
        const ongoingExchanges = exchanges.filter(e => 
          (e.status === "active" || e.status === "delivered") && (e.requesterId === user?.id || e.requestedUserId === user?.id)
        ).length;
        
        // SIDEBAR: Only show pending + ongoing counts (items that need action) + unread messages
        // These clear automatically when status changes to completed/cancelled
        const actionableNotifications = pendingSellerOrders + ongoingSellerOrders + ongoingBuyerOrders + pendingExchanges + ongoingExchanges;
        
        // Add unread messages count - this clears when user opens any chat
        const totalSidebarNotifications = actionableNotifications + unreadMessageCount;
        
        return totalSidebarNotifications > 0 ? totalSidebarNotifications : null;
      case "/support":
        return supportNotificationCount > 0 ? supportNotificationCount : null;
      default:
        return null;
    }
  };

  const getBadgeVariant = (href: string) => {
    switch (href) {
      case "/sites":
        return "destructive" as const; // Red badge for pending exchange requests
      case "/directory":
        return "destructive" as const; // Red badge for pending guest post orders
      case "/orders":
        return "destructive" as const; // Red badge for actionable items
      case "/chat":
        return "default" as const;
      case "/support":
        return "default" as const; // Blue badge for support notifications
      default:
        return "secondary" as const;
    }
  };

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-4 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = currentSection === item.href.replace("/", "");
                const badgeCount = getBadgeCount(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/5 border-r-2 border-primary text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                      )} 
                    />
                    {item.name}
                    {/* Show approved sites count for My Sites tab */}
                    {item.href === "/sites" && approvedSitesCount > 0 && (
                      <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {approvedSitesCount}
                      </span>
                    )}
                    {/* Show notification badges for other tabs */}
                    {item.href !== "/sites" && badgeCount && (
                      <Badge 
                        variant={getBadgeVariant(item.href)}
                        className="ml-auto"
                      >
                        {badgeCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
