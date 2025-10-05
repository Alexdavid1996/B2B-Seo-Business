import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ArrowUp, ArrowDown, ShoppingCart, DollarSign, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { TransactionData } from "../../types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DynamicTimestamp from "@/components/ui/dynamic-timestamp";

interface TransactionHistoryProps {
  transactions: TransactionData[];
}

interface WalletTransactionData {
  id: string;
  transactionId: string;
  userId: string;
  type: string;
  amount: number;
  fee: number;
  status: string;
  paymentMethod?: string;
  withdrawalMethod?: string;
  adminNote?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch wallet transactions with pagination
  const { data: walletResponse } = useQuery({
    queryKey: ["/api/wallet-transactions", currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/wallet-transactions?page=${currentPage}`);
      return response;
    }
  });

  const walletTransactions = walletResponse?.transactions || [];
  const walletPagination = walletResponse?.pagination;
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "top_up":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case "earning":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "earning":
        return "text-green-600";
      case "withdrawal":
      case "purchase":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "deposit":
      case "earning":
        return "+";
      case "withdrawal":
      case "purchase":
        return "-";
      default:
        return "";
    }
  };

  const getTypeBadge = (type: string, status?: string) => {
    const config = {
      deposit: { label: "Deposit", variant: "bg-green-100 text-green-800" },
      top_up: { label: "Top Up", variant: "bg-green-100 text-green-800" },
      withdrawal: { label: "Withdrawal", variant: "bg-red-100 text-red-800" },
      purchase: { label: "Purchase", variant: "bg-blue-100 text-blue-800" },
      earning: { label: "Earning", variant: "bg-green-100 text-green-800" },
      fee: { label: "Fee", variant: "bg-amber-100 text-amber-800" },
    };

    const { label, variant } = config[type as keyof typeof config] || { label: type, variant: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={variant}>
        {label} {status && status !== "approved" && `(${status})`}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      processing: { label: "Processing", variant: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Successfully Processed", variant: "bg-green-100 text-green-800" },
      failed: { label: "Failed", variant: "bg-red-100 text-red-800" },
    };

    const { label, variant } = config[status as keyof typeof config] || { label: status, variant: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={variant}>
        {label}
      </Badge>
    );
  };

  // Combine and sort all transactions
  const allTransactions = [
    ...transactions.map(t => ({ ...t, source: 'transaction' })),
    ...walletTransactions.map(wt => ({ 
      ...wt, 
      source: 'wallet_transaction',
      description: wt.type === 'top_up' 
        ? `Top-up: $${(wt.amount / 100).toFixed(2)} via ${wt.paymentMethod || 'bank transfer'}`
        : `Withdrawal: $${(wt.amount / 100).toFixed(2)} via ${wt.withdrawalMethod || 'crypto'}`,
      type: wt.type
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Use wallet pagination if available, otherwise fall back to client-side
  const totalPages = walletPagination?.totalPages || Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = walletPagination ? ((walletPagination.page - 1) * walletPagination.limit) : ((currentPage - 1) * itemsPerPage);
  const endIndex = walletPagination ? (startIndex + walletPagination.limit) : (startIndex + itemsPerPage);
  const total = walletPagination?.total || allTransactions.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          All your wallet activity and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allTransactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400">Your transaction history will appear here</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {allTransactions.map((transaction: any) => (
              <div 
                key={`${transaction.source}-${transaction.id}`} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      {transaction.source === 'wallet_transaction' ? (
                        getStatusBadge(transaction.status)
                      ) : (
                        getTypeBadge(transaction.type)
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <DynamicTimestamp 
                        timestamp={transaction.createdAt} 
                        className="text-sm text-gray-500"
                      />
                      {transaction.source === 'wallet_transaction' && transaction.transactionId && (
                        <span className="text-sm text-gray-400">ID: {transaction.transactionId}</span>
                      )}
                    </div>
                    {transaction.adminNote && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        Note: {transaction.adminNote}
                      </p>
                    )}
                    {transaction.status === 'failed' && transaction.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        {transaction.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}${(Math.abs(transaction.amount) / 100).toFixed(2)}
                  </p>
                  {transaction.source === 'wallet_transaction' && transaction.fee > 0 && (
                    <p className="text-sm text-gray-500">
                      Fee: ${(transaction.fee / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, total)} of {total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}