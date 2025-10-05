import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAppTimezone } from "@/hooks/use-app-timezone";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  MessageSquare, 
  Calendar,
  ToggleLeft,
  AlertCircle 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { GlobalNotification } from "@shared/schema";

interface NotificationFormData {
  message: string;
  isActive: boolean;
  durationDays: number;
  flashTime: number;
}

export default function GlobalNotifications() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<GlobalNotification | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>({
    message: "",
    isActive: true,
    durationDays: 30,
    flashTime: 8,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { appTimezone } = useAppTimezone();

  const { data: notifications = [], isLoading } = useQuery<GlobalNotification[]>({
    queryKey: ["/api/global-notifications"],
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      return apiRequest("/api/admin/global-notifications", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-notifications"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Global notification created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create notification",
        variant: "destructive",
      });
    },
  });

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NotificationFormData> }) => {
      return apiRequest(`/api/admin/global-notifications/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-notifications"] });
      setIsEditDialogOpen(false);
      setEditingNotification(null);
      resetForm();
      toast({
        title: "Success",
        description: "Global notification updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification",
        variant: "destructive",
      });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/global-notifications/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-notifications"] });
      toast({
        title: "Success",
        description: "Global notification deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive",
      });
    },
  });

  // Toggle notification status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/admin/global-notifications/${id}`, {
        method: "PATCH",
        body: { isActive },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-notifications"] });
      toast({
        title: "Success",
        description: "Notification status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      message: "",
      isActive: true,
      durationDays: 30,
      flashTime: 8,
    });
  };

  const handleCreate = () => {
    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (notification: GlobalNotification) => {
    setEditingNotification(notification);
    setFormData({
      message: notification.message,
      isActive: notification.isActive,
      durationDays: notification.durationDays || 30,
      flashTime: notification.flashTime || 8,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingNotification) return;
    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({
      id: editingNotification.id,
      data: formData,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  const isExpired = (notification: GlobalNotification) => {
    if (!notification.durationDays) return false;
    
    // Calculate expiry using system timezone
    const createdAt = new Date(notification.createdAt);
    const now = new Date();
    const expiryDate = new Date(createdAt.getTime() + (notification.durationDays * 24 * 60 * 60 * 1000));
    
    // Compare using system timezone
    const nowInSystemTZ = new Date(now.toLocaleString("en-US", { timeZone: appTimezone }));
    const expiryInSystemTZ = new Date(expiryDate.toLocaleString("en-US", { timeZone: appTimezone }));
    
    return nowInSystemTZ > expiryInSystemTZ;
  };

  const getDaysRemaining = (notification: GlobalNotification) => {
    if (!notification.durationDays) return null;
    
    // Calculate remaining days using system timezone
    const createdAt = new Date(notification.createdAt);
    const now = new Date();
    const expiryDate = new Date(createdAt.getTime() + (notification.durationDays * 24 * 60 * 60 * 1000));
    
    // Calculate remaining time in system timezone
    const nowInSystemTZ = new Date(now.toLocaleString("en-US", { timeZone: appTimezone }));
    const expiryInSystemTZ = new Date(expiryDate.toLocaleString("en-US", { timeZone: appTimezone }));
    
    const remainingTime = expiryInSystemTZ.getTime() - nowInSystemTZ.getTime();
    const daysRemaining = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Global Notifications</h2>
          <p className="text-muted-foreground">
            Manage platform-wide announcements and notifications
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Global Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter announcement message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.message.length}/500 characters
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-disable after this many days
                  </p>
                </div>
                <div>
                  <Label htmlFor="flashTime">Flash Time (Seconds)</Label>
                  <Input
                    id="flashTime"
                    type="number"
                    min="1"
                    max="300"
                    value={formData.flashTime}
                    onChange={(e) => setFormData({ ...formData, flashTime: parseInt(e.target.value) || 8 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Time between notification changes
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first global notification to communicate with all users
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const expired = isExpired(notification);
            const daysRemaining = getDaysRemaining(notification);

            return (
              <Card key={notification.id} className={expired ? "border-red-200 bg-red-50/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={notification.isActive && !expired ? "default" : "secondary"}>
                          {notification.isActive && !expired ? "Active" : "Inactive"}
                        </Badge>
                        {expired && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                        {daysRemaining !== null && !expired && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {daysRemaining} days left
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-3">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(notification.createdAt).toLocaleDateString()} • 
                        Duration: {notification.durationDays || 30} days
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(notification.id, notification.isActive)}
                        disabled={toggleMutation.isPending}
                      >
                        <ToggleLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(notification)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Global Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                placeholder="Enter announcement message..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/500 characters
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (Days)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-disable after this many days
                </p>
              </div>
              <div>
                <Label htmlFor="edit-flashTime">Flash Time (Seconds)</Label>
                <Input
                  id="edit-flashTime"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.flashTime}
                  onChange={(e) => setFormData({ ...formData, flashTime: parseInt(e.target.value) || 8 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Time between notification changes
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}