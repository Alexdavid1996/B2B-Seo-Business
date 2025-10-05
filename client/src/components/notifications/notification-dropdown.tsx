import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { NotificationData } from "../../types";
import { Bell, Check, Clock, MessageSquare, CheckCircle, XCircle, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface NotificationDropdownProps {
  notifications: NotificationData[];
  currentUserId: string;
}

export default function NotificationDropdown({ notifications, currentUserId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/notifications/${notificationId}`, {
        method: "PUT",
        body: { isRead: true }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user", currentUserId] });
    },
    onError: () => {
      toast({
        title: "Failed to mark notification as read",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/notifications/mark-all-read", {
        method: "PUT",
        body: { userId: currentUserId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user", currentUserId] });
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark all notifications as read",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "exchange_pending":
      case "exchange_request":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "exchange_accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "exchange_rejected":
      case "exchange_cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "exchange_delivered":
      case "exchange_completed":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "exchange_pending":
      case "exchange_request":
        return "border-amber-200 bg-amber-50";
      case "exchange_accepted":
        return "border-green-200 bg-green-50";
      case "exchange_rejected":
      case "exchange_cancelled":
        return "border-red-200 bg-red-50";
      case "exchange_delivered":
      case "exchange_completed":
        return "border-blue-200 bg-blue-50";
      case "message":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  // Auto-mark all notifications as read when bell is opened
  const handlePopoverOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // When opening the bell AND there are unread notifications, mark them all as read
    if (open && unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs h-6 px-2"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    notification.isRead ? "border-gray-200 bg-white" : getNotificationColor(notification.type)
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}