import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  ArrowLeftRight, 
  ShoppingCart, 
  Users, 
  Calendar,
  DollarSign,
  AlertTriangle,
  Mail
} from "lucide-react";
// Format currency helper function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";

interface PendingActivity {
  type: 'order' | 'exchange';
  id: string;
  displayId: string;
  status: string;
  amount?: number;
  createdAt: string;
  buyerEmail?: string;
  sellerEmail?: string;
  requesterEmail?: string;
  requestedEmail?: string;
  domain: string;
  exchangeInfo?: string;
}

export default function AdminPendingActivities() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'guest_post' | 'exchange' | 'delivered' | 'rejected'>('guest_post');
  const [subTab, setSubTab] = useState<'pending' | 'on_going'>('on_going');

  // Query data from all endpoints
  const { data: pendingActivities = [] } = useQuery<PendingActivity[]>({
    queryKey: ["/api/admin/pending-activities"],
  });
  
  const { data: deliveredActivities = [] } = useQuery<PendingActivity[]>({
    queryKey: ["/api/admin/delivered-activities"],
  });
  
  const { data: rejectedActivities = [] } = useQuery<PendingActivity[]>({
    queryKey: ["/api/admin/rejected-activities"],
  });

  // Get the appropriate data based on active tab and filter by type and status
  const getFilteredActivities = () => {
    let sourceActivities: PendingActivity[] = [];
    
    if (activeTab === 'guest_post') {
      // Guest Post tab: only show on_going orders (no pending since orders go directly to on_going)
      sourceActivities = pendingActivities.filter(activity => 
        activity.type === 'order' && activity.status === 'on_going'
      );
    } else if (activeTab === 'exchange') {
      // Exchange tab: show pending and ongoing exchanges
      if (subTab === 'pending') {
        sourceActivities = pendingActivities.filter(activity => 
          activity.type === 'exchange' && activity.status === 'pending'
        );
      } else if (subTab === 'on_going') {
        sourceActivities = pendingActivities.filter(activity => 
          activity.type === 'exchange' && activity.status === 'active'
        );
      }
    } else if (activeTab === 'delivered') {
      // Delivered tab: show completed transactions for both types
      sourceActivities = deliveredActivities.filter(activity => 
        activity.status === 'delivered' || activity.status === 'completed'
      );
    } else if (activeTab === 'rejected') {
      // Rejected tab: show rejected/cancelled/refunded for both types
      sourceActivities = rejectedActivities.filter(activity => 
        ['rejected', 'cancelled', 'declined', 'refunded'].includes(activity.status)
      );
    }
    
    return sourceActivities;
  };

  const filteredActivities = getFilteredActivities();

  const deleteActivityMutation = useMutation({
    mutationFn: async (activity: PendingActivity) => {
      const endpoint = activity.type === 'order' 
        ? `/api/admin/pending-activities/orders/${activity.id}/delete`
        : `/api/admin/pending-activities/exchanges/${activity.id}/delete`;
      
      return await apiRequest(endpoint, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, activity) => {
      // Invalidate all activity queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivered-activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rejected-activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      const activityType = activity.type === 'order' ? 'Guest Post Order' : 'Exchange';
      const refundMessage = activity.type === 'order' ? ' Buyer has been refunded automatically.' : '';
      
      toast({
        title: "Activity Deleted",
        description: `${activityType} #${activity.displayId} has been deleted successfully.${refundMessage}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (activity: PendingActivity) => {
      const endpoint = activity.type === 'order' 
        ? `/api/admin/reminders/guest-post/${activity.id}`
        : `/api/admin/reminders/exchange/${activity.id}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder');
      }
      
      return data;
    },
    onSuccess: (data, activity) => {
      const activityType = activity.type === 'order' ? 'Guest Post' : 'Exchange';
      toast({
        title: "Reminder Sent",
        description: `Reminder email sent successfully for ${activityType} #${activity.displayId}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Reminder Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_going': 
      case 'active': 
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delivered': 
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': 
      case 'rejected': 
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state for any of the queries
  const isLoading = false; // We'll handle loading state in UI

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Activities</h1>
        </div>
        
        {/* Main tabs for status categories */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
            Pending (Loading...)
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-gray-600">
            Delivered (Loading...)
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-gray-600">
            Rejected (Loading...)
          </button>
        </div>
        
        {/* Sub-tabs for types */}
        <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
          <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
            Guest Posts (Loading...)
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-gray-600">
            Exchanges (Loading...)
          </button>
        </div>
        
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Activities</h1>
          <p className="text-gray-600 mt-1">
            Manage orders and exchanges by status category
          </p>
        </div>
      </div>

      {/* Main tabs for activity types */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setActiveTab('guest_post');
            setSubTab('on_going');
          }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'guest_post'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Guest Post ({
            pendingActivities.filter(a => a.type === 'order' && a.status === 'on_going').length
          })
        </button>
        <button
          onClick={() => {
            setActiveTab('exchange');
            setSubTab('pending');
          }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'exchange'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Exchange ({
            pendingActivities.filter(a => a.type === 'exchange' && (a.status === 'pending' || a.status === 'on_going' || a.status === 'active')).length
          })
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'delivered'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Delivered ({deliveredActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'rejected'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rejected ({rejectedActivities.length})
        </button>
      </div>

      {/* Sub-tabs - show for Guest Post and Exchange */}
      {(activeTab === 'guest_post' || activeTab === 'exchange') && (
        <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
          {activeTab === 'guest_post' && (
            <button
              onClick={() => setSubTab('on_going')}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm"
            >
              On Going ({
                pendingActivities.filter(a => a.type === 'order' && a.status === 'on_going').length
              })
            </button>
          )}
          
          {activeTab === 'exchange' && (
            <>
              <button
                onClick={() => setSubTab('pending')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  subTab === 'pending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending ({
                  pendingActivities.filter(a => a.type === 'exchange' && a.status === 'pending').length
                })
              </button>
              <button
                onClick={() => setSubTab('on_going')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  subTab === 'on_going'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                On Going ({
                  pendingActivities.filter(a => a.type === 'exchange' && a.status === 'active').length
                })
              </button>
            </>
          )}
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {
                activeTab === 'guest_post' ? 'Ongoing Guest Posts' :
                activeTab === 'exchange' ? (subTab === 'pending' ? 'Pending Exchanges' : 'Ongoing Exchanges') :
                activeTab === 'delivered' ? 'Delivered Activities' :
                'Rejected Activities'
              }
            </h3>
            <p className="text-gray-600">
              {activeTab === 'guest_post'
                ? 'All guest post orders are running smoothly.'
                : activeTab === 'exchange' 
                ? `All ${subTab === 'pending' ? 'exchange requests' : 'ongoing exchanges'} are running smoothly.`
                : activeTab === 'delivered'
                ? 'No activities have been delivered yet.'
                : 'No activities have been rejected.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredActivities.map((activity) => (
            <Card key={`${activity.type}-${activity.id}`} className="border-l-4 border-l-yellow-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {activity.type === 'order' ? (
                        <ShoppingCart className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ArrowLeftRight className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {activity.type === 'order' ? 'Guest Post Order' : 'Link Exchange'}
                        </h3>
                        <Badge variant="secondary" className="font-mono text-xs">
                          #{activity.displayId || activity.id.slice(0, 8)}
                        </Badge>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {activity.type === 'order' ? (
                              `${activity.buyerEmail} → ${activity.sellerEmail}`
                            ) : (
                              `${activity.requesterEmail} ↔ ${activity.requestedEmail}`
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(activity.createdAt)}</span>
                        </div>
                        
                        {activity.amount && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">{formatCurrency(activity.amount)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Domain:</span> {activity.domain}
                        {activity.exchangeInfo && (
                          <>
                            <br />
                            <span className="font-medium">Exchange:</span> {activity.exchangeInfo}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons for pending activities */}
                  {activeTab !== 'delivered' && activeTab !== 'rejected' && (
                    <div className="flex space-x-2">
                      {/* Send Reminder Button - only show for Guest Post and Exchange tabs */}
                      {(activeTab === 'guest_post' || activeTab === 'exchange') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={sendReminderMutation.isPending}
                          onClick={() => sendReminderMutation.mutate(activity)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {sendReminderMutation.isPending ? 'Sending...' : 'Send Reminder'}
                        </Button>
                      )}
                      
                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={deleteActivityMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span>Delete {activity.type === 'order' ? 'Order' : 'Exchange'}</span>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You are about to permanently delete{' '}
                            <span className="font-semibold">
                              {activity.type === 'order' ? 'Guest Post Order' : 'Link Exchange'}{' '}
                              #{activity.displayId || activity.id.slice(0, 8)}
                            </span>
                            .
                            
                            {activity.type === 'order' && activity.amount && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-800">
                                  <strong>Automatic Refund:</strong> The buyer will be refunded{' '}
                                  <span className="font-semibold">{formatCurrency(activity.amount)}</span>{' '}
                                  to their wallet balance.
                                </p>
                              </div>
                            )}
                            
                            <p className="mt-3 text-sm">
                              This action cannot be undone. Are you sure you want to continue?
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteActivityMutation.mutate(activity)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleteActivityMutation.isPending ? 'Deleting...' : 'Delete Activity'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}