import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, MessageSquare, Eye, CheckCircle, X, User, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
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
  senderId: string;
  message: string;
  isFromUser: boolean;
  createdAt: string;
}

export default function EmployeeSupport() {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Fetch all support tickets - employee has same access as admin for support
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/admin/support/tickets/all/all/all"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch messages for selected ticket
  const { data: messages } = useQuery({
    queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket?.id,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time chat
  });

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
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-red-100 text-red-800",
      urgent: "bg-red-200 text-red-900"
    };
    
    return (
      <Badge className={variants[priority] || variants.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Support Tickets Management
          </CardTitle>
          <CardDescription>
            View and respond to customer support tickets. All support functionality is available to employees.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tickets ({tickets?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {tickets?.map((ticket: SupportTicket) => (
              <div
                key={ticket.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">#{ticket.ticketNumber}</span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{ticket.subject}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.user?.firstName || 'N/A'} {ticket.user?.lastName || ''}
                      </span>
                      <span>{ticket.user?.email || 'N/A'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {!tickets?.length && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details & Messages */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTicket ? `Ticket #${selectedTicket.ticketNumber}` : 'Select a Ticket'}
            </CardTitle>
            {selectedTicket && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Status:</span>
                <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
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
            )}
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                {/* Ticket Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedTicket.subject}</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedTicket.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Customer: {selectedTicket.user?.firstName || 'N/A'} {selectedTicket.user?.lastName || ''}</span>
                    <span>Email: {selectedTicket.user?.email || 'N/A'}</span>
                    <span>Category: {selectedTicket.category}</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages?.map((message: SupportMessage) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isFromUser 
                          ? 'bg-blue-50 border-l-4 border-blue-400 ml-4' 
                          : 'bg-green-50 border-l-4 border-green-400 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">
                          {message.isFromUser ? 'Customer' : 'Support Team'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="space-y-3 border-t pt-4">
                  <Label htmlFor="reply">Send Reply</Label>
                  <Textarea
                    id="reply"
                    placeholder="Type your response here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="w-full"
                  >
                    {sendMessageMutation.isPending ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to view details and messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}