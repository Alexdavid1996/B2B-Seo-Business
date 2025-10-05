import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

interface RejectionReason {
  id: string;
  reasonText: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const rejectionReasonSchema = z.object({
  reasonText: z.string().min(1, "Reason text is required").max(200, "Reason text too long"),
  description: z.string().max(500, "Description too long").optional(),
  isActive: z.boolean().default(true),
});

type RejectionReasonFormData = z.infer<typeof rejectionReasonSchema>;

export default function AdminRejectionReasons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReason, setSelectedReason] = useState<RejectionReason | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch rejection reasons
  const { data: rejectionReasons = [], isLoading } = useQuery<RejectionReason[]>({
    queryKey: ["/api/admin/rejection-reasons"]
  });

  // Mutations
  const createReasonMutation = useMutation({
    mutationFn: (data: RejectionReasonFormData) => 
      apiRequest("/api/admin/rejection-reasons", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rejection-reasons"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Rejection reason created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create rejection reason", variant: "destructive" });
    }
  });

  const updateReasonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RejectionReasonFormData> }) =>
      apiRequest(`/api/admin/rejection-reasons/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rejection-reasons"] });
      setIsDialogOpen(false);
      setSelectedReason(null);
      form.reset();
      toast({ title: "Rejection reason updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update rejection reason", variant: "destructive" });
    }
  });

  const deleteReasonMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/rejection-reasons/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rejection-reasons"] });
      toast({ title: "Rejection reason deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete rejection reason", variant: "destructive" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest(`/api/admin/rejection-reasons/${id}`, { method: "PATCH", body: { isActive } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rejection-reasons"] });
      toast({ title: "Rejection reason status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update rejection reason status", variant: "destructive" });
    }
  });

  // Form
  const form = useForm<RejectionReasonFormData>({
    resolver: zodResolver(rejectionReasonSchema),
    defaultValues: {
      reasonText: "",
      description: "",
      isActive: true,
    }
  });

  const handleEdit = (reason: RejectionReason) => {
    setSelectedReason(reason);
    form.reset({
      reasonText: reason.reasonText,
      description: reason.description || "",
      isActive: reason.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedReason(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: RejectionReasonFormData) => {
    if (selectedReason) {
      updateReasonMutation.mutate({ id: selectedReason.id, data });
    } else {
      createReasonMutation.mutate(data);
    }
  };

  const handleToggleActive = (reason: RejectionReason) => {
    toggleActiveMutation.mutate({ id: reason.id, isActive: !reason.isActive });
  };

  const handleDelete = (id: string) => {
    deleteReasonMutation.mutate(id);
  };

  if (isLoading) {
    return <div>Loading rejection reasons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Rejection Reasons</h3>
          <p className="text-sm text-muted-foreground">
            Manage rejection reasons for domains, exchanges, guest posts, deposits, and withdrawals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rejection Reason
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedReason ? 'Edit Rejection Reason' : 'Add Rejection Reason'}
              </DialogTitle>
              <DialogDescription>
                Create or edit rejection reasons used across the platform
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="reasonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason Text *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter rejection reason..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional details about this rejection reason..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReasonMutation.isPending || updateReasonMutation.isPending}
                  >
                    {selectedReason ? 'Update' : 'Create'} Reason
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reason Text</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rejectionReasons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No rejection reasons found. Create your first rejection reason.
                </TableCell>
              </TableRow>
            ) : (
              rejectionReasons.map((reason) => (
                <TableRow key={reason.id}>
                  <TableCell className="font-medium">
                    {reason.reasonText}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {reason.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={reason.isActive ? "default" : "secondary"}>
                      {reason.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(reason.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(reason)}
                        title={reason.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {reason.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reason)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Rejection Reason</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{reason.reasonText}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(reason.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}