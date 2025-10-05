import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Calendar, DollarSign, User, MessageSquare } from "lucide-react";
import { OrderData } from "../../types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OrderCardProps {
  order: OrderData;
  currentUserId: string;
}

export default function OrderCard({ order, currentUserId }: OrderCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/user"] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
    },
  });

  const handleAccept = () => {
    updateOrderMutation.mutate({ status: "accepted" });
  };

  const handleReject = () => {
    updateOrderMutation.mutate({ status: "cancelled" });
  };

  const handleStartWork = () => {
    updateOrderMutation.mutate({ status: "in_progress" });
  };

  const handleComplete = () => {
    if (!deliveryUrl.trim()) {
      toast({
        title: "Delivery URL required",
        description: "Please provide the URL where the content was published.",
        variant: "destructive",
      });
      return;
    }
    updateOrderMutation.mutate({ 
      status: "completed", 
      deliveryUrl: deliveryUrl.trim() 
    });
  };

  const handleRefund = () => {
    updateOrderMutation.mutate({ status: "refunded" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'accepted': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatAmount = (amount: number) => {
    return amount ? amount.toFixed(2) : '0.00';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>
                {isSeller ? 
                  `Buyer: ${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || 'Unknown Buyer' : 
                  `Seller: ${order.seller?.firstName || ''} ${order.seller?.lastName || ''}`.trim() || 'Unknown Seller'
                }
              </span>
              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                #CHAT{(order.id || '').slice(-4).toUpperCase()}
              </span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="font-medium">${formatAmount((order as any).totalAmount)} - {order.listing?.site?.domain}</span>
              <Badge variant={getStatusColor(order.status)}>
                {order.status === 'in_progress' ? 'On Going' : order.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant={order.listing?.type === 'guest_post' ? 'default' : 'secondary'}>
                {order.listing?.type === 'guest_post' ? 'Guest Post' : 'Link Placement'}
              </Badge>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold text-green-600">
              <DollarSign className="h-4 w-4" />
              {formatAmount((order as any).totalAmount)}
            </div>
            <div className="text-xs text-gray-500">
              {isSeller ? 'You earn' : 'You paid'}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {isSeller ? 'Buyer:' : 'Seller:'} {isSeller ? order.buyer?.firstName : order.seller?.firstName} {isSeller ? order.buyer?.lastName : order.seller?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {format(new Date(order.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {order.requirements && (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Requirements:</div>
            <p className="text-gray-600">{order.requirements}</p>
          </div>
        )}

        {order.status === 'in_progress' && isSeller && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="deliveryUrl">Delivery URL</Label>
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                💡 Payment is released once the buyer confirms delivery.
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id="deliveryUrl"
                value={deliveryUrl}
                onChange={(e) => setDeliveryUrl(e.target.value)}
                placeholder="https://example.com/published-article"
              />
              <Button 
                onClick={handleComplete}
                disabled={updateOrderMutation.isPending || !deliveryUrl.trim()}
              >
                Mark Complete
              </Button>
            </div>
          </div>
        )}

        {order.deliveryUrl && (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Published at:</div>
            <a 
              href={order.deliveryUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {order.deliveryUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          
          <div className="flex gap-2">
            {order.status === 'pending' && isSeller && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReject}
                  disabled={updateOrderMutation.isPending}
                >
                  Decline
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAccept}
                  disabled={updateOrderMutation.isPending}
                >
                  Accept Order
                </Button>
              </>
            )}
            
            {order.status === 'accepted' && isSeller && (
              <>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={handleRefund}
                  disabled={updateOrderMutation.isPending}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Refund
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleStartWork}
                  disabled={updateOrderMutation.isPending}
                >
                  Start Work
                </Button>
              </>
            )}
            
            {order.status === 'in_progress' && isSeller && (
              <Button 
                variant="outline"
                size="sm" 
                onClick={handleRefund}
                disabled={updateOrderMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Refund
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}