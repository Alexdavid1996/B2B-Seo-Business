import { Input } from "@/components/ui/input";
import { Search, Package, Clock } from "lucide-react";
import { OrderData } from "../../types";

interface OrderListProps {
  orders: OrderData[];
  currentUserId: string;
  onSelectOrder: (orderId: string) => void;
}

export default function OrderList({ orders, currentUserId, onSelectOrder }: OrderListProps) {
  // Only show orders that can have messages (accepted or delivered)
  const activeOrders = orders.filter(order => 
    order.status === "accepted" || order.status === "in_progress" || order.status === "pending"
  );

  const getInitials = (firstName: string = "", lastName: string = "") => {
    return (firstName[0] || "") + (lastName[0] || "");
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-purple-500 to-pink-600",
      "from-blue-500 to-indigo-600", 
      "from-green-500 to-emerald-600"
    ];
    return gradients[index % gradients.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-1/3 border-r border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Post Orders</h2>
        <div className="relative">
          <Input
            placeholder="Search orders..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="overflow-y-auto h-full">
        <div className="p-4 space-y-2">
          {activeOrders.length > 0 ? (
            activeOrders.map((order, index) => {
              const isBuyer = order.buyerId === currentUserId;
              const otherUser = isBuyer ? order.seller : order.buyer;
              const siteName = order.listing?.site?.domain || "Unknown site";
              
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectOrder(order.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {getInitials(otherUser?.firstName, otherUser?.lastName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {otherUser?.firstName} {otherUser?.lastName}
                        </h4>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600 truncate">#{order.id.slice(-8).toUpperCase()}</p>
                        <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {siteName} • ${order.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
              <p className="text-gray-600">Orders with active communication will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}