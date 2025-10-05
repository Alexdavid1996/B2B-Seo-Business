import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Plus, Trash2, GripVertical, Settings, CreditCard, Bitcoin } from "lucide-react";
import { ObjectUploader } from "@/components/ui/object-uploader";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  type: string;
  isActive: boolean;
  walletAddress?: string;
  qrCodeImagePath?: string;
  qrEnabled: boolean;
  instructions?: string;
  minDepositAmount: number;
  maxDepositAmount: number;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface InstructionStep {
  id: string;
  text: string;
}

export default function AdminPaymentGateway() {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [qrCodePath, setQrCodePath] = useState("");
  const [instructions, setInstructions] = useState<InstructionStep[]>([]);
  const [minDepositAmount, setMinDepositAmount] = useState(500);
  const [maxDepositAmount, setMaxDepositAmount] = useState(100000);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(500);
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState(100000);
  const [isActive, setIsActive] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gateways = [], isLoading } = useQuery<PaymentGateway[]>({
    queryKey: ["/api/admin/payment-gateways"],
  });

  // Auto-select the first gateway (crypto) when gateways load
  useEffect(() => {
    if (gateways.length > 0 && !selectedGateway) {
      const cryptoGateway = gateways.find(g => g.name === 'crypto') || gateways[0];
      setSelectedGateway(cryptoGateway);
    }
  }, [gateways, selectedGateway]);

  // Load gateway data when selection changes
  useEffect(() => {
    if (selectedGateway) {
      setDisplayName(selectedGateway.displayName || "");
      setWalletAddress(selectedGateway.walletAddress || "");
      setQrCodePath(selectedGateway.qrCodeImagePath || "");
      setMinDepositAmount(selectedGateway.minDepositAmount);
      setMaxDepositAmount(selectedGateway.maxDepositAmount);
      setMinWithdrawalAmount(selectedGateway.minWithdrawalAmount);
      setMaxWithdrawalAmount(selectedGateway.maxWithdrawalAmount);
      setIsActive(selectedGateway.isActive);
      setQrEnabled(selectedGateway.qrEnabled ?? true);
      
      // Parse instructions
      let parsedInstructions: InstructionStep[] = [];
      if (selectedGateway.instructions) {
        try {
          const parsed = JSON.parse(selectedGateway.instructions);
          if (Array.isArray(parsed)) {
            parsedInstructions = parsed.map((item, index) => ({
              id: `inst-${index}`,
              text: typeof item === 'string' ? item : item.text || ''
            }));
          } else if (typeof parsed === 'string') {
            // Handle legacy string format
            parsedInstructions = parsed.split('\n').filter(line => line.trim()).map((line, index) => ({
              id: `inst-${index}`,
              text: line.trim()
            }));
          }
        } catch {
          // Handle string format
          parsedInstructions = (selectedGateway.instructions || "").split('\n')
            .filter(line => line.trim())
            .map((line, index) => ({
              id: `inst-${index}`,
              text: line.trim()
            }));
        }
      }
      
      if (parsedInstructions.length === 0) {
        parsedInstructions = [
          { id: 'inst-0', text: 'Send USDT (TRC20) to the wallet address shown above' },
          { id: 'inst-1', text: 'The minimum deposit amount is $5.00' },
          { id: 'inst-2', text: 'Funds will be credited to your account within 10-15 minutes after blockchain confirmation' },
          { id: 'inst-3', text: 'Make sure to send only USDT on the TRON network (TRC20)' },
          { id: 'inst-4', text: 'Do not send any other cryptocurrency to this address' },
        ];
      }
      
      setInstructions(parsedInstructions);
    }
  }, [selectedGateway]);

  const updateGatewayMutation = useMutation({
    mutationFn: async (gatewayData: any) => {
      if (!selectedGateway) throw new Error("No gateway selected");
      
      return await apiRequest(`/api/admin/payment-gateways/${selectedGateway.id}`, {
        method: "PUT",
        body: gatewayData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-gateways"] });
      toast({
        title: "Payment gateway updated successfully!",
        description: "All changes have been saved."
      });
    },
    onError: (error) => {
      console.error("Error updating payment gateway:", error);
      toast({
        title: "Failed to update payment gateway",
        description: "Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    if (!selectedGateway) return;

    const instructionsArray = instructions.map(inst => inst.text).filter(text => text.trim());

    updateGatewayMutation.mutate({
      displayName,
      walletAddress,
      qrCodeImagePath: qrCodePath,
      qrEnabled,
      instructions: JSON.stringify(instructionsArray),
      minDepositAmount,
      maxDepositAmount,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      isActive
    });
  };

  const handleQRCodeUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Include current QR path in query params to delete old file
      const queryParams = new URLSearchParams();
      if (qrCodePath) {
        queryParams.append('currentQrPath', qrCodePath);
      }
      
      const url = `/api/admin/qr-codes/upload-local${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading QR code:", error);
      throw error;
    }
  };

  const handleQRCodeComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      
      try {
        // Normalize the upload URL to get the proper QR code path for storage
        const normalizeResponse = await apiRequest("/api/admin/qr-codes/normalize", {
          method: "POST",
          body: { uploadURL: uploadedFile.uploadURL }
        });
        
        setQrCodePath(normalizeResponse.normalizedPath);
        toast({
          title: "QR Code uploaded successfully!",
          description: "The QR code image has been updated. Click 'Save Changes' to apply."
        });
      } catch (error) {
        console.error("Error normalizing QR code path:", error);
        // Fallback - use the upload URL directly (not ideal but works)
        setQrCodePath(uploadedFile.uploadURL);
        toast({
          title: "QR Code uploaded!",
          description: "Please click 'Save Changes' to apply the new QR code."
        });
      }
    }
  };

  const addInstruction = () => {
    const newInstruction: InstructionStep = {
      id: `inst-${Date.now()}`,
      text: ""
    };
    setInstructions([...instructions, newInstruction]);
  };

  const removeInstruction = (id: string) => {
    setInstructions(instructions.filter(inst => inst.id !== id));
  };

  const updateInstruction = (id: string, text: string) => {
    setInstructions(instructions.map(inst => 
      inst.id === id ? { ...inst, text } : inst
    ));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;
    
    const newInstructions = [...instructions];
    const draggedInstruction = newInstructions[draggedItem];
    
    // Remove the dragged item
    newInstructions.splice(draggedItem, 1);
    
    // Insert at new position
    newInstructions.splice(dropIndex, 0, draggedInstruction);
    
    setInstructions(newInstructions);
    setDraggedItem(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Payment Gateway Management</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedGateway) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Payment Gateway Management</h2>
        </div>
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            No payment gateways found. Please ensure payment gateways are properly configured in the database.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Payment Gateway Management</h2>
      </div>

      <Tabs defaultValue="crypto" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto" className="flex items-center space-x-2">
            <Bitcoin className="h-4 w-4" />
            <span>Crypto</span>
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Stripe</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cryptocurrency Payment Gateway</h3>
            <Button 
              onClick={handleSave} 
              disabled={updateGatewayMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateGatewayMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gateway Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Gateway Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure basic settings for {selectedGateway.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Cryptocurrency Payment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address (e.g., TRC20 USDT address)"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>QR Code Image</Label>
              <div className="flex items-center space-x-2">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const result = await handleQRCodeUpload(file);
                          const normalizeResponse = await apiRequest("/api/admin/qr-codes/normalize", {
                            method: "POST",
                            body: { uploadURL: result.uploadURL }
                          });
                          
                          setQrCodePath(normalizeResponse.normalizedPath);
                          toast({
                            title: "QR Code uploaded successfully!",
                            description: "The QR code image has been updated. Click 'Save Changes' to apply."
                          });
                        } catch (error) {
                          console.error("Error uploading QR code:", error);
                          toast({
                            title: "Upload failed",
                            description: "Please try again.",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                    className="hidden"
                    id="qr-upload"
                  />
                  <Button 
                    type="button"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => document.getElementById('qr-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload QR Code
                  </Button>
                </div>
                {qrCodePath && (
                  <span className="text-sm text-green-600">✓ QR Code uploaded</span>
                )}
              </div>
              {qrCodePath && (
                <div className="mt-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current QR Code: {qrCodePath}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Gateway Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="qrEnabled"
                checked={qrEnabled}
                onCheckedChange={setQrEnabled}
              />
              <Label htmlFor="qrEnabled">QR Code Enabled</Label>
            </div>
          </CardContent>
        </Card>

        {/* Payment Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Limits (USD)</CardTitle>
            <CardDescription>
              Set minimum and maximum amounts for deposits and withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                <Input
                  id="minDeposit"
                  type="number"
                  value={minDepositAmount}
                  onChange={(e) => setMinDepositAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDeposit">Max Deposit ($)</Label>
                <Input
                  id="maxDeposit"
                  type="number"
                  value={maxDepositAmount}
                  onChange={(e) => setMaxDepositAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWithdrawal">Min Withdrawal ($)</Label>
                <Input
                  id="minWithdrawal"
                  type="number"
                  value={minWithdrawalAmount}
                  onChange={(e) => setMinWithdrawalAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWithdrawal">Max Withdrawal ($)</Label>
                <Input
                  id="maxWithdrawal"
                  type="number"
                  value={maxWithdrawalAmount}
                  onChange={(e) => setMaxWithdrawalAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                These limits are moved from Platform Settings and are now gateway-specific. 
                Changes here will affect all payment forms using this gateway.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Management */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Instructions</CardTitle>
          <CardDescription>
            Manage step-by-step instructions shown to users during payment. Drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div
                key={instruction.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-move"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex-shrink-0 w-8 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <Input
                  value={instruction.text}
                  onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                  placeholder="Enter instruction step..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeInstruction(instruction.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addInstruction}
            className="w-full border-dashed border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Instruction Step
          </Button>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Stripe Payment Gateway</h3>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Stripe Integration</h4>
              <p className="text-gray-600 mb-4">
                Stripe payment gateway configuration will be available here.
              </p>
              <p className="text-sm text-gray-500">
                This section is currently under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}