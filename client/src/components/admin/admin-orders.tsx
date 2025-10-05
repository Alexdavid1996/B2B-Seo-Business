import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, CheckCircle, X, Edit } from "lucide-react";

interface Order {
  id: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  listing: {
    site: {
      domain: string;
      title: string;
    };
  };
  amount: number;
  serviceFee: number;
  status: string;
  requirements?: string;
  deliveryUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Exchange {
  id: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  requestedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  requesterSite: {
    domain: string;
    title: string;
  };
  requestedSite: {
    domain: string;
    title: string;
  };
  status: string;
  deliveryUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: exchanges = [], isLoading: exchangesLoading } = useQuery<Exchange[]>({
    queryKey: ["/api/admin/exchanges"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: { orderId: string; status?: string; [key: string]: any }) => {
      await apiRequest(`/api/admin/orders/${data.orderId}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order updated successfully" });
      setSelectedOrder(null);
      setEditingOrder(null);
      setShowEditDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete order", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'accepted': return 'secondary';
      case 'in_progress': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => ['accepted', 'in_progress'].includes(order.status));
  const completedOrders = orders.filter(order => ['completed', 'cancelled'].includes(order.status));

  const activeExchanges = exchanges.filter(exchange => ['active', 'delivered'].includes(exchange.status));

  if (ordersLoading || exchangesLoading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Orders ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="active">Active Exchanges ({activeExchanges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.buyer.firstName} {order.buyer.lastName}</div>
                          <div className="text-sm text-gray-500">{order.buyer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.seller.firstName} {order.seller.lastName}</div>
                          <div className="text-sm text-gray-500">{order.seller.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.listing.site.domain}</div>
                          <div className="text-sm text-gray-500">{order.listing.site.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>${order.serviceFee.toFixed(2)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingOrder({ ...order });
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">Buyer Information</h4>
                                      <p>{selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}</p>
                                      <p className="text-sm text-gray-600">{selectedOrder.buyer.email}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Seller Information</h4>
                                      <p>{selectedOrder.seller.firstName} {selectedOrder.seller.lastName}</p>
                                      <p className="text-sm text-gray-600">{selectedOrder.seller.email}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold">Requirements</h4>
                                    <p className="text-sm">{selectedOrder.requirements || 'No specific requirements'}</p>
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => updateOrderMutation.mutate({ orderId: selectedOrder.id, status: 'completed' })}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => {
                                        if (confirm('Are you sure you want to cancel this order?')) {
                                          updateOrderMutation.mutate({ orderId: selectedOrder.id, status: 'cancelled' });
                                        }
                                      }}
                                      className="flex-1"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel Order
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Exchanges</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exchange ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Requested User</TableHead>
                    <TableHead>Sites</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeExchanges.map((exchange) => (
                    <TableRow key={exchange.id}>
                      <TableCell className="font-mono text-sm">{exchange.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exchange.requester.firstName} {exchange.requester.lastName}</div>
                          <div className="text-sm text-gray-500">{exchange.requesterSite.domain}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exchange.requestedUser.firstName} {exchange.requestedUser.lastName}</div>
                          <div className="text-sm text-gray-500">{exchange.requestedSite.domain}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{exchange.requesterSite.title} ↔ {exchange.requestedSite.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(exchange.status)}>
                          {exchange.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(exchange.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.buyer.firstName} {order.buyer.lastName}</div>
                          <div className="text-sm text-gray-500">{order.buyer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.seller.firstName} {order.seller.lastName}</div>
                          <div className="text-sm text-gray-500">{order.seller.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.listing.site.domain}</div>
                          <div className="text-sm text-gray-500">{order.listing.site.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order: {editingOrder?.id.slice(0, 8)}...</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    value={editingOrder.amount ? editingOrder.amount.toString() : ''}
                    onChange={(e) => setEditingOrder({ 
                      ...editingOrder, 
                      amount: e.target.value ? parseFloat(e.target.value) : 0 
                    })}
                  />
                </div>
                <div>
                  <Label>Service Fee ($)</Label>
                  <Input
                    type="number"
                    value={editingOrder.serviceFee ? editingOrder.serviceFee.toString() : ''}
                    onChange={(e) => setEditingOrder({ 
                      ...editingOrder, 
                      serviceFee: e.target.value ? parseFloat(e.target.value) : 0 
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Requirements</Label>
                <Textarea
                  value={editingOrder.requirements || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, requirements: e.target.value })}
                  placeholder="Order requirements and specifications"
                />
              </div>

              <div>
                <Label>Delivery URL</Label>
                <Input
                  value={editingOrder.deliveryUrl || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, deliveryUrl: e.target.value })}
                  placeholder="Delivery URL for completed work"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    updateOrderMutation.mutate({
                      orderId: editingOrder.id,
                      amount: editingOrder.amount,
                      serviceFee: editingOrder.serviceFee,
                      requirements: editingOrder.requirements,
                      deliveryUrl: editingOrder.deliveryUrl
                    });
                  }}
                  disabled={updateOrderMutation.isPending}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}