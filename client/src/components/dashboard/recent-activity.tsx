import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, Clock, ShoppingCart } from "lucide-react";
import { ExchangeWithDetails, OrderData } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../hooks/use-auth";

interface RecentActivityProps {
  exchanges: ExchangeWithDetails[];
  orders: OrderData[];
}

interface ActivityItem {
  id: string;
  icon: any;
  bgColor: string;
  iconColor: string;
  message: string;
  siteName: string;
  time: string;
  timestamp: Date;
  type: "exchange" | "order";
}

export default function RecentActivity({
  exchanges,
  orders,
}: RecentActivityProps) {
  const { user } = useAuth();

  // Process exchanges
  const exchangeActivities: ActivityItem[] = exchanges
    .filter((exchange) => exchange.status === "completed")
    .map((exchange) => ({
      id: `exchange-${exchange.id}`,
      icon: Check,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      message: "Exchange completed",
      siteName: exchange.requestedSite?.domain || "Unknown site",
      time: formatDistanceToNow(
        new Date(exchange.updatedAt || exchange.createdAt),
        { addSuffix: true },
      ),
      timestamp: new Date(exchange.updatedAt || exchange.createdAt),
      type: "exchange" as const,
    }));

  // Process orders (guest posts)
  const orderActivities: ActivityItem[] = (orders || [])
    .filter((order) => order.status === "completed")
    .map((order) => {
      const isBuyer = order.buyerId === user?.id;
      const siteName = order.listing?.site?.domain || "Unknown site";

      return {
        id: `order-${order.id}`,
        icon: ShoppingCart,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        message: isBuyer ? "Order Completed" : "Order has been sold to",
        siteName,
        time: formatDistanceToNow(new Date(order.updatedAt), {
          addSuffix: true,
        }),
        timestamp: new Date(order.updatedAt),
        type: "order" as const,
      };
    });

  // Combine and sort all activities by timestamp (most recent first)
  const allActivities = [...exchangeActivities, ...orderActivities]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5); // Limit to 5 items

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          📋 Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {allActivities.length > 0 ? (
            allActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`${activity.bgColor} p-2 rounded-full`}>
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {activity.message} for{" "}
                    <span className="font-medium">{activity.siteName}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
