import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, User, Clock, MessageSquare } from "lucide-react";

interface SupportMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'user' | 'admin';
  isRead: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ChatSession {
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  messages: SupportMessage[];
  unreadCount: number;
  lastMessage: SupportMessage;
}

export default function AdminChat() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: chatSessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/support-chats"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: selectedMessages = [], isLoading: messagesLoading } = useQuery<SupportMessage[]>({
    queryKey: ["/api/admin/support-messages", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time chat
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { userId: string; message: string }) => {
      await apiRequest('/api/admin/support-messages', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-chats"] });
      setNewMessage('');
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/support-messages/${userId}/mark-read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-chats"] });
    },
  });

  const handleSendMessage = () => {
    if (!selectedUserId || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      userId: selectedUserId,
      message: newMessage,
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    markAsReadMutation.mutate(userId);
  };

  const totalUnreadCount = chatSessions.reduce((total, session) => total + session.unreadCount, 0);

  if (isLoading) {
    return <div className="p-6">Loading support chats...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Support Chat Center
            {totalUnreadCount > 0 && (
              <Badge variant="destructive">
                {totalUnreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Chat Sessions List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                Active Conversations ({chatSessions.length})
              </h3>
              <ScrollArea className="h-[550px]">
                <div className="space-y-2">
                  {chatSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No support conversations yet</p>
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <Card 
                        key={session.userId}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedUserId === session.userId ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleUserSelect(session.userId)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-sm">
                                  {session.user.firstName} {session.user.lastName}
                                </span>
                                {session.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {session.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{session.user.email}</p>
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {session.lastMessage.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(session.lastMessage.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              {selectedUserId ? (
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {chatSessions.find(s => s.userId === selectedUserId)?.user.firstName}{' '}
                      {chatSessions.find(s => s.userId === selectedUserId)?.user.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {chatSessions.find(s => s.userId === selectedUserId)?.user.email}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[500px]">
                    {/* Messages */}
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-4">
                        {messagesLoading ? (
                          <div className="text-center py-4">Loading messages...</div>
                        ) : selectedMessages.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          selectedMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender === 'admin' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                  message.sender === 'admin'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-500">
                        Choose a conversation from the list to start chatting with users
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}