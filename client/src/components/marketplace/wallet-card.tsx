import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { WalletData, TransactionData } from "../../types";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface WalletCardProps {
  wallet: WalletData;
  transactions: TransactionData[];
}

export default function WalletCard({ wallet, transactions }: WalletCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState(100);
  const [depositCurrency, setDepositCurrency] = useState("USDT");

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string }) => {
      const response = await apiRequest("/api/wallet/deposit", {
        method: "POST",
        body: {
          amount: data.amount, // Keep as dollars
          currency: data.currency,
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Deposit successful",
        description: `$${depositAmount} has been added to your wallet.`,
      });
      setDepositAmount(100);
    },
    onError: () => {
      toast({
        title: "Deposit failed",
        description: "Unable to process deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (depositAmount < 10) {
      toast({
        title: "Minimum deposit",
        description: "Minimum deposit amount is $10.",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate({ amount: depositAmount, currency: depositCurrency });
  };

  const balance = wallet?.balance ?? 0; // Already in dollars, default to 0
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
          <CardDescription>
            Manage your funds for purchasing link placements and guest posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-green-600">
              ${balance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Available balance</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="10"
                  step="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={depositMutation.isPending || depositAmount < 10}
            >
              <Plus className="h-4 w-4 mr-2" />
              {depositMutation.isPending ? "Processing..." : `Add $${depositAmount} to Wallet`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest wallet activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'deposit' || transaction.type === 'earning' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'earning' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.type === 'deposit' || transaction.type === 'earning' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'earning' ? '+' : '-'}
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}