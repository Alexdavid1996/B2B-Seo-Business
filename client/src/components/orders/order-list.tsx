import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Order {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: string;
  requirements?: string;
  createdAt: string;
  buyer?: { id: string; firstName: string; lastName: string };
  seller?: { id: string; firstName: string; lastName: string };
  listing?: {
    id: string;
    type: string;
    site?: {
      domain: string;
    };
  };
}

interface OrderListProps {
  orders: Order[];
  currentUserId: string;
  onSelectOrder: (orderId: string) => void;
}

export default function OrderList({ orders, currentUserId, onSelectOrder }: OrderListProps) {
  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const formatOrderId = (orderId: string) => {
    return orderId.replace('#ORDER-', 'Sales #');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "accepted":
      case "in_progress":
        return <Badge className="bg-green-100 text-green-800">On Going</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Filter orders to show only those where chat is relevant (accepted, in_progress, completed)
  const chatableOrders = orders.filter(order => 
    ["accepted", "in_progress", "completed"].includes(order.status)
  );

  if (chatableOrders.length === 0) {
    return (
      <div className="w-full lg:w-1/3 border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No active orders with chat available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/3 border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
      <div className="space-y-3">
        {chatableOrders.map((order) => {
          const isSeller = order.sellerId === currentUserId;
          const otherUser = isSeller ? order.buyer : order.seller;
          
          return (
            <Card 
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectOrder(order.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {formatOrderId(order.orderId || `Sales #${order.id.slice(0, 6)}`)}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      ${formatAmount(order.amount)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {isSeller ? "Buyer: " : "Seller: "}
                      {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {order.listing?.site?.domain && (
                    <p className="text-sm text-gray-600 truncate">
                      Site: {order.listing.site.domain}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}