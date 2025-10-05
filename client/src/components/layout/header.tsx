import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "../../hooks/use-auth";
import { Bell, Menu, Wallet, X } from "lucide-react";
import { NotificationData } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import LiveClock from "@/components/ui/live-clock";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  LayoutDashboard, 
  Globe, 
  Search, 
  MessageSquare, 
  User,
  LogOut,
  ShoppingCart
} from "lucide-react";

interface HeaderProps {
  notifications: NotificationData[];
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Sites", href: "/sites", icon: Globe },
  { name: "Marketplace", href: "/directory", icon: Search },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Orders & Requests", href: "/orders", icon: ShoppingCart },
  { name: "Support", href: "/support", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Header({ notifications }: HeaderProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get wallet balance
  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!user?.id,
  });

  // Get platform settings
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  const walletBalance = (walletData as any)?.usdtBalance || 0;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          <div className="flex items-center min-w-0 flex-shrink-0 max-w-[200px] sm:max-w-[300px] lg:max-w-none">
            <Link href="/dashboard" className="block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary truncate cursor-pointer hover:text-primary/80 transition-colors whitespace-nowrap">
                {settings?.platformName || 'CollabPro'}
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0 min-w-0">
            <LiveClock 
              className="bg-blue-50 text-blue-700 px-2 lg:px-3 py-1.5 rounded-lg border border-blue-200 text-xs lg:text-sm" 
              showIcon={true}
              showDate={true}
              useAdminTimezone={user?.role === 'admin'}
            />
            <div className="flex items-center space-x-1 lg:space-x-2 bg-green-50 text-green-700 px-2 lg:px-3 py-1.5 rounded-lg border border-green-200">
              <Wallet className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs lg:text-sm font-medium">{formatCurrency(walletBalance)}</span>
            </div>

            <NotificationDropdown 
              notifications={notifications} 
              currentUserId={user?.id || ""} 
            />
            
            <div className="flex items-center space-x-3">
              <UserAvatar user={user} size="md" />
              <span className="hidden lg:block font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Wallet Balance */}
            <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-200">
              <Wallet className="h-3 w-3" />
              <span className="text-xs font-medium">${walletBalance.toFixed(0)}</span>
            </div>
            
            {/* Mobile Notifications */}
            <NotificationDropdown 
              notifications={notifications} 
              currentUserId={user?.id || ""} 
            />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon 
                            className={cn(
                              "mr-3 h-5 w-5",
                              isActive ? "text-primary" : "text-gray-400"
                            )} 
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
