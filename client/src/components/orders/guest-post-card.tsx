import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Calendar, CheckCircle, XCircle, Eye, DollarSign, RefreshCw, BarChart3, TrendingUp, Globe, FileText } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Order {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  serviceFee?: number;
  sellerAmount?: number;
  status: string;
  requirements?: string;
  googleDocLink?: string;
  targetLink?: string;
  deliveryUrl?: string;
  createdAt: string;
  buyer?: { id: string; firstName: string; lastName: string };
  seller?: { id: string; firstName: string; lastName: string };
  listing?: {
    id: string;
    type: string;
    site?: {
      domain: string;
      domainAuthority?: number;
      monthlyTraffic?: number;
    };
  };
}

interface GuestPostCardProps {
  order: Order;
  currentUserId: string;
  onOpenChat: (orderId: string) => void;
}

const isValidGoogleDocsUrl = (url: string) => {
  const googleDocsPattern = /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\//;
  return googleDocsPattern.test(url);
};

export default function GuestPostCard({ order, currentUserId, onOpenChat }: GuestPostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState(order.deliveryUrl || "");

  const isSeller = order.sellerId === currentUserId;
  const isBuyer = order.buyerId === currentUserId;

  const updateOrderMutation = useMutation({
    mutationFn: async (data: { status?: string; deliveryUrl?: string }) => {
      const response = await apiRequest(`/api/orders/${order.id}`, {
        method: "PATCH",
        body: data
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries when order status changes
      queryClient.invalidateQueries({ queryKey: ["/api/orders/user", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/order", order.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user", currentUserId] });
      
      if (variables.status === "refunded") {
        toast({
          title: "Order declined",
          description: "The order has been declined and buyer has been refunded.",
        });
      } else if (variables.status === "completed") {
        toast({
          title: "Order completed",
          description: "The order has been marked as completed and chat has been closed.",
        });
      } else {
        toast({
          title: "Order updated",
          description: "The order status has been updated.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to update order",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "on_going":
      case "accepted":
      case "in_progress":
        return <Badge className="bg-green-100 text-green-800">Sales in Progress</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (domain: string) => {
    return domain.split('.')[0].substring(0, 2).toUpperCase();
  };

  const handleAccept = () => {
    updateOrderMutation.mutate({ status: "accepted" });
  };

  const handleDecline = () => {
    // Only seller can decline - automatically moves to Declined tab and refunds buyer
    updateOrderMutation.mutate({ 
      status: "refunded",
      userId: currentUserId 
    });
  };

  const handleMarkCompleted = () => {
    // Only buyer can mark as completed - moves to Completed tab for both users and closes chat
    updateOrderMutation.mutate({ 
      action: "confirm_completed", 
      userId: currentUserId 
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatOrderId = (orderId: string) => {
    return orderId.replace('#ORDER-', 'Sales #');
  };



  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {getStatusBadge(order.status)}
            <span className="text-sm text-gray-500">
              {formatOrderId(order.orderId || `Sales #${order.id.slice(0, 6)}`)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {isSeller ? "Buyer" : "Seller"}
            </h4>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">
                  {isSeller ? 
                    (order.buyer?.firstName?.charAt(0) || "B") + (order.buyer?.lastName?.charAt(0) || "") :
                    (order.seller?.firstName?.charAt(0) || "S") + (order.seller?.lastName?.charAt(0) || "")
                  }
                </span>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">
                  {isSeller ? 
                    `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || 'Unknown Buyer' :
                    `${order.seller?.firstName || ''} ${order.seller?.lastName || ''}`.trim() || 'Unknown Seller'
                  }
                </h5>
                <p className="text-sm text-gray-500">
                  {isSeller ? "Purchasing guest post" : "Selling guest post"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Site Details</h4>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">
                  {order.listing?.site?.domain ? getInitials(order.listing.site.domain) : "?"}
                </span>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">
                  {order.listing?.site?.domain || "Site Domain"}
                </h5>
                <p className="text-sm text-gray-500">
                  DA: {order.listing?.site?.domainAuthority || "?"} | 
                  Traffic: {order.listing?.site?.monthlyTraffic?.toLocaleString() || "0"}/mo
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isSeller ? (
                    <>Earnings: ${formatAmount(order.sellerAmount || order.amount)}</>
                  ) : (
                    <>Total Cost: ${formatAmount(order.amount)}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Requirements */}
        {order.requirements && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 italic">"{order.requirements}"</p>
          </div>
        )}

        {/* Google Doc and Target Link */}
        {(order.googleDocLink || order.targetLink) && (
          <div className="mb-4 space-y-2">
            {order.googleDocLink && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 font-medium">Google Doc:</span>
                </div>
                <div className="bg-gray-50 p-2 rounded border text-xs break-all font-mono">
                  {order.googleDocLink}
                </div>
              </div>
            )}
            {order.targetLink && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 font-medium">Target Link:</span>
                </div>
                <div className="bg-gray-50 p-2 rounded border text-xs break-all font-mono">
                  {order.targetLink}
                </div>
                {/* Informational badges for sellers and buyers on ongoing orders */}
                {(order.status === "on_going" || order.status === "accepted") && (
                  <>
                    {isSeller && (
                      <div className="flex items-center space-x-2 mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <span className="text-blue-600">💡</span>
                        <span className="text-blue-700">Payment is released once the buyer confirms delivery.</span>
                      </div>
                    )}
                    {isBuyer && (
                      <div className="flex items-center space-x-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <span className="text-red-600">⚠️</span>
                        <span className="text-red-700">Be sure to receive your order in chat before clicking 'Mark Complete'.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Delivery URL */}
        {order.deliveryUrl && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Content Published:</span>
              <a 
                href={order.deliveryUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                View Published Content
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {(order.status === "on_going" || order.status === "accepted") && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Sales in progress</span>
              </div>
            )}
            <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{isSeller ? 'Buyer' : 'Seller'} Information</h4>
                    <p className="text-sm text-gray-600">
                      {isSeller 
                        ? (order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown Buyer')
                        : (order.seller ? `${order.seller.firstName} ${order.seller.lastName}` : 'Unknown Seller')
                      }
                    </p>
                  </div>
                  {!isSeller && (
                    <div>
                      <h4 className="font-medium text-gray-900">Site Domain</h4>
                      <p className="text-sm text-gray-600">{order.listing?.site?.domain || 'Unknown'}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {isSeller ? 'Your Earnings' : 'Total Cost'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ${formatAmount(isSeller ? (order.sellerAmount || order.amount) : order.amount)}
                    </p>
                    {isSeller && order.serviceFee && (
                      <p className="text-xs text-gray-400 mt-1">
                        Platform fee: ${formatAmount(order.serviceFee)}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-sm text-gray-600">{order.requirements || 'No description provided'}</p>
                  </div>
                  {order.googleDocLink && (
                    <div>
                      <h4 className="font-medium text-gray-900">Submitted Content</h4>
                      <div className="bg-gray-50 p-2 rounded border text-xs break-all font-mono">
                        {order.googleDocLink}
                      </div>
                    </div>
                  )}
                  {order.targetLink && (
                    <div>
                      <h4 className="font-medium text-gray-900">Target Link</h4>
                      <div className="bg-gray-50 p-2 rounded border text-xs break-all font-mono">
                        {order.targetLink}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex space-x-2">
            {order.status === "on_going" && isSeller && (
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={updateOrderMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {updateOrderMutation.isPending ? "Processing..." : "Decline"}
              </Button>
            )}
            
            {order.status === "on_going" && (
              <>
                <Button onClick={() => onOpenChat(order.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
                {isBuyer && (
                  order.status === "completed" ? (
                    <Button 
                      variant="outline"
                      disabled
                      className="border-green-500 text-green-700 bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed by You
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={handleMarkCompleted}
                      disabled={updateOrderMutation.isPending}
                      className="border-green-300 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updateOrderMutation.isPending ? "Processing..." : "Mark Complete"}
                    </Button>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}