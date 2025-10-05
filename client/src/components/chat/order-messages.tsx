import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, ExternalLink, CheckCircle, X, Package, Paperclip } from "lucide-react";

interface OrderData {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  amount: number;
  deliveryUrl?: string;
  buyerCompleted: boolean;
  sellerDelivered: boolean;
  listing?: {
    site?: {
      domain: string;
      title: string;
    };
  };
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface MessageWithSender {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface OrderMessagesProps {
  orderId: string | null;
  currentUserId: string;
}

export default function OrderMessages({ orderId, currentUserId }: OrderMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/messages/order", orderId],
    enabled: !!orderId,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });

  const { data: orders = [] } = useQuery<OrderData[]>({
    queryKey: ["/api/orders/user", currentUserId],
    enabled: !!currentUserId,
  });

  const currentOrder = orders.find(order => order.id === orderId);
  const isBuyer = currentOrder?.buyerId === currentUserId;
  const isSeller = currentOrder?.sellerId === currentUserId;
  const otherUser = isBuyer ? currentOrder?.seller : currentOrder?.buyer;

  // Mark messages as read when order chat opens
  useEffect(() => {
    if (orderId) {
      // Mark messages as read when user opens the order chat - this clears sidebar notification  
      apiRequest("/api/messages/mark-read", {
        method: "POST",
        body: { orderId }
      }).then(() => {
        // Refresh unread count to clear sidebar notification
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count", currentUserId] });
      }).catch(error => {
        console.error("Failed to mark messages as read:", error);
      });
    }
  }, [orderId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("/api/messages", {
        method: "POST",
        body: {
          orderId,
          senderId: currentUserId,
          content,
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count", currentUserId] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: { action: string; deliveryUrl?: string; userId: string }) => {
      const response = await apiRequest(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: data
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/user", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/order", orderId] });
      setDeliveryUrl("");
      toast({
        title: "Order updated",
        description: "The order status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update order",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !orderId) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDelivered = () => {
    if (!deliveryUrl.trim()) {
      toast({
        title: "Delivery URL required",
        description: "Please provide the URL where the content was published.",
        variant: "destructive",
      });
      return;
    }
    updateOrderMutation.mutate({ 
      action: "delivered",
      deliveryUrl: deliveryUrl.trim(),
      userId: currentUserId 
    });
  };

  const handleConfirmCompleted = () => {
    updateOrderMutation.mutate({ 
      action: "confirm_completed",
      userId: currentUserId 
    });
  };

  const handleCancelOrder = () => {
    if (confirm("Are you sure you want to cancel this order? The buyer will be fully refunded.")) {
      updateOrderMutation.mutate({ 
        action: "cancel",
        userId: currentUserId 
      });
    }
  };

  if (!orderId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-600">Choose an order from the list to start messaging</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Order not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {otherUser ? `${otherUser.firstName[0]}${otherUser.lastName[0]}` : '?'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Package className="w-4 h-4" />
                {currentOrder.orderId} • {currentOrder.listing?.site?.domain}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
              currentOrder.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
              currentOrder.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
              currentOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Actions and Input */}
      <div className="space-y-4">
        {/* Order Actions */}
        {currentOrder.status !== 'cancelled' && currentOrder.status !== 'completed' && (
          <div className="p-4 sm:p-6 border-t border-gray-200 space-y-3">
            {/* Seller Actions */}
            {isSeller && currentOrder.status === 'accepted' && !currentOrder.sellerDelivered && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Mark as Delivered</h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Delivery URL (where content was published)"
                    value={deliveryUrl}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Limit to 500 characters and prevent dangerous characters
                      if (value.length <= 500 && !/[<>\"'&]/.test(value)) {
                        setDeliveryUrl(value);
                      }
                    }}
                    maxLength={500}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleDelivered} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updateOrderMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Delivered!
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelOrder}
                      disabled={updateOrderMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Actions */}
            {isBuyer && currentOrder.status === 'delivered' && currentOrder.sellerDelivered && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Confirm Completion</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Please review the delivered work and confirm completion to release payment to the seller.
                </p>
                {currentOrder.deliveryUrl && (
                  <div className="mb-3">
                    <a
                      href={currentOrder.deliveryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View delivered content
                    </a>
                  </div>
                )}
                <Button 
                  onClick={handleConfirmCompleted}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={updateOrderMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Completed
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Message Input */}
        {currentOrder.status !== 'cancelled' && (
          <div className="p-3 sm:p-6 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit to 2000 characters and prevent dangerous characters
                    if (value.length <= 2000 && !/[<>\"'&]/.test(value)) {
                      setNewMessage(value);
                    }
                  }}
                  onKeyDown={handleKeyPress}
                  className="resize-none min-h-[80px] w-full"
                  rows={3}
                  maxLength={2000}
                />
              </div>
              <div className="flex flex-row sm:flex-col gap-2 justify-end">
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="shrink-0"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}