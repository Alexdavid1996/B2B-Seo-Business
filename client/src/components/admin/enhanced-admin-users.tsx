import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, Shield, DollarSign, Search, Ban, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  createdAt: string;
  wallet?: {
    balance: number;
  };
}

interface UserSummary {
  totalSales: number;
  totalExchanges: number;
  activeDomains: number;
  balance: number;
}

interface BannedItem {
  id: string;
  ipAddress?: string;
  email?: string;
  reason: string;
  bannedBy: string;
  createdAt: string;
  isActive: boolean;
}

interface LockedIP {
  ipAddress: string;
  attemptCount: number;
  lastAttempt: string;
  lockedUntil: string;
  lastEmail: string;
}

export default function EnhancedAdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [banIpAddress, setBanIpAddress] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banEmail, setBanEmail] = useState('');
  const [emailBanReason, setEmailBanReason] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: bannedIps = [] } = useQuery<BannedItem[]>({
    queryKey: ["/api/admin/banned-ips"],
  });

  const { data: bannedEmails = [] } = useQuery<BannedItem[]>({
    queryKey: ["/api/admin/banned-emails"],
  });
  
  const { data: lockedIPs = [] } = useQuery<LockedIP[]>({
    queryKey: ["/api/admin/security/locked-ips"],
  });

  // Get user summary stats
  const fetchUserSummary = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/summary`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user summary');
      }
      
      const data = await response.json();
      setUserSummary(data);
    } catch (error) {
      toast({ title: "Failed to fetch user summary", variant: "destructive" });
    }
  };

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
      await apiRequest("/api/admin/user-balance", {
        method: "POST",
        body: {
          userId: data.userId,
          operation: data.action === 'deduct' ? 'subtract' : data.action,
          amount: data.amount
        },
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

  const foundUserBalanceMutation = useMutation({
    mutationFn: async (data: { userId: string; operation: 'add' | 'subtract'; amount: number }) => {
      return await apiRequest("/api/admin/user-balance", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Balance updated successfully" });
      setBalanceAmount('');
      // Update the foundUser balance display
      if (foundUser) {
        setFoundUser({
          ...foundUser,
          balance: response.newBalance
        });
      }
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update balance", variant: "destructive" });
    },
  });

  const searchUserByEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("/api/admin/user-balance-by-email", {
        method: "POST",
        body: { email },
      });
    },
    onSuccess: (data) => {
      setFoundUser(data);
      toast({ title: "User found successfully" });
    },
    onError: () => {
      setFoundUser(null);
      toast({ title: "User not found", variant: "destructive" });
    },
  });

  const banIpMutation = useMutation({
    mutationFn: async (data: { ipAddress: string; reason: string }) => {
      return await apiRequest("/api/admin/ban-ip", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-ips"] });
      toast({ title: "IP address banned successfully" });
      setBanIpAddress('');
      setBanReason('');
    },
    onError: () => {
      toast({ title: "Failed to ban IP address", variant: "destructive" });
    },
  });

  const banEmailMutation = useMutation({
    mutationFn: async (data: { email: string; reason: string }) => {
      return await apiRequest("/api/admin/ban-email", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-emails"] });
      toast({ title: "Email address banned successfully" });
      setBanEmail('');
      setEmailBanReason('');
    },
    onError: () => {
      toast({ title: "Failed to ban email address", variant: "destructive" });
    },
  });

  const handleStatusChange = (user: User, newStatus: string) => {
    editUserMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleBanUser = (user: User) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    editUserMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleBalanceUpdate = () => {
    if (!selectedUser || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount); // Keep as dollars
    balanceMutation.mutate({
      userId: selectedUser.id,
      action: balanceAction,
      amount: amount,
    });
  };

  const handleFoundUserBalanceUpdate = (operation: 'add' | 'subtract') => {
    if (!foundUser || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount); // Keep as dollars
    
    foundUserBalanceMutation.mutate({
      userId: foundUser.id,
      operation,
      amount: amount,
    });
  };

  const handleSearchUser = () => {
    if (!searchEmail.trim()) return;
    searchUserByEmailMutation.mutate(searchEmail.trim());
  };

  const handleBanIp = () => {
    if (!banIpAddress.trim()) return;
    banIpMutation.mutate({ 
      ipAddress: banIpAddress.trim(), 
      reason: banReason.trim() || "Banned by admin" 
    });
  };

  const handleBanEmail = () => {
    if (!banEmail.trim()) return;
    banEmailMutation.mutate({ 
      email: banEmail.trim(), 
      reason: emailBanReason.trim() || "Banned by admin" 
    });
  };

  const unlockIpMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      await apiRequest("/api/admin/security/unlock-ip", {
        method: "POST",
        body: { ipAddress },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/locked-ips"] });
      toast({ title: "IP address unlocked successfully" });
    },
    onError: () => {
      toast({ title: "Failed to unlock IP address", variant: "destructive" });
    },
  });

  const unbanIpMutation = useMutation({
    mutationFn: async (ipId: string) => {
      await apiRequest(`/api/admin/banned-ips/${ipId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-ips"] });
      toast({ title: "IP address unbanned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to unban IP address", variant: "destructive" });
    },
  });

  const unbanEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      await apiRequest(`/api/admin/banned-emails/${emailId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banned-emails"] });
      toast({ title: "Email address unbanned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to unban email address", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="balance">User Balance</TabsTrigger>
          <TabsTrigger value="security">Security Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
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
                          <div className="mb-1">
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="mr-2">
                              {user.status.toUpperCase()}
                            </Badge>
                          </div>
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
                      <TableCell>${(user.wallet?.balance || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-gray-600">{user.registrationIp || 'N/A'}</TableCell>
                      <TableCell className="text-xs text-gray-600">{user.lastLoginIp || 'N/A'}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* View Details */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedUser(user);
                                  fetchUserSummary(user.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</h4>
                                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                  </div>
                                  {userSummary && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-2xl font-bold">{userSummary.totalSales}</div>
                                        <div className="text-sm text-gray-600">Total Sales</div>
                                      </div>
                                      <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-2xl font-bold">{userSummary.totalExchanges}</div>
                                        <div className="text-sm text-gray-600">Total Exchanges</div>
                                      </div>
                                      <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-2xl font-bold">{userSummary.activeDomains}</div>
                                        <div className="text-sm text-gray-600">Active Domains</div>
                                      </div>
                                      <div className="text-center p-4 bg-gray-50 rounded">
                                        <div className="text-2xl font-bold">${userSummary.balance.toFixed(2)}</div>
                                        <div className="text-sm text-gray-600">Balance</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Ban/Unban User */}
                          <Button 
                            variant={user.status === 'active' ? 'destructive' : 'default'} 
                            size="sm"
                            onClick={() => handleBanUser(user)}
                          >
                            <Ban className="h-4 w-4" />
                            {user.status === 'active' ? 'Ban' : 'Unban'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banned IPs */}
            <Card>
              <CardHeader>
                <CardTitle>Banned IP Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="IP Address"
                      value={banIpAddress}
                      onChange={(e) => setBanIpAddress(e.target.value)}
                    />
                    <Input 
                      placeholder="Reason"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                    <Button onClick={handleBanIp}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bannedIps.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.ipAddress}</div>
                          <div className="text-sm text-gray-600">{item.reason}</div>
                        </div>
                        <Badge variant="destructive">Banned</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banned Emails */}
            <Card>
              <CardHeader>
                <CardTitle>Banned Email Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Email Address"
                      value={banEmail}
                      onChange={(e) => setBanEmail(e.target.value)}
                    />
                    <Input 
                      placeholder="Reason"
                      value={emailBanReason}
                      onChange={(e) => setEmailBanReason(e.target.value)}
                    />
                    <Button onClick={handleBanEmail}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bannedEmails.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.email}</div>
                          <div className="text-sm text-gray-600">{item.reason}</div>
                        </div>
                        <Badge variant="destructive">Banned</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>User Balance Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search User */}
                <div className="space-y-4">
                  <div>
                    <Label>Search User by Email</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Enter user email address"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                      />
                      <Button onClick={handleSearchUser}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Found User */}
                  {foundUser && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <h4 className="font-medium">{foundUser.firstName} {foundUser.lastName}</h4>
                        <p className="text-sm text-gray-600">{foundUser.email}</p>
                        <p className="text-lg font-bold">Current Balance: ${foundUser.balance.toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input 
                          type="number"
                          placeholder="Enter amount"
                          value={balanceAmount}
                          onChange={(e) => setBalanceAmount(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleFoundUserBalanceUpdate('add')}
                          className="flex-1"
                        >
                          Add Balance
                        </Button>
                        <Button 
                          onClick={() => handleFoundUserBalanceUpdate('subtract')}
                          variant="destructive"
                          className="flex-1"
                        >
                          Extract Balance
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Banned IPs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Banned IP Addresses</CardTitle>
                <p className="text-sm text-gray-600">
                  IP addresses that have been permanently banned
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Enter IP address to ban"
                      value={banIpAddress}
                      onChange={(e) => setBanIpAddress(e.target.value)}
                    />
                    <Input 
                      placeholder="Reason for ban"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                    <Button onClick={handleBanIp}>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban IP
                    </Button>
                  </div>
                  
                  {bannedIps.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No IP addresses are currently banned
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                        <div>IP Address</div>
                        <div>Reason</div>
                        <div>Banned Date</div>
                        <div>Action</div>
                      </div>
                      {bannedIps.map((banned) => (
                        <div key={banned.id} className="grid grid-cols-4 gap-4 items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="font-mono text-sm">{banned.ipAddress}</div>
                          <div className="text-sm text-gray-600">{banned.reason}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(banned.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => unbanIpMutation.mutate(banned.id)}
                              disabled={unbanIpMutation.isPending}
                            >
                              Unban
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Banned Emails Section */}
            <Card>
              <CardHeader>
                <CardTitle>Banned Email Addresses</CardTitle>
                <p className="text-sm text-gray-600">
                  Email addresses that have been banned from registration
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Enter email address to ban"
                      value={banEmail}
                      onChange={(e) => setBanEmail(e.target.value)}
                    />
                    <Input 
                      placeholder="Reason for ban"
                      value={emailBanReason}
                      onChange={(e) => setEmailBanReason(e.target.value)}
                    />
                    <Button onClick={handleBanEmail}>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban Email
                    </Button>
                  </div>
                  
                  {bannedEmails.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No email addresses are currently banned
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                        <div>Email Address</div>
                        <div>Reason</div>
                        <div>Banned Date</div>
                        <div>Action</div>
                      </div>
                      {bannedEmails.map((banned) => (
                        <div key={banned.id} className="grid grid-cols-4 gap-4 items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="text-sm">{banned.email}</div>
                          <div className="text-sm text-gray-600">{banned.reason}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(banned.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => unbanEmailMutation.mutate(banned.id)}
                              disabled={unbanEmailMutation.isPending}
                            >
                              Unban
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}