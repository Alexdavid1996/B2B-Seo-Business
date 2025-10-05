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
import { Plus, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { WalletData, TransactionData } from "../../types";
import { formatCurrency } from "@/lib/formatters";
import { DepositDialog } from "./deposit-dialog";
import { apiRequest } from "@/lib/queryClient";

interface TopUpCardProps {
  wallet: WalletData | undefined;
  transactions: TransactionData[];
}

export default function TopUpCard({ wallet, transactions }: TopUpCardProps) {
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [amount, setAmount] = useState<number>(10);
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
          const minDepositDollars = cryptoGateway.minDepositAmount;
          if (amount < minDepositDollars) {
            setAmount(minDepositDollars);
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
    if (!isNaN(numValue) && numValue <= 99999) {
      setAmount(numValue);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Top Up Wallet
          </CardTitle>
          <CardDescription>
            Current Balance: {formatCurrency(balance)} | Add funds using
            cryptocurrency
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4 h-full flex flex-col">
            {/* Payment Method Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Cryptocurrency Payments
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Quick and secure deposits using USDT (TRC20)
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Deposit Amount (USD)</Label>
              <Input
                id="deposit-amount"
                type="number"
                min={gatewayLimits.minDeposit}
                max={99999}
                step="0.01"
                value={amount === 0 ? "" : amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount (e.g., 1000.54)"
              />
              <p className="text-sm text-gray-500">
                Minimum: ${gatewayLimits.minDeposit.toFixed(2)}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Fast processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Secure blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Subject to processing time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>24/7 availability</span>
              </div>
            </div>

            {/* Top Up Button */}
            <div className="flex-shrink-0 pt-4">
              <Button
                onClick={() => setShowDepositDialog(true)}
                className="w-full"
                size="lg"
                disabled={amount < 10}
              >
                <Plus className="h-4 w-4 mr-2" />
                {amount >= 10
                  ? `Top Up ${formatCurrency(amount)}`
                  : "Top Up Wallet"}
              </Button>
            </div>

            {/* Important Notice */}
            <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> All deposits are processed through secure
                cryptocurrency transactions. You'll receive a unique wallet
                address and QR code for your deposit session.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <DepositDialog
        open={showDepositDialog}
        onOpenChange={setShowDepositDialog}
        amount={amount}
      />
    </>
  );
}
