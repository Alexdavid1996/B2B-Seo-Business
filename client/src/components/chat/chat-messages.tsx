import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageWithSender, ExchangeWithDetails } from "../../types";
import { Paperclip, Send, Package, CheckCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";

interface ChatMessagesProps {
  exchangeId: string | null;
  currentUserId: string;
}

export default function ChatMessages({ exchangeId, currentUserId }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/messages/exchange", exchangeId],
    enabled: !!exchangeId,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });

  const { data: exchanges = [] } = useQuery<ExchangeWithDetails[]>({
    queryKey: ["/api/exchanges/user", currentUserId],
    enabled: !!currentUserId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to ensure fresh data
  });

  // Auto-scroll to bottom when messages change or component mounts
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read and scroll to bottom when exchange changes (chat opened)
  useEffect(() => {
    if (exchangeId) {
      // Mark messages as read when user opens the chat - this clears sidebar notification
      apiRequest("/api/messages/mark-read", {
        method: "POST",
        body: { exchangeId }
      }).then(() => {
        // Refresh unread count to clear sidebar notification
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count", currentUserId] });
      }).catch(error => {
        console.error("Failed to mark messages as read:", error);
      });
      
      setTimeout(scrollToBottom, 100); // Small delay to ensure DOM is ready
    }
  }, [exchangeId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/messages", {
        method: "POST",
        body: {
          exchangeId,
          senderId: currentUserId,
          content,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/exchange", exchangeId] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges/user", currentUserId] });
      // Update unread count when sending messages
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count", currentUserId] });
      setNewMessage("");
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100);
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });



  const updateExchangeMutation = useMutation({
    mutationFn: async (data: { status?: string; deliveryUrl?: string; userId: string }) => {
      return await apiRequest(`/api/exchanges/${exchangeId}`, {
        method: "PUT",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges/user", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/exchange", exchangeId] });
      setDeliveryUrl("");
      toast({
        title: "Exchange updated",
        description: "The exchange status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update exchange",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !exchangeId) return;

    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkDelivered = () => {
    if (!deliveryUrl.trim()) {
      toast({
        title: "Delivery URL required",
        description: "Please provide the URL where the content was published.",
        variant: "destructive",
      });
      return;
    }
    updateExchangeMutation.mutate({ 
      status: "delivered", 
      deliveryUrl: deliveryUrl.trim(),
      userId: currentUserId 
    });
  };

  const handleCompleteOrder = () => {
    updateExchangeMutation.mutate({ 
      status: "completed",
      userId: currentUserId 
    });
  };

  if (!exchangeId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-600">Choose a conversation from the list to start messaging.</p>
        </div>
      </div>
    );
  }

  const currentExchange = exchanges.find((ex: ExchangeWithDetails) => ex.id === exchangeId);
  const otherUser = currentExchange?.requesterId === currentUserId 
    ? currentExchange?.requestedUser 
    : currentExchange?.requester;

  const getInitials = (firstName: string = "", lastName: string = "") => {
    return (firstName[0] || "") + (lastName[0] || "");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Keep fresh exchange data to prevent state issues
  // staleTime: 0 ensures the exchange completion status is always current

  return (
    <div className="flex-1 flex flex-col bg-white max-h-screen overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {currentExchange?.requesterId === currentUserId ? 
                `Site Owner: ${currentExchange?.requestedUser?.firstName || ''} ${currentExchange?.requestedUser?.lastName || ''}`.trim() || 'Unknown User' : 
                `Requester: ${currentExchange?.requester?.firstName || ''} ${currentExchange?.requester?.lastName || ''}`.trim() || 'Unknown User'
              }
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Exchange: {currentExchange?.requesterSite?.domain} ↔ {currentExchange?.requestedSite?.domain}
            </p>
            {/* Exchange Completion Status Line */}
            {currentExchange && (currentExchange.status === "active" || currentExchange.status === "completed") && (
              <div className="mt-1 text-xs text-gray-600">
                <span className={`${currentExchange.requesterCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {currentExchange.requesterCompleted ? "✓" : "○"} {currentExchange.requester?.firstName} {currentExchange.requester?.lastName}
                </span>
                {" "}
                <span className={`${currentExchange.requestedUserCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {currentExchange.requestedUserCompleted ? "✓" : "○"} {currentExchange.requestedUser?.firstName} {currentExchange.requestedUser?.lastName}
                </span>
              </div>
            )}
          </div>
          <div className="text-right flex flex-col items-end space-y-2">
            {/* Mark Complete Button - Show if current user hasn't completed yet */}
            {currentExchange && currentExchange.status === "active" && 
             ((currentUserId === currentExchange.requesterId && !currentExchange.requesterCompleted) ||
              (currentUserId === currentExchange.requestedUserId && !currentExchange.requestedUserCompleted)) && (
              <Button 
                onClick={handleCompleteOrder}
                disabled={updateExchangeMutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 h-8 rounded-md shadow-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              #CHAT{(exchangeId || '').slice(-4).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message: MessageWithSender) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUserId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="font-medium text-sm mb-1">
                  {message.senderId === currentUserId
                    ? "You"
                    : `${message.sender?.firstName} ${message.sender?.lastName}`}
                </div>
                <div className="text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.senderId === currentUserId
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>



      {/* Completion Section - Shows for delivered exchanges */}
      {currentExchange && currentExchange.status === "delivered" && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-200 flex-shrink-0">
          <div className="space-y-3">
            <div className="text-sm font-medium text-green-900">Exchange Ready for Completion</div>
            <p className="text-sm text-green-700">
              Both parties must confirm completion. Once both confirm, the exchange will be marked as completed.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {currentExchange.requesterCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm text-gray-700">
                    {currentExchange.requester?.firstName} confirmed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentExchange.requestedUserCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm text-gray-700">
                    {currentExchange.requestedUser?.firstName} confirmed
                  </span>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      )}

      {/* Message Input - Show for active and delivered exchanges until completed */}
      {currentExchange && (currentExchange.status === "active" || currentExchange.status === "delivered") && (
        <div className="p-3 sm:p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resize-none min-h-[80px] w-full"
                rows={3}
              />
            </div>
            <div className="flex flex-row sm:flex-col gap-2 justify-end">
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

      {/* Message disabled for completed exchanges */}
      {currentExchange && currentExchange.status === "completed" && (
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Chat is closed - Exchange completed</p>
          </div>
        </div>
      )}
    </div>
  );
}
