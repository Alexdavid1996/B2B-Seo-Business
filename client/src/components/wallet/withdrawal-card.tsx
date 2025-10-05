import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { WalletData, TransactionData } from "../../types";
import { formatCurrency } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface WithdrawalCardProps {
  wallet: WalletData | undefined;
  transactions: TransactionData[];
}

export default function WithdrawalCard({
  wallet,
  transactions,
}: WithdrawalCardProps) {
  const [amount, setAmount] = useState<number>(10);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [network, setNetwork] = useState<string>("TRC20");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [gatewayLimits, setGatewayLimits] = useState<{
    minDeposit: number;
    maxDeposit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
  }>({
    minDeposit: 5,
    maxDeposit: 1000,
    minWithdrawal: 5,
    maxWithdrawal: 1000,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const balance = wallet?.balance || 0;

  // Fetch all limits from payment gateway configuration
  useEffect(() => {
    const fetchGatewayLimits = async () => {
      try {
        const gateways = await apiRequest("/api/payment-gateways");
        const cryptoGateway = gateways.find((g: any) => g.name === "crypto");

        if (cryptoGateway) {
          setGatewayLimits({
            minDeposit: cryptoGateway.minDepositAmount,
            maxDeposit: cryptoGateway.maxDepositAmount,
            minWithdrawal: cryptoGateway.minWithdrawalAmount,
            maxWithdrawal: cryptoGateway.maxWithdrawalAmount,
          });

          // Update minimum amount if current amount is below new minimum
          const minWithdrawalDollars = cryptoGateway.minWithdrawalAmount;
          if (amount < minWithdrawalDollars) {
            setAmount(minWithdrawalDollars);
          }
        }
      } catch (error) {
        console.error("Failed to fetch gateway limits:", error);
      }
    };

    fetchGatewayLimits();
  }, []);

  const handleAmountChange = (value: string) => {
    // Allow empty string or partial input during editing
    if (value === "") {
      setAmount(0);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAmount(numValue);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Address Required",
        description: "Please enter your wallet address",
        variant: "destructive",
      });
      return;
    }

    if (amount < gatewayLimits.minWithdrawal) {
      toast({
        title: "Minimum Amount",
        description: `Minimum withdrawal amount is $${gatewayLimits.minWithdrawal.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    // Get withdrawal fee from settings
    let withdrawalFee = 2.0; // Default $2.00
    try {
      const settingsData = await apiRequest("/api/settings/public");
      // Handle settings object format
      if (settingsData.withdrawalFee) {
        withdrawalFee = parseFloat(settingsData.withdrawalFee);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal fee:", error);
    }

    // Fetch fresh balance from database for accurate validation
    let currentBalance = balance;
    try {
      const freshWallet = await apiRequest("/api/wallet");
      currentBalance = freshWallet.balance;
    } catch (error) {
      console.error("Failed to fetch fresh balance:", error);
    }

    const totalWithFee = amount + withdrawalFee;
    if (currentBalance < totalWithFee) {
      toast({
        title: "Not enough funds",
        description: `Insufficient balance for withdrawal of $${amount.toFixed(2)} plus $${withdrawalFee.toFixed(2)} fee. Available: $${currentBalance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsWithdrawing(true);

      const response = await apiRequest("/api/wallet/withdraw", {
        method: "POST",
        body: {
          amount: amount,
          currency: "USDT",
          method: "crypto",
          walletAddress,
          network,
          fee: withdrawalFee,
        },
      });

      // If we reach here, the request was successful
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet-transactions"] });

      toast({
        title: "Withdrawal Submitted",
        description: `Your ${formatCurrency(amount)} withdrawal is on its way. Check Transaction History for updates.`,
      });

      // Reset form
      setAmount(10);
      setWalletAddress("");
      setNetwork("TRC20");
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description:
          error.message ||
          "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Withdraw Funds
        </CardTitle>
        <CardDescription>
          Withdraw your funds securely to your cryptocurrency wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="space-y-4 flex-1">
            {/* Current Balance Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Available Balance
                </span>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount">Withdrawal Amount (USD)</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                min={gatewayLimits.minWithdrawal}
                step="0.01"
                value={amount === 0 ? "" : amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount (e.g., 1000.54)"
              />
              <p className="text-sm text-gray-500">
                Minimum withdrawal: ${gatewayLimits.minWithdrawal.toFixed(2)}
              </p>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                type="text"
                value={walletAddress}
                onChange={(e) => {
                  // Only allow alphanumeric characters, max 45 chars
                  const value = e.target.value
                    .replace(/[^A-Za-z0-9]/g, "")
                    .slice(0, 45);
                  setWalletAddress(value);
                }}
                placeholder="Enter your USDT wallet address"
                maxLength={45}
                pattern="[A-Za-z0-9]{1,45}"
              />
              <p className="text-xs text-gray-500">
                Only alphanumeric characters allowed (max 45 characters)
              </p>
            </div>

            {/* Network Selection */}
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRC20">USDT (TRC20)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Fast processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Secure transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Subject to processing time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>24/7 support</span>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Section */}
          <div className="flex-shrink-0 space-y-4 pt-4 border-t">
            {/* Withdrawal Button */}
            <Button
              onClick={handleWithdraw}
              className="w-full"
              size="lg"
              disabled={amount < 5 || !walletAddress || isWithdrawing}
            >
              <Minus className="h-4 w-4 mr-2" />
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>

            {/* Important Notice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="text-xs text-orange-800 dark:text-orange-200">
                <strong>Important:</strong> Withdrawals are usually processed
                within a few minutes but may take up to 24 hours. Please
                double-check your wallet address, as transactions cannot be
                reversed.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
