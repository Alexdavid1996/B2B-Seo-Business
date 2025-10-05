import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface DepositSession {
  id: string;
  sessionId: string;
  walletAddress: string;
  qrCodeData: string;
  instructions: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  qrEnabled?: boolean; // Optional flag to show/hide QR code section
}

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount?: number;
}

export function DepositDialog({
  open,
  onOpenChange,
  amount = 10,
}: DepositDialogProps) {
  const [session, setSession] = useState<DepositSession | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [topupFee, setTopupFee] = useState<number>(2); // Default $2.00 in dollars
  const [txId, setTxId] = useState<string>(""); // Transaction ID from user's crypto transfer
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch topup fee from settings
  const fetchTopupFee = async () => {
    try {
      const settingsData = await apiRequest("/api/settings/public");
      // Handle settings object format - fees are stored in dollars
      if (settingsData.topUpFee) {
        setTopupFee(parseInt(settingsData.topUpFee));
      }
    } catch (error) {
      console.error("Failed to fetch topup fee:", error);
    }
  };

  // Format time remaining
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  // Create or fetch deposit session
  const createSession = async () => {
    try {
      setLoading(true);
      const sessionData = await apiRequest("/api/deposit/create-session", {
        method: "POST",
        body: {
          amount: amount, // Keep as dollars
        },
      });
      setSession(sessionData);

      // Calculate time left
      const expiresAt = new Date(sessionData.expiresAt);
      const now = new Date();
      const secondsLeft = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
      );
      setTimeLeft(secondsLeft);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create deposit session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session
  const checkSession = async () => {
    try {
      const sessionData = await apiRequest("/api/deposit/session");

      // Calculate time left based on session expiry
      const expiresAt = new Date(sessionData.expiresAt);
      const now = new Date();
      const secondsLeft = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
      );

      if (secondsLeft <= 0) {
        // Session expired, delete it and create a new one
        try {
          await apiRequest("/api/deposit/session", { method: "DELETE" });
        } catch (deleteError) {
          console.error("Failed to delete expired session:", deleteError);
        }
        await createSession();
      } else {
        // Valid session exists, use it regardless of amount or login status
        setSession(sessionData);
        setTimeLeft(secondsLeft);
      }
    } catch (error) {
      // No existing session, create a new one
      await createSession();
    }
  };

  // Close dialog without ending session - session persists
  const closeDialog = () => {
    onOpenChange(false);
  };

  // End session completely (only for manual session termination)
  const endSession = async () => {
    try {
      await apiRequest("/api/deposit/session", { method: "DELETE" });
      setSession(null);
      setTimeLeft(0);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Delete expired session from database
            apiRequest("/api/deposit/session", { method: "DELETE" }).catch(
              (error) => {
                console.error("Failed to delete expired session:", error);
              },
            );
            setSession(null);
            onOpenChange(false);
            toast({
              title: "Session Expired",
              description:
                "Your deposit session has expired. Please create a new one.",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeLeft, onOpenChange, toast]);

  // Initialize session when dialog opens
  useEffect(() => {
    if (open && !session) {
      checkSession();
      fetchTopupFee();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cryptocurrency Deposit
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">
              Creating deposit session...
            </div>
          </div>
        ) : session ? (
          <div className="space-y-4">
            {/* Timer */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Session expires in: {formatTimeLeft(timeLeft)}
                </span>
              </div>
            </div>

            {/* QR Code - Only show if qrEnabled is true */}
            {session.qrEnabled && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  {session.qrCodeData && session.qrCodeData.trim() !== "" ? (
                    <div className="relative">
                      <img
                        src={session.qrCodeData}
                        alt="Deposit QR Code"
                        className="w-32 h-32 object-contain"
                        onLoad={(e) => {
                          console.log(
                            "QR Code loaded successfully:",
                            session.qrCodeData,
                          );
                          e.currentTarget.style.display = "block";
                        }}
                        onError={(e) => {
                          console.error(
                            "QR Code failed to load:",
                            session.qrCodeData,
                            e,
                          );
                          console.error("Error details:", e.target);
                          // Hide the image on error
                          e.currentTarget.style.display = "none";
                          // Show fallback div
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "block";
                        }}
                      />
                      <div
                        className="w-32 h-32 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-500"
                        style={{ display: "none" }}
                      >
                        QR Code
                        <br />
                        Not Available
                      </div>
                    </div>
                  ) : (
                    // Show blank square when no QR code is configured
                    <div className="w-32 h-32 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
                      QR Code
                      <br />
                      Not Configured
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Total Amount Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Amount (including fee)
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${(amount + topupFee).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Deposit: ${amount.toFixed(2)} + Fee: ${topupFee.toFixed(2)}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Wallet Address (USDT TRC20)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border text-sm font-mono break-all">
                  {session.walletAddress}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(session.walletAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Transaction ID Input - Moved above instructions as requested */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-600">
                Transaction ID (TxID) *
              </label>
              <Input
                type="text"
                placeholder="Enter your transaction ID from the crypto transfer"
                value={txId}
                onChange={(e) => {
                  // Security: Only allow alphanumeric characters and common crypto TxID characters
                  const sanitizedValue = e.target.value
                    .replace(/[^A-Za-z0-9]/g, "")
                    .slice(0, 128);
                  setTxId(sanitizedValue);
                }}
                className="font-mono"
                maxLength={128}
                pattern="[A-Za-z0-9]{1,128}"
                required
              />
              <p className="text-xs text-gray-500">
                After sending the payment, enter the transaction ID (TxID) from
                your crypto wallet (alphanumeric only, max 128 chars)
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions</label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {session.instructions}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDialog}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                disabled={processingDeposit || !txId.trim()}
                onClick={async () => {
                  try {
                    // Additional security validation
                    const sanitizedTxId = txId
                      .trim()
                      .replace(/[^A-Za-z0-9]/g, "");
                    if (!sanitizedTxId || sanitizedTxId.length < 10) {
                      toast({
                        title: "Invalid Transaction ID",
                        description:
                          "Please enter a valid transaction ID (TxID) from your crypto transfer (minimum 10 characters, alphanumeric only).",
                        variant: "destructive",
                      });
                      return;
                    }

                    setProcessingDeposit(true);

                    // Create the wallet transaction record (existing flow - NO balance validation for top-ups)
                    await apiRequest("/api/wallet/topup", {
                      method: "POST",
                      body: {
                        amount: amount, // Keep as dollars
                        currency: "USDT",
                        method: "crypto",
                        fee: topupFee, // Use dynamic fee from settings
                        txId: sanitizedTxId, // Include sanitized transaction ID
                      },
                    });

                    // Invalidate and refetch wallet data
                    queryClient.invalidateQueries({
                      queryKey: ["/api/wallet"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["/api/wallet-transactions"],
                    });

                    // End the session after successful submission
                    await endSession();

                    // Reset TxID field and close dialog
                    setTxId("");
                    onOpenChange(false);

                    toast({
                      title: "Deposit Request Submitted",
                      description: `Your $${amount} deposit is processing. Check Transaction History for updates.`,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description:
                        "Failed to submit deposit request. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setProcessingDeposit(false);
                  }
                }}
              >
                {processingDeposit ? "Submitting..." : "Submit Deposit Request"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No active session</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
