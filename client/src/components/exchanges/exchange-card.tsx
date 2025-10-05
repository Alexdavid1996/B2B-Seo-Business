import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, FileText, Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExchangeWithDetails } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface ExchangeCardProps {
  exchange: ExchangeWithDetails;
  currentUserId: string;
  onOpenChat: (exchangeId: string) => void;
}

export default function ExchangeCard({ exchange, currentUserId, onOpenChat }: ExchangeCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const updateExchangeMutation = useMutation({
    mutationFn: async (data: { status: string; userId: string }) => {
      const response = await apiRequest(`/api/exchanges/${exchange.id}`, {
        method: "PUT",
        body: data
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries when exchange status changes
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges/user", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/exchange", exchange.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user", currentUserId] });
      
      if (variables.status === "cancelled" || variables.status === "rejected") {
        toast({
          title: variables.status === "rejected" ? "Exchange rejected" : "Exchange cancelled",
          description: "The exchange request has been rejected and messages have been cleared.",
        });
      } else {
        toast({
          title: "Exchange updated",
          description: "The exchange status has been updated.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to update exchange",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800">On Going</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
      case "declined":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (domain: string) => {
    return domain.split('.')[0].substring(0, 2).toUpperCase();
  };

  const handleApprove = () => {
    updateExchangeMutation.mutate({ status: "active", userId: currentUserId });
  };

  const handleDisapprove = () => {
    updateExchangeMutation.mutate({ status: "rejected", userId: currentUserId });
  };

  const handleMarkComplete = () => {
    // The server will handle the completion logic - marking user as completed 
    // and only setting status to "completed" when both parties confirm
    updateExchangeMutation.mutate({ status: "completed", userId: currentUserId });
  };

  const isRequester = exchange.requesterId === currentUserId;
  const canAcceptReject = !isRequester && exchange.status === "pending";
  
  // Check completion status for both users
  const currentUserCompleted = isRequester ? exchange.requesterCompleted : exchange.requestedUserCompleted;
  const otherUserCompleted = isRequester ? exchange.requestedUserCompleted : exchange.requesterCompleted;

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-4">
          {/* Header with status and ID */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusBadge(exchange.status)}
              <span className="text-xs text-gray-500">#{exchange.id.slice(0, 6)}</span>
            </div>
            <span className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(exchange.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Sites in vertical stack for mobile */}
          <div className="space-y-3">
            {/* Your site */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                {isRequester ? "Your Site" : `${exchange.requester?.firstName || "Unknown"}'s Site`}
              </h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {exchange.requesterSite ? getInitials(exchange.requesterSite.domain) : "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 text-sm truncate">
                    {exchange.requesterSite?.domain || "Unknown"}
                  </h5>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">DA: {exchange.requesterSite?.domainAuthority || "?"}</span>
                    <span className="text-xs text-gray-500">Traffic: {exchange.requesterSite?.monthlyTraffic?.toLocaleString() || "0"}/mo</span>
                  </div>
                  <div className="flex flex-col space-y-2 mt-1">
                    <div className={`px-2 py-1 rounded text-xs font-medium text-white w-fit ${
                      exchange.requesterSite?.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {exchange.requesterSite?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                    </div>
                    {exchange.requesterSite?.category && (
                      <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white w-fit">
                        {exchange.requesterSite.category}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Partner's site */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                {isRequester ? `${exchange.requestedUser?.firstName || "Unknown"}'s Site` : "Your Site"}
              </h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {exchange.requestedSite ? getInitials(exchange.requestedSite.domain) : "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 text-sm truncate">
                    {exchange.requestedSite?.domain || "Unknown"}
                  </h5>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">DA: {exchange.requestedSite?.domainAuthority || "?"}</span>
                    <span className="text-xs text-gray-500">Traffic: {exchange.requestedSite?.monthlyTraffic?.toLocaleString() || "0"}/mo</span>
                  </div>
                  <div className="flex flex-col space-y-2 mt-1">
                    <div className={`px-2 py-1 rounded text-xs font-medium text-white w-fit ${
                      exchange.requestedSite?.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {exchange.requestedSite?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                    </div>
                    {exchange.requestedSite?.category && (
                      <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white w-fit">
                        {exchange.requestedSite.category}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message preview for mobile */}
          {exchange.message && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-700 line-clamp-2">"{exchange.message}"</p>
            </div>
          )}

          {/* Mobile Actions - All buttons adapted for mobile */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {/* Status indicator */}
            {(exchange.status === "active" || exchange.status === "delivered") && (
              <div className="flex items-center justify-center space-x-1 bg-green-50 rounded-lg p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Exchange in progress</span>
              </div>
            )}

            {/* Action buttons row 1 */}
            <div className="flex space-x-2">
              <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs px-3 flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Exchange Request Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Selected Site:</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{exchange.requesterSite?.domain || "Unknown"}</p>
                        <p className="text-sm text-gray-500">
                          DA: {exchange.requesterSite?.domainAuthority || "?"} | 
                          Traffic: {exchange.requesterSite?.monthlyTraffic?.toLocaleString() || "0"}/mo
                        </p>
                        <div className="mt-2">
                          <div className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                            exchange.requesterSite?.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            {exchange.requesterSite?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {exchange.message && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Message:</h4>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">"{exchange.message}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Chat button - always visible for active exchanges */}
              {(exchange.status === "active" || exchange.status === "delivered" || exchange.status === "completed") && (
                <Button
                  size="sm"
                  variant={exchange.status === "completed" ? "outline" : "default"}
                  onClick={() => onOpenChat(exchange.id)}
                  disabled={exchange.status === "completed"}
                  className="text-xs px-3 flex-1"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {exchange.status === "completed" ? "Chat Closed" : "Chat"}
                </Button>
              )}
            </div>

            {/* Action buttons row 2 - Approve/Disapprove for pending */}
            {canAcceptReject && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleDisapprove}
                  disabled={updateExchangeMutation.isPending}
                  className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                  size="sm"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  {updateExchangeMutation.isPending ? "Processing..." : "Disapprove"}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={updateExchangeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                  size="sm"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {updateExchangeMutation.isPending ? "Processing..." : "Approve"}
                </Button>
              </div>
            )}

            {/* Mark Complete button for active exchanges */}
            {(exchange.status === "active" || exchange.status === "delivered") && (
              <div className="flex space-x-2">
                {!currentUserCompleted ? (
                  <Button 
                    variant="outline"
                    onClick={handleMarkComplete}
                    disabled={updateExchangeMutation.isPending}
                    className="border-green-300 text-green-600 hover:bg-green-50 text-xs flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {updateExchangeMutation.isPending ? "Processing..." : "Mark Complete"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    disabled
                    className="border-green-500 text-green-700 bg-green-50 text-xs flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed by You
                  </Button>
                )}
                {otherUserCompleted && (
                  <Button 
                    variant="outline"
                    disabled
                    className="border-blue-300 text-blue-600 bg-blue-50 text-xs flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Other User Completed
                  </Button>
                )}
              </div>
            )}

            {/* Cancel button for requester's pending requests */}
            {exchange.status === "pending" && isRequester && (
              <Button 
                variant="outline" 
                onClick={handleDisapprove}
                disabled={updateExchangeMutation.isPending}
                className="text-xs w-full"
                size="sm"
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout - hidden on mobile */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getStatusBadge(exchange.status)}
              <span className="text-sm text-gray-500">
                Exchange #{exchange.id.slice(0, 8)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {formatDistanceToNow(new Date(exchange.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {isRequester ? "Your Site" : `${exchange.requester?.firstName || "Unknown"}'s Site`}
            </h4>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">
                  {exchange.requesterSite ? getInitials(exchange.requesterSite.domain) : "?"}
                </span>
              </div>
              <div className="min-w-0">
                <h5 className="font-semibold text-gray-900">
                  {exchange.requesterSite?.domain || "Unknown"}
                </h5>
                <p className="text-xs text-gray-400 mt-1">
                  Owner: {exchange.requester ? `${exchange.requester.firstName} ${exchange.requester.lastName}` : "Unknown"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  DA: {exchange.requesterSite?.domainAuthority || "?"} | 
                  Traffic: {exchange.requesterSite?.monthlyTraffic?.toLocaleString() || "0"}/mo
                </p>
              </div>
              {/* Link Type and Category Badges in white space */}
              <div className="flex items-center space-x-2 ml-4">
                <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                  exchange.requesterSite?.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {exchange.requesterSite?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                </div>
                {exchange.requesterSite?.category && (
                  <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                    {exchange.requesterSite.category}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {isRequester ? `${exchange.requestedUser?.firstName || "Unknown"}'s Site` : "Your Site"}
            </h4>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">
                  {exchange.requestedSite ? getInitials(exchange.requestedSite.domain) : "?"}
                </span>
              </div>
              <div className="min-w-0">
                <h5 className="font-semibold text-gray-900">
                  {exchange.requestedSite?.domain || "Unknown"}
                </h5>
                <p className="text-xs text-gray-400 mt-1">
                  Owner: {exchange.requestedUser ? `${exchange.requestedUser.firstName} ${exchange.requestedUser.lastName}` : "Unknown"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  DA: {exchange.requestedSite?.domainAuthority || "?"} | 
                  Traffic: {exchange.requestedSite?.monthlyTraffic?.toLocaleString() || "0"}/mo
                </p>
              </div>
              {/* Link Type and Category Badges in white space */}
              <div className="flex items-center space-x-2 ml-4">
                <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                  exchange.requestedSite?.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {exchange.requestedSite?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                </div>
                {exchange.requestedSite?.category && (
                  <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                    {exchange.requestedSite.category}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          {exchange.message && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{exchange.message}"</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {(exchange.status === "active" || exchange.status === "delivered") && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Exchange in progress</span>
              </div>
            )}
            <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Exchange Request Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Selected Site:</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{exchange.requesterSite?.domain || "Unknown"}</p>
                      <p className="text-sm text-gray-500">
                        DA: {exchange.requesterSite?.domainAuthority || "?"} | 
                        Traffic: {exchange.requesterSite?.monthlyTraffic?.toLocaleString() || "0"}/mo
                      </p>
                      <div className="mt-2">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                          exchange.requesterSite?.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {exchange.requesterSite?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {exchange.message && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Message:</h4>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">"{exchange.message}"</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requester:</h4>
                    <p className="text-sm text-gray-600">
                      {exchange.requester ? `${exchange.requester.firstName} ${exchange.requester.lastName}` : "Unknown"}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            {canAcceptReject && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDisapprove}
                  disabled={updateExchangeMutation.isPending}
                  className="text-red-600 border-red-300 hover:bg-red-50 w-full md:w-auto"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {updateExchangeMutation.isPending ? "Processing..." : "Disapprove"}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={updateExchangeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updateExchangeMutation.isPending ? "Processing..." : "Approve"}
                </Button>
              </>
            )}
            
            {(exchange.status === "active" || exchange.status === "delivered") && (
              <>
                <Button onClick={() => onOpenChat(exchange.id)} size="sm" className="w-full md:w-auto">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
                {!currentUserCompleted ? (
                  <Button 
                    variant="outline"
                    onClick={handleMarkComplete}
                    disabled={updateExchangeMutation.isPending}
                    className="border-green-300 text-green-600 hover:bg-green-50 w-full md:w-auto"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {updateExchangeMutation.isPending ? "Processing..." : "Mark Complete"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    disabled
                    className="border-green-500 text-green-700 bg-green-50 w-full md:w-auto"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed by You
                  </Button>
                )}
                {otherUserCompleted && (
                  <Button 
                    variant="outline"
                    disabled
                    className="border-blue-300 text-blue-600 bg-blue-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Other User Completed
                  </Button>
                )}
              </>
            )}
            
            {exchange.status === "completed" && (
              <Button variant="outline" disabled>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat Closed
              </Button>
            )}
            
            {exchange.status === "pending" && isRequester && (
              <Button 
                variant="outline" 
                onClick={handleDisapprove}
                disabled={updateExchangeMutation.isPending}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
