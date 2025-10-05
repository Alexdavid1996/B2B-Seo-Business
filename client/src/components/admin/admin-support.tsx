import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Send, 
  User, 
  Clock, 
  MessageSquare, 
  Ticket,
  CheckCircle,
  Eye,
  X,
  AlertTriangle,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  userId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'replied' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'general';
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  sender: 'user' | 'admin';
  senderName?: string;
  createdAt: string;
}

export default function AdminSupport() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/support/tickets", statusFilter, priorityFilter, categoryFilter],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<SupportMessage[]>({
    queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket?.id,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time chat
  });

  // Auto-scroll to latest message when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: string; message: string }) => {
      const response = await apiRequest(`/api/admin/support/tickets/${data.ticketId}/reply`, {
        method: "POST",
        body: { message: data.message }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      setNewMessage('');
      toast({
        title: "Message sent successfully",
        description: "Your reply has been sent to the user."
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to send message", 
        variant: "destructive" 
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { ticketId: string; status: string }) => {
      const response = await apiRequest(`/api/admin/support/tickets/${data.ticketId}/status`, {
        method: "PUT",
        body: { status: data.status }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"] });
      
      // Force refetch current tickets list
      queryClient.refetchQueries({ queryKey: ["/api/admin/support/tickets"] });
      
      // Update the selected ticket in the UI immediately
      if (selectedTicket) {
        setSelectedTicket((prev) => prev ? { ...prev, status: prev.status } : null);
      }
      
      toast({
        title: "Status updated successfully",
        description: "The ticket status has been updated."
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to update status", 
        variant: "destructive" 
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedTicket) return;
    
    // Update local state immediately for better UX
    setSelectedTicket({ ...selectedTicket, status: newStatus });
    
    updateStatusMutation.mutate({
      ticketId: selectedTicket.id,
      status: newStatus,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "outline" | "default" | "secondary" | "destructive", icon: any, label: string }> = {
      open: { variant: "outline", icon: Clock, label: "Open" },
      replied: { variant: "default", icon: MessageSquare, label: "Replied" },
      investigating: { variant: "secondary", icon: Eye, label: "Investigating" },
      resolved: { variant: "default", icon: CheckCircle, label: "Resolved" },
      closed: { variant: "secondary", icon: X, label: "Closed" }
    };
    
    const config = variants[status] || variants.open;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
      low: "outline",
      medium: "secondary", 
      high: "default",
      urgent: "destructive"
    };
    
    return (
      <Badge variant={variants[priority] || "outline"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
    return true;
  });

  const ticketStats = tickets.reduce((acc, ticket) => {
    acc.total++;
    if (ticket.status === 'open') acc.open++;
    if (ticket.status === 'replied') acc.replied++;
    if (ticket.priority === 'urgent') acc.urgent++;
    return acc;
  }, { total: 0, open: 0, replied: 0, urgent: 0 });

  if (isLoading) {
    return <div className="p-6">Loading support tickets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{ticketStats.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold text-orange-600">{ticketStats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Response</p>
                <p className="text-2xl font-bold text-blue-600">{ticketStats.replied}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{ticketStats.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Support Tickets
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[600px]">
            {/* Ticket List */}
            <div className="w-1/2 border-r pr-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tickets found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <Card 
                        key={ticket.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{ticket.ticketNumber}</span>
                              {getStatusBadge(ticket.status)}
                            </div>
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <h4 className="font-medium text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ticket.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{ticket.user.firstName} {ticket.user.lastName}</span>
                            </div>
                            <span>{format(new Date(ticket.createdAt), "MMM d, HH:mm")}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span className="capitalize">{ticket.category}</span>
                            <span>{ticket.user.email}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Ticket Detail */}
            <div className="w-1/2 pl-4">
              {!selectedTicket ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a ticket to view details</p>
                    <p className="text-sm">Choose a ticket from the list to start responding</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Ticket Header */}
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{selectedTicket.ticketNumber}</span>
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                      <Select 
                        value={selectedTicket.status} 
                        onValueChange={handleStatusChange}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <h3 className="font-medium mb-2">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{selectedTicket.user.firstName} {selectedTicket.user.lastName}</span>
                      </div>
                      <span>{selectedTicket.user.email}</span>
                      <span className="capitalize">{selectedTicket.category}</span>
                      <span>{format(new Date(selectedTicket.createdAt), "MMM d, yyyy 'at' HH:mm")}</span>
                    </div>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea ref={scrollAreaRef} className="flex-1 mb-4">
                    <div className="space-y-4">
                      {messagesLoading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading messages...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-xs">Start the conversation by sending a reply</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`w-full flex ${msg.sender === "admin" ? "justify-end" : "justify-start"} px-2`}
                          >
                            <div
                              className={`max-w-[90%] sm:max-w-[80%] md:max-w-[70%] p-3 rounded-lg ${
                                msg.sender === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold">
                                  {msg.sender === "admin" ? (msg.senderName || "Support Team") : `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`}
                                </span>
                              </div>
                              <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {msg.message}
                              </div>
                              <p className="text-xs opacity-70 mt-2">
                                {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your reply..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                          className="resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}