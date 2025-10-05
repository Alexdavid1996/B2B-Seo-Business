import { useState, useMemo } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Receipt,
  Ban,
  Filter,
  X,
  Settings,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LiveClock from "@/components/ui/live-clock";
import { formatCurrency } from "@/lib/formatters";

interface FinanceTransaction {
  id: string;
  transactionId: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface WalletTransaction {
  id: string;
  userId: string;
  type: "top_up" | "withdrawal";
  amount: number;
  fee: number;
  status: "processing" | "approved" | "failed" | "rejected";
  paymentMethod?: string;
  withdrawalMethod?: string;
  adminNote?: string;
  rejectionReason?: string;
  processedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  txId?: string; // Add TxID field to interface
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface CryptoTxId {
  id: string;
  txId: string;
  username: string;
  userId: string;
  walletTransactionId: string;
  createdAt: string;
  first_name?: string;
  last_name?: string;
  amount?: number;
  status?: string;
  transaction_date?: string;
}

interface FeeRecord {
  id: string;
  feeType: string;
  username: string;
  email: string;
  amount: number;
  originalAmount: number;
  dateTime: string;
  referenceId: string;
  status: string;
}

interface FilterState {
  username: string;
  transactionId: string;
  dateFrom: string;
  dateTo: string;
}

interface FinanceSetting {
  id: string;
  reason: string;
  type: "deposit" | "withdrawal";
  isActive: boolean;
  createdAt: string;
}

interface AdminFinancesProps {
  userRole?: 'admin' | 'employee';
  isEmployeeView?: boolean;
}

interface FoundUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  balance: number;
}

// Filter component for reuse across different tabs
function FilterSection({ filters, onFilterChange, onClearFilters }: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}) {
  const hasActiveFilters = Object.values(filters).some(value => value.trim() !== '');

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username-filter">Username</Label>
            <Input
              id="username-filter"
              placeholder="Search by username..."
              value={filters.username}
              onChange={(e) => onFilterChange('username', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-id-filter">Transaction ID</Label>
            <Input
              id="transaction-id-filter"
              placeholder="Search by transaction ID..."
              value={filters.transactionId}
              onChange={(e) => onFilterChange('transactionId', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-from-filter">Date From</Label>
            <Input
              id="date-from-filter"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to-filter">Date To</Label>
            <Input
              id="date-to-filter"
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminFinances({ userRole = 'admin', isEmployeeView = false }: AdminFinancesProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceOperation, setBalanceOperation] = useState<"add" | "subtract">("add");

  const [filters, setFilters] = useState<FilterState>({
    username: '',
    transactionId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [transactionToReject, setTransactionToReject] = useState<any>(null);
  const [cryptoTxIdSearch, setCryptoTxIdSearch] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search user by email mutation
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

  // Update user balance mutation
  const updateUserBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, operation }: { userId: string; amount: number; operation: "add" | "subtract" }) => {
      return await apiRequest("/api/admin/user-balance", {
        method: "POST",
        body: { userId, amount, operation },
      });
    },
    onSuccess: () => {
      toast({ title: "Balance updated successfully" });
      setBalanceAmount("");
      // Refresh the found user data
      if (foundUser) {
        searchUserByEmailMutation.mutate(foundUser.email);
      }
    },
    onError: () => {
      toast({ title: "Failed to update balance", variant: "destructive" });
    },
  });

  // Helper functions for user balance management
  const handleSearchUser = () => {
    if (searchEmail.trim()) {
      searchUserByEmailMutation.mutate(searchEmail.trim());
    }
  };

  const handleUpdateBalance = () => {
    if (foundUser && balanceAmount && parseFloat(balanceAmount) > 0) {
      const amountInDollars = parseFloat(balanceAmount);
      updateUserBalanceMutation.mutate({
        userId: foundUser.id,
        amount: amountInDollars,
        operation: balanceOperation,
      });
    }
  };

  // Filter helper functions
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      username: '',
      transactionId: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Data filtering function
  const filterData = <T extends { user?: { firstName?: string; lastName?: string; username?: string; email?: string }; transactionId?: string; createdAt?: string; dateTime?: string; username?: string; referenceId?: string }>(data: T[]): T[] => {
    return data.filter(item => {
      // Username filter
      if (filters.username) {
        const username = item.username || 
                        (item.user?.username) || 
                        `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim();
        if (!username.toLowerCase().includes(filters.username.toLowerCase())) {
          return false;
        }
      }

      // Transaction ID filter (handles different field names)
      if (filters.transactionId) {
        const transactionId = item.transactionId || item.referenceId || '';
        if (!transactionId.toLowerCase().includes(filters.transactionId.toLowerCase())) {
          return false;
        }
      }

      // Date filters
      const itemDate = item.createdAt || item.dateTime || '';
      if (filters.dateFrom && itemDate) {
        const itemDateObj = new Date(itemDate);
        const fromDateObj = new Date(filters.dateFrom);
        if (itemDateObj < fromDateObj) {
          return false;
        }
      }

      if (filters.dateTo && itemDate) {
        const itemDateObj = new Date(itemDate);
        const toDateObj = new Date(filters.dateTo);
        toDateObj.setHours(23, 59, 59, 999); // Include the entire end date
        if (itemDateObj > toDateObj) {
          return false;
        }
      }

      return true;
    });
  };

  // Data fetching
  const { data: allTransactions = [], isLoading: transactionsLoading } = useQuery<FinanceTransaction[]>({
    queryKey: ["/api/admin/transactions"],
    enabled: userRole === 'admin'
  });

  const { data: depositRequests = [], isLoading: depositsLoading } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/admin/wallet-transactions/top_up/processing"],
  });

  const { data: withdrawalRequests = [], isLoading: withdrawalsLoading } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/admin/wallet-transactions/withdrawal/processing"],
  });

  const { data: rejectedTransactions = [], isLoading: rejectedLoading } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/admin/wallet-transactions/failed"],
  });

  const { data: approvedTransactions = [] } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/admin/wallet-transactions/approved"],
  });

  const { data: feeRecords = [], isLoading: feesLoading } = useQuery<FeeRecord[]>({
    queryKey: ["/api/admin/fee-records"],
    enabled: userRole === 'admin'
  });

  // Crypto TxIDs query
  const { data: cryptoTxIds = [], isLoading: cryptoTxIdsLoading } = useQuery<CryptoTxId[]>({
    queryKey: ["/api/admin/crypto-txids"],
    enabled: userRole === 'admin', // Only fetch for admin users
  });

  // Referral records queries
  const { data: pendingReferrals = [], isLoading: pendingReferralsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/referral-records", "pending"],
    queryFn: () => fetch("/api/admin/referral-records?status=pending").then(res => res.json()),
    enabled: userRole === 'admin'
  });

  const { data: paidReferrals = [], isLoading: paidReferralsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/referral-records", "paid"],
    queryFn: () => fetch("/api/admin/referral-records?status=paid").then(res => res.json()),
    enabled: userRole === 'admin'
  });

  // Fetch database rejection reasons instead of old finance settings
  const { data: rejectionReasons = [], isLoading: settingsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/rejection-reasons"]
  });

  const { data: platformSettings = [] } = useQuery<{ key: string; value: string; description: string }[]>({
    queryKey: ["/api/settings"],
    enabled: userRole === 'admin'
  });

  // Fetch all users for approval tracking
  const { data: allUsers = [] } = useQuery<{ id: string; username: string; role: string }[]>({
    queryKey: ["/api/admin/users"],
    select: (data: any[]) => data.map(user => ({ id: user.id, username: user.username, role: user.role }))
  });

  // Helper to get username by ID
  const getUsernameById = (userId: string | null | undefined) => {
    if (!userId) return null;
    const user = allUsers.find(u => u.id === userId);
    return user?.username || null;
  };

  // Mutations with dynamic tab updates
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiRequest(`/api/admin/wallet-transactions/${id}`, {
        method: "PATCH",
        body: { status, rejectionReason: reason }
      }),
    onSuccess: (data, variables) => {
      // Invalidate all wallet transaction queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions/top_up/processing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions/withdrawal/processing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions/failed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet-transactions/rejected"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      
      setRejectionDialogOpen(false);
      setSelectedRejectionReason("");
      setTransactionToReject(null);
      
      const statusText = variables.status === "approved" ? "approved" : "rejected";
      toast({ 
        title: `Transaction ${statusText} successfully`, 
        description: "The transaction has been moved to the appropriate tab." 
      });
    },
    onError: () => {
      toast({ title: "Failed to update transaction", variant: "destructive" });
    },
  });



  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleApproval = (transaction: WalletTransaction, status: "approved" | "failed") => {
    if (status === "failed") {
      setTransactionToReject(transaction);
      setRejectionDialogOpen(true);
      return;
    }
    updateTransactionMutation.mutate({ id: transaction.id, status });
  };

  const handleRejectWithReason = () => {
    if (!selectedRejectionReason.trim()) {
      toast({ title: "Please select a rejection reason", variant: "destructive" });
      return;
    }
    updateTransactionMutation.mutate({
      id: transactionToReject.id,
      status: "failed",
      reason: selectedRejectionReason
    });
  };







  // Badge component for transaction types
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "guest_post_payment":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Receipt className="w-3 h-3 mr-1" />
            Guest Post
          </Badge>
        );
      case "wallet_top_up":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <ArrowUpCircle className="w-3 h-3 mr-1" />
            Top-up
          </Badge>
        );
      case "wallet_withdrawal":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            <ArrowDownCircle className="w-3 h-3 mr-1" />
            Withdrawal
          </Badge>
        );
      case "platform_fee":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <DollarSign className="w-3 h-3 mr-1" />
            Platform Fee
          </Badge>
        );
      case "top_up_fee":
        return (
          <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
            <DollarSign className="w-3 h-3 mr-1" />
            Top-up Fee
          </Badge>
        );
      case "withdrawal_fee":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <DollarSign className="w-3 h-3 mr-1" />
            Withdrawal Fee
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Management</h2>
        <LiveClock 
          className="bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 text-sm" 
          showIcon={true}
          showDate={true}
          useAdminTimezone={true}
        />
      </div>

      <Tabs defaultValue={isEmployeeView ? "deposit-requests" : "all-transactions"} className="space-y-6">
        <div className="w-full">
          <TabsList className={`${isEmployeeView ? 'grid grid-cols-2 w-fit' : 'flex flex-wrap justify-start gap-1 h-auto min-h-[40px] p-1'} bg-muted rounded-lg`}>
          {!isEmployeeView && (
            <TabsTrigger value="all-transactions" className="flex-shrink-0">
              All Transactions ({allTransactions.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="deposit-requests" className="flex-shrink-0">
            Deposit Requests ({depositRequests.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawal-requests" className="flex-shrink-0">
            Withdrawal Requests ({withdrawalRequests.length})
          </TabsTrigger>
          {!isEmployeeView && (
            <TabsTrigger value="fee-records" className="flex-shrink-0">
              Fee Records ({feeRecords.length})
            </TabsTrigger>
          )}
          {!isEmployeeView && (
            <TabsTrigger value="approved" className="flex-shrink-0">
              Approved ({approvedTransactions.length})
            </TabsTrigger>
          )}
          {!isEmployeeView && (
            <TabsTrigger value="rejected" className="flex-shrink-0">
              Rejected ({rejectedTransactions.length})
            </TabsTrigger>
          )}
          {!isEmployeeView && (
            <TabsTrigger value="user-balance" className="flex-shrink-0">
              User Balance
            </TabsTrigger>
          )}
          {!isEmployeeView && (
            <TabsTrigger value="crypto-txids" className="flex-shrink-0">
              Crypto TxIDs ({cryptoTxIds.length})
            </TabsTrigger>
          )}
          {!isEmployeeView && (
            <TabsTrigger value="referral-records" className="flex-shrink-0">
              Referral Records ({pendingReferrals.length + paidReferrals.length})
            </TabsTrigger>
          )}
          </TabsList>
        </div>

        {/* All Transactions Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="all-transactions">
            <FilterSection 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              onClearFilters={clearFilters} 
            />
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : filterData(allTransactions).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No transactions found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date/Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(allTransactions).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.transactionId || `TX-${transaction.id.slice(0, 6).toUpperCase()}`}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {transaction.user.firstName} {transaction.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{transaction.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            {transaction.fee ? 
                              formatCurrency(transaction.fee) : 
                              <span className="text-gray-500">—</span>
                            }
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Deposit Requests Tab */}
        <TabsContent value="deposit-requests">
          <FilterSection 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={clearFilters} 
          />
          <Card>
            <CardHeader>
              <CardTitle>Pending Deposit Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {depositsLoading ? (
                <div className="text-center py-8">Loading deposit requests...</div>
              ) : filterData(depositRequests).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending deposit requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount Submitted</TableHead>
                        <TableHead>Top-Up Fee</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(depositRequests).map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {request.user.firstName} {request.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{request.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(request.amount)}</TableCell>
                          <TableCell>{formatCurrency(request.fee)}</TableCell>
                          <TableCell className="max-w-xs truncate">{request.paymentMethod || "N/A"}</TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Deposit Request Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">User</label>
                                      <p>{request.user.firstName} {request.user.lastName}</p>
                                      <p className="text-sm text-gray-500">{request.user.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Amount Submitted</label>
                                      <p>{formatCurrency(request.amount)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Top-Up Fee</label>
                                      <p>{formatCurrency(request.fee)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Total (Amount + Fee)</label>
                                      <p className="font-semibold text-blue-600">{formatCurrency(request.amount + request.fee)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Payment Method</label>
                                      <p>{request.paymentMethod || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium">(TxID)</label>
                                      {request.txId ? (
                                        <p className="font-mono text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-300 inline-block mt-1">
                                          {request.txId}
                                        </p>
                                      ) : (
                                        <p className="text-gray-400 text-sm">Not provided by user</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => handleApproval(request, "approved")}
                                      disabled={updateTransactionMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleApproval(request, "failed")}
                                      disabled={updateTransactionMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(request, "approved")}
                              disabled={updateTransactionMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApproval(request, "failed")}
                              disabled={updateTransactionMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawal Requests Tab */}
        <TabsContent value="withdrawal-requests">
          <FilterSection 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={clearFilters} 
          />
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="text-center py-8">Loading withdrawal requests...</div>
              ) : filterData(withdrawalRequests).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending withdrawal requests</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount Requested</TableHead>
                      <TableHead>Withdrawal Fee</TableHead>
                      <TableHead>Withdrawal Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(withdrawalRequests).map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">WD-{request.id.slice(0, 6).toUpperCase()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.user.firstName} {request.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{request.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                        <TableCell>{formatCurrency(request.fee)}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.withdrawalMethod || "N/A"}</TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Withdrawal Request Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">User</label>
                                      <p>{request.user.firstName} {request.user.lastName}</p>
                                      <p className="text-sm text-gray-500">{request.user.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Amount Requested</label>
                                      <p>{formatCurrency(request.amount)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Withdrawal Fee</label>
                                      <p>{formatCurrency(request.fee)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Total Deducted</label>
                                      <p className="font-semibold text-red-600">{formatCurrency(request.amount + request.fee)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Withdrawal Method</label>
                                      <p>{request.withdrawalMethod || "N/A"}</p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => handleApproval(request, "approved")}
                                      disabled={updateTransactionMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleApproval(request, "failed")}
                                      disabled={updateTransactionMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(request, "approved")}
                              disabled={updateTransactionMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApproval(request, "failed")}
                              disabled={updateTransactionMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Transactions Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="approved">
          <FilterSection 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={clearFilters} 
          />
          <Card>
            <CardHeader>
              <CardTitle>Approved Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No approved transactions</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Payment/Withdrawal Method</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(approvedTransactions).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">TX-{transaction.id.slice(0, 6).toUpperCase()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transaction.user.firstName} {transaction.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{transaction.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {transaction.type === "top_up" ? "Top-up" : "Withdrawal"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{formatCurrency(transaction.fee)}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.paymentMethod || transaction.withdrawalMethod || "N/A"}</TableCell>
                        <TableCell>
                          {transaction.approvedBy ? (
                            <div className="text-xs text-green-600">
                              Approved by {getUsernameById(transaction.approvedBy) || transaction.approvedBy}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* Fee Records Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="fee-records">
            <FilterSection 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              onClearFilters={clearFilters} 
            />
            <Card>
              <CardHeader>
                <CardTitle>Fee Records</CardTitle>
              </CardHeader>
              <CardContent>
                {feesLoading ? (
                  <div className="text-center py-8">Loading fee records...</div>
                ) : filterData(feeRecords).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No fee records found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Original Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(feeRecords).map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-mono text-sm">{fee.referenceId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fee.username}</div>
                              <div className="text-sm text-gray-500">{fee.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                          <TableCell>{formatCurrency(fee.amount)}</TableCell>
                          <TableCell>{formatCurrency(fee.originalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(fee.dateTime).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Rejected Transactions Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="rejected">
            <FilterSection 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={clearFilters} 
          />
          <Card>
            <CardHeader>
              <CardTitle>Rejected Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedLoading ? (
                <div className="text-center py-8">Loading rejected transactions...</div>
              ) : filterData(rejectedTransactions).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No rejected transactions</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(rejectedTransactions).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.type === 'top_up' ? 'TX-' : 'WD-'}{transaction.id.slice(0, 6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transaction.user.firstName} {transaction.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{transaction.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            <Ban className="w-3 h-3 mr-1" />
                            {transaction.type === "top_up" ? "Top-up" : "Withdrawal"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{formatCurrency(transaction.fee)}</TableCell>
                        <TableCell>
                          <div>
                            <div>{transaction.adminNote || transaction.rejectionReason || "No reason provided"}</div>
                            {transaction.rejectedBy && (
                              <div className="text-xs text-red-600 mt-1">
                                Rejected by {getUsernameById(transaction.rejectedBy) || transaction.rejectedBy}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* User Balance Management Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="user-balance">
            <Card>
              <CardHeader>
                <CardTitle>User Balance Management</CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search-email">Search User by Email</Label>
                    <Input
                      id="search-email"
                      type="email"
                      placeholder="Enter user email address"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSearchUser}
                      disabled={!searchEmail.trim() || searchUserByEmailMutation.isPending}
                    >
                      {searchUserByEmailMutation.isPending ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* User Details Section */}
              {foundUser && (
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold mb-4">User Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{foundUser.firstName} {foundUser.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <p className="text-sm">{foundUser.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{foundUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Balance</Label>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(foundUser.balance)}
                      </p>
                    </div>
                  </div>

                  {/* Balance Management Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Update Balance</h4>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="balance-amount">Amount ($)</Label>
                        <Input
                          id="balance-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={balanceAmount}
                          onChange={(e) => setBalanceAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="balance-operation">Operation</Label>
                        <Select value={balanceOperation} onValueChange={(value: "add" | "subtract") => setBalanceOperation(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">Add</SelectItem>
                            <SelectItem value="subtract">Subtract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleUpdateBalance}
                        disabled={!balanceAmount || parseFloat(balanceAmount) <= 0 || updateUserBalanceMutation.isPending}
                        className={balanceOperation === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                      >
                        {updateUserBalanceMutation.isPending ? "Updating..." : `${balanceOperation === "add" ? "Add" : "Subtract"} $${balanceAmount || "0.00"}`}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!foundUser && (
                <div className="text-center py-8 text-gray-500">
                  Search for a user by email to manage their balance
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* Crypto TxIDs Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="crypto-txids">
            <Card>
              <CardHeader>
                <CardTitle>Crypto Transaction IDs</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Crypto TxIDs */}
                <div className="mb-4">
                  <Label htmlFor="crypto-search">Search by TxID</Label>
                  <Input
                    id="crypto-search"
                    placeholder="Search by transaction ID..."
                    value={cryptoTxIdSearch}
                    onChange={(e) => setCryptoTxIdSearch(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                {cryptoTxIdsLoading ? (
                  <div className="text-center py-8">Loading crypto TxIDs...</div>
                ) : cryptoTxIds.filter(txId => 
                    txId.txId.toLowerCase().includes(cryptoTxIdSearch.toLowerCase())
                  ).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {cryptoTxIdSearch ? "No matching crypto TxIDs found" : "No crypto TxIDs found"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TxID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Wallet Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cryptoTxIds.filter(txId => 
                        txId.txId.toLowerCase().includes(cryptoTxIdSearch.toLowerCase())
                      ).map((txId) => (
                        <TableRow key={txId.id}>
                          <TableCell className="font-mono text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                            {txId.txId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {txId.username}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {txId.first_name} {txId.last_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {txId.amount ? formatCurrency(txId.amount) : <span className="text-gray-500">—</span>}
                          </TableCell>
                          <TableCell>
                            {txId.status ? (
                              <Badge variant={txId.status === 'approved' ? 'default' : txId.status === 'processing' ? 'secondary' : 'destructive'}>
                                {txId.status}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(txId.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">{new Date(txId.createdAt).toLocaleTimeString()}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {txId.walletTransactionId}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Referral Records Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="referral-records">
            <Card>
              <CardHeader>
                <CardTitle>Referral Records Management</CardTitle>
                <p className="text-sm text-gray-600">Track referral commissions and their payment status</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">
                      Pending ({pendingReferrals.length})
                    </TabsTrigger>
                    <TabsTrigger value="paid">
                      Paid ({paidReferrals.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pending" className="mt-6">
                    {pendingReferralsLoading ? (
                      <div className="text-center py-8">Loading pending referrals...</div>
                    ) : pendingReferrals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No pending referral commissions</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Referrer</TableHead>
                            <TableHead>Referred User</TableHead>
                            <TableHead>Commission Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReferrals.map((referral: any) => (
                            <TableRow key={referral.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{referral.referrerUsername}</div>
                                  <div className="text-sm text-gray-500">{referral.referrerEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{referral.referredUsername}</div>
                                  <div className="text-sm text-gray-500">{referral.referredEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  ${(referral.referralAmount || 3).toFixed(2)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  Pending
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(referral.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="paid" className="mt-6">
                    {paidReferralsLoading ? (
                      <div className="text-center py-8">Loading paid referrals...</div>
                    ) : paidReferrals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No paid referral commissions</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Referrer</TableHead>
                            <TableHead>Referred User</TableHead>
                            <TableHead>Commission Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Paid Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paidReferrals.map((referral: any) => (
                            <TableRow key={referral.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{referral.referrerUsername}</div>
                                  <div className="text-sm text-gray-500">{referral.referrerEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{referral.referredUsername}</div>
                                  <div className="text-sm text-gray-500">{referral.referredEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  ${(referral.referralAmount || 0).toFixed(2)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Paid
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-mono">
                                  {referral.orderId || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {referral.updatedAt ? new Date(referral.updatedAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Select a reason for rejecting this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Select value={selectedRejectionReason} onValueChange={setSelectedRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rejection reason" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reason: any) => (
                    <SelectItem key={reason.id} value={reason.reasonText}>
                      {reason.reasonText}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectWithReason}
                disabled={updateTransactionMutation.isPending || !selectedRejectionReason}
              >
                Reject Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}