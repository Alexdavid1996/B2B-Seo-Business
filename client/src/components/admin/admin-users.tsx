import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Ban, DollarSign, Trash2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: string;
  role: string;
  registrationIp?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
  createdAt: string;
  wallet?: {
    balance: number;
  };
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/admin/users?search=${encodeURIComponent(searchTerm)}`
        : '/api/admin/users';
      const response = await fetch(url);
      return response;
    }
  });

  const editUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      await apiRequest(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        body: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const balanceMutation = useMutation({
    mutationFn: async (data: { userId: string; action: 'add' | 'deduct'; amount: number }) => {
      await apiRequest("POST", `/api/admin/users/${data.userId}/balance`, {
        action: data.action,
        amount: data.amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Balance updated successfully" });
      setSelectedUser(null);
      setBalanceAmount('');
    },
    onError: () => {
      toast({ title: "Failed to update balance", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleStatusChange = (user: User, newStatus: string) => {
    editUserMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleBalanceUpdate = () => {
    if (!selectedUser || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount); // Keep as dollars for API
    balanceMutation.mutate({
      userId: selectedUser.id,
      action: balanceAction,
      amount: amount,
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Registration IP</TableHead>
                <TableHead>Last Login IP</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(user.wallet?.balance || 0)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.registrationIp || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.lastLoginIp || 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                          <DialogHeader className="flex-shrink-0">
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4">
                              <div>
                                <Label>Status</Label>
                                <Select 
                                  value={editingUser.status} 
                                  onValueChange={(value) => handleStatusChange(editingUser, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                          <DialogHeader className="flex-shrink-0">
                            <DialogTitle>Manage Balance</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Current Balance</Label>
                              <p className="text-lg font-semibold">{formatCurrency(selectedUser?.wallet?.balance || 0)}</p>
                            </div>
                            <div>
                              <Label>Action</Label>
                              <Select value={balanceAction} onValueChange={(value: 'add' | 'deduct') => setBalanceAction(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="add">Add Funds</SelectItem>
                                  <SelectItem value="deduct">Deduct Funds</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Amount ($)</Label>
                              <Input
                                type="number"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>
                            <Button onClick={handleBalanceUpdate} className="w-full">
                              Update Balance
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this user?')) {
                            deleteUserMutation.mutate(user.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}