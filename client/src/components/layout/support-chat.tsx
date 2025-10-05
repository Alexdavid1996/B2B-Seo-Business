import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  MessageCircle, 
  Send, 
  X, 
  Plus, 
  Ticket, 
  Clock, 
  CheckCircle,
  Eye,
  ArrowLeft,
  Lock
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'replied' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'general';
  createdAt: string;
  updatedAt: string;
}

interface SupportMessage {
  id: string;
  ticketId: string;
  message: string;
  sender: 'user' | 'admin';
  senderName?: string;
  createdAt: string;
}

// Security validation function for subject
const sanitizeSubject = (subject: string): string => {
  // Remove HTML tags and special characters
  const cleaned = subject.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
  // Remove URLs (simple pattern)
  const noUrls = cleaned.replace(/(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,})/gi, '');
  // Keep only alphanumeric, spaces, basic punctuation
  const textOnly = noUrls.replace(/[^a-zA-Z0-9\s\.\,\!\?\-]/g, '');
  // Trim and limit to 30 characters
  return textOnly.trim().substring(0, 30);
};

const ticketSchema = z.object({
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(30, "Subject must be 30 characters or less")
    .transform(sanitizeSubject)
    .refine((val) => val.length >= 5, "Subject too short after sanitization"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be 2000 characters or less").refine(
    (desc) => !/[<>\"'&]/.test(desc),
    "Description contains invalid characters"
  ),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['technical', 'billing', 'account', 'general'])
});

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message must be 2000 characters or less")
    // Removed invalid character check to allow URLs
});

type TicketFormData = z.infer<typeof ticketSchema>;
type MessageFormData = z.infer<typeof messageSchema>;

export function SupportChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mark notifications as read when opening a ticket
  const markNotificationsAsReadMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiRequest("/api/support/notifications/mark-read", {
        method: "POST",
        body: { ticketId }
      });
      return response;
    },
    onSuccess: () => {
      // Refresh notification count in sidebar
      queryClient.invalidateQueries({ queryKey: ["/api/support/notifications/count", user?.id] });
    }
  });

  // Mark notifications as read when user opens a ticket
  useEffect(() => {
    if (selectedTicket && user) {
      markNotificationsAsReadMutation.mutate(selectedTicket.id);
    }
  }, [selectedTicket?.id, user?.id]);

  // Clear all support notifications when support chat component is loaded
  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/support/notifications/mark-all-read", {
        method: "POST"
      });
      return response;
    },
    onSuccess: () => {
      // Refresh notification count in sidebar
      queryClient.invalidateQueries({ queryKey: ["/api/support/notifications/count", user?.id] });
    }
  });

  // Clear all support notifications when user opens support tab
  useEffect(() => {
    if (user) {
      clearAllNotificationsMutation.mutate();
    }
  }, [user?.id]);

  const ticketForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium',
      category: 'general'
    }
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  // Get user's tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/tickets/user", user?.id],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get messages for selected ticket
  const { data: messages = [], isLoading: messagesLoading } = useQuery<SupportMessage[]>({
    queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket?.id,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
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

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest("/api/support/tickets", {
        method: "POST",
        body: {
          ...data,
          status: "open"
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets/user"] });
      setShowNewTicketDialog(false);
      ticketForm.reset();
      toast({
        title: "Ticket created successfully",
        description: "Our support team will respond as soon as possible."
      });
    },
    onError: () => {
      toast({
        title: "Failed to create ticket",
        variant: "destructive"
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: string; message: string }) => {
      const response = await apiRequest(`/api/support/tickets/${data.ticketId}/messages`, {
        method: "POST",
        body: { message: data.message }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets/user"] });
      messageForm.reset({
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const onSubmitTicket = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  const onSubmitMessage = (data: MessageFormData) => {
    if (!selectedTicket) return;
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: data.message
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "outline" | "default" | "secondary", icon: any, label: string }> = {
      open: { variant: "outline", icon: Clock, label: "Open" },
      replied: { variant: "default", icon: MessageCircle, label: "Replied" },
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col h-[500px] sm:h-[600px] lg:h-[700px]">
            {!selectedTicket ? (
              // Ticket List View
              <div className="flex flex-col h-full w-full">
                <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <h3 className="font-semibold text-sm sm:text-base">Support Tickets</h3>
                  <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">New Ticket</span>
                        <span className="sm:hidden">New</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-2 sm:mx-4 max-w-sm sm:max-w-lg">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Create Support Ticket</DialogTitle>
                        <DialogDescription>
                          Describe your issue and our support team will assist you.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...ticketForm}>
                        <form onSubmit={ticketForm.handleSubmit(onSubmitTicket)} className="space-y-4 flex-1">
                          <FormField
                            control={ticketForm.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input placeholder="Brief description of your issue" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={ticketForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="technical">Technical Issues</SelectItem>
                                    <SelectItem value="billing">Billing & Payments</SelectItem>
                                    <SelectItem value="account">Account Management</SelectItem>
                                    <SelectItem value="general">General Inquiry</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={ticketForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={ticketForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Please provide detailed information about your issue..."
                                    rows={4}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowNewTicketDialog(false)}
                              className="w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createTicketMutation.isPending} className="w-full sm:w-auto">
                              Create Ticket
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {ticketsLoading ? (
                      <div className="text-center py-8 text-gray-500">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No support tickets yet</p>
                        <p className="text-sm">Create your first ticket to get help</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <Card 
                          key={ticket.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
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
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{ticket.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="capitalize">{ticket.category}</span>
                              <span>Created: {format(new Date(ticket.createdAt), "MMM d, HH:mm")} UTC</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              // Ticket Detail View
              <div className="flex flex-col h-full w-full">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedTicket(null)}
                      className="p-1 h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{selectedTicket.ticketNumber}</span>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{selectedTicket.subject}</h3>
                </div>
                
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading messages...</div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"} px-2`}
                        >
                          <div
                            className={`max-w-[90%] sm:max-w-[80%] md:max-w-[70%] p-3 rounded-lg ${
                              msg.sender === "user"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">
                                {msg.sender === "user" ? "You" : (msg.senderName || "Support Team")}
                              </span>
                            </div>
                            <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {msg.message}
                            </div>
                            <p className="text-xs opacity-70 mt-2">
                              {format(new Date(msg.createdAt), "MMM d, HH:mm")} UTC
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {selectedTicket.status !== 'closed' ? (
                  <div className="p-4 border-t">
                    <Form {...messageForm}>
                      <form onSubmit={messageForm.handleSubmit(onSubmitMessage)} className="space-y-2">
                        <FormField
                          control={messageForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Type your message..."
                                  rows={2}
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      messageForm.handleSubmit(onSubmitMessage)();
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            size="sm"
                            disabled={sendMessageMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Send Message
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-medium">This ticket is closed</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      You cannot send messages to closed tickets
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}