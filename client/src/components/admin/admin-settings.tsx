import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LiveClock from "@/components/ui/live-clock";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings2, AlertTriangle, DollarSign, RefreshCw, Trash2, UserPlus, Key, Search, User, Globe, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateEmployee from "./create-employee";
import AdminRejectionReasons from "./admin-rejection-reasons";
import GlobalNotifications from "./global-notifications";
import AdminSocialLinks from "./admin-social-links";

interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}

export default function AdminSettings() {
  const [platformFee, setPlatformFee] = useState("5");
  const [platformFeeType, setPlatformFeeType] = useState("percentage");
  const [topUpFee, setTopUpFee] = useState("200");
  const [withdrawalFee, setWithdrawalFee] = useState("200");
  const [referralCommission, setReferralCommission] = useState("200");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("We are currently performing maintenance. Please check back soon.");
  const [adminTimezone, setAdminTimezone] = useState("UTC");
  const [appTimezone, setAppTimezone] = useState("UTC");
  const [antiDdosEnabled, setAntiDdosEnabled] = useState(true);
  const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);
  const [platformName, setPlatformName] = useState("");

  // Password reset states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/admin/settings"],
  });



  // Load settings when data is available
  useEffect(() => {
    if (settings.length > 0) {
      const feesSetting = settings.find(s => s.key === 'platform_fee' || s.key === 'platformFee');
      const feeTypeSetting = settings.find(s => s.key === 'platformFeeType');
      const topUpFeeSetting = settings.find(s => s.key === 'topUpFee');
      const withdrawalFeeSetting = settings.find(s => s.key === 'withdrawalFee');
      const referralCommissionSetting = settings.find(s => s.key === 'Referral_Commission');
      const maintenanceSetting = settings.find(s => s.key === 'maintenanceMode');
      const maintenanceMessageSetting = settings.find(s => s.key === 'maintenanceMessage');
      const timezoneSetting = settings.find(s => s.key === 'adminTimezone');
      const appTimezoneSetting = settings.find(s => s.key === 'appTimezone');
      const antiDdosSetting = settings.find(s => s.key === 'antiDdosEnabled');
      const emailVerificationSetting = settings.find(s => s.key === 'emailVerificationEnabled');
      const platformNameSetting = settings.find(s => s.key === 'platform_name');

      if (feesSetting) setPlatformFee(feesSetting.value);
      if (feeTypeSetting) setPlatformFeeType(feeTypeSetting.value);
      if (topUpFeeSetting) setTopUpFee(topUpFeeSetting.value);
      if (withdrawalFeeSetting) setWithdrawalFee(withdrawalFeeSetting.value);
      if (referralCommissionSetting) setReferralCommission(referralCommissionSetting.value);
      if (maintenanceSetting) setMaintenanceMode(maintenanceSetting.value === 'true');
      if (maintenanceMessageSetting) setMaintenanceMessage(maintenanceMessageSetting.value);
      if (timezoneSetting) setAdminTimezone(timezoneSetting.value);
      if (appTimezoneSetting) setAppTimezone(appTimezoneSetting.value);
      if (antiDdosSetting) setAntiDdosEnabled(antiDdosSetting.value === 'true');
      if (emailVerificationSetting) setEmailVerificationEnabled(emailVerificationSetting.value === 'true');
      if (platformNameSetting) setPlatformName(platformNameSetting.value);
    }
  }, [settings]);



  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      const response = await apiRequest("/api/admin/settings", {
        method: "POST",
        body: {
          key,
          value,
          description: description || `Setting for ${key}`
        }
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Clear all relevant caches when settings are updated
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      
      // Show specific success messages for different settings
      if (variables.key === 'adminTimezone' || variables.key === 'appTimezone') {
        toast({ title: "App Timezone updated!", description: "All timestamps throughout the system now use the new timezone." });
      } else if (variables.key === 'maintenanceMode') {
        const isEnabled = variables.value === 'true';
        toast({ 
          title: `Maintenance Mode ${isEnabled ? 'Enabled' : 'Disabled'}!`, 
          description: isEnabled ? "Platform is now in maintenance mode" : "Platform is now live and accessible" 
        });
      } else if (variables.key === 'antiDdosEnabled') {
        const isEnabled = variables.value === 'true';
        toast({ 
          title: `Anti-DDoS Protection ${isEnabled ? 'Enabled' : 'Disabled'}!`, 
          description: isEnabled ? "Login brute force protection is now active" : "Login brute force protection is now disabled" 
        });
      } else if (variables.key === 'platform_name') {
        toast({ title: "Platform Name updated!", description: `Platform name has been changed to "${variables.value}". This will appear across all pages.` });
      } else {
        toast({ title: "Setting saved successfully!" });
      }
    },
    onError: (error: any) => {
      console.error('Settings update error:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      // Reset the UI state back to database value on error
      if (settings.length > 0) {
        const antiDdosSetting = settings.find(s => s.key === 'antiDdosEnabled');
        const maintenanceSetting = settings.find(s => s.key === 'maintenanceMode');
        const platformNameSetting = settings.find(s => s.key === 'platform_name');
        
        if (antiDdosSetting) {
          setAntiDdosEnabled(antiDdosSetting.value === 'true');
        }
        if (maintenanceSetting) {
          setMaintenanceMode(maintenanceSetting.value === 'true');
        }
        if (platformNameSetting) {
          setPlatformName(platformNameSetting.value);
        }
      }
      
      toast({ 
        title: "Failed to save setting", 
        description: error.message || "Authentication error - please try refreshing the page", 
        variant: "destructive" 
      });
    },
  });

  // Password reset mutations
  const searchUsersMutation = useMutation({
    mutationFn: async (searchTerm: string) => {
      const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
    },
    onError: () => {
      toast({ title: "Failed to search users", variant: "destructive" });
      setIsSearching(false);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { userIdentifier: string; newPassword: string }) => {
      await apiRequest("/api/admin/reset-password", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Password reset successfully" });
      setSelectedUser(null);
      setNewPassword("");
      setSearchTerm("");
      setSearchResults([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to reset password", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const handleSearch = () => {
    if (searchTerm.trim().length >= 2) {
      setIsSearching(true);
      searchUsersMutation.mutate(searchTerm.trim());
    } else {
      toast({ title: "Please enter at least 2 characters to search", variant: "destructive" });
    }
  };

  const handleResetPassword = () => {
    if (!selectedUser) {
      toast({ title: "Please select a user", variant: "destructive" });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
      return;
    }
    
    resetPasswordMutation.mutate({
      userIdentifier: selectedUser.email,
      newPassword: newPassword
    });
  };

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      // Clear all cached data
      queryClient.invalidateQueries();
      await queryClient.refetchQueries({ queryKey: ["/api/admin/settings"] });
      await queryClient.refetchQueries({ queryKey: ["/api/settings/public"] });
      return true;
    },
    onSuccess: () => {
      toast({ title: "Cache cleared successfully!", description: "All data has been refreshed from the database." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to clear cache", description: error.message, variant: "destructive" });
    },
  });



  const handleSaveMaintenanceMessage = () => {
    updateSettingMutation.mutate({
      key: 'maintenanceMessage',
      value: maintenanceMessage,
      description: 'Message to show during maintenance mode'
    });
  };

  const handleSavePlatformFeeType = () => {
    updateSettingMutation.mutate({
      key: 'platformFeeType',
      value: platformFeeType,
      description: 'Platform fee type: "fixed" or "percentage"'
    });
  };

  const handleSavePlatformFee = () => {
    const fee = parseFloat(platformFee);
    if (platformFeeType === 'percentage' && (isNaN(fee) || fee < 0 || fee > 100)) {
      toast({ title: "Please enter a valid fee percentage (0-100)", variant: "destructive" });
      return;
    }
    if (platformFeeType === 'fixed' && (isNaN(fee) || fee < 0)) {
      toast({ title: "Please enter a valid fixed fee amount", variant: "destructive" });
      return;
    }

    updateSettingMutation.mutate({
      key: 'platformFee',
      value: platformFee,
      description: 'Platform fee for guest post orders'
    });
  };

  const handleSaveTopUpFee = () => {
    const fee = parseFloat(topUpFee);
    if (isNaN(fee) || fee < 0) {
      toast({ title: "Please enter a valid top-up fee amount", variant: "destructive" });
      return;
    }

    updateSettingMutation.mutate({
      key: 'topUpFee',
      value: topUpFee,
      description: 'Top up fee in cents'
    });
  };

  const handleSaveWithdrawalFee = () => {
    const fee = parseFloat(withdrawalFee);
    if (isNaN(fee) || fee < 0) {
      toast({ title: "Please enter a valid withdrawal fee amount", variant: "destructive" });
      return;
    }

    updateSettingMutation.mutate({
      key: 'withdrawalFee',
      value: withdrawalFee,
      description: 'Withdrawal fee in dollars'
    });
  };

  const handleSaveReferralCommission = () => {
    const commission = parseFloat(referralCommission);
    if (isNaN(commission) || commission < 0) {
      toast({ title: "Please enter a valid referral commission amount", variant: "destructive" });
      return;
    }

    updateSettingMutation.mutate({
      key: 'Referral_Commission',
      value: referralCommission,
      description: 'Referral commission in cents'
    });
  };



  const handleSaveTimezone = () => {
    // Save both admin and app timezone to ensure system-wide consistency
    updateSettingMutation.mutate({
      key: 'appTimezone',
      value: adminTimezone,
      description: 'Application-wide timezone setting for all timestamps'
    });
    
    updateSettingMutation.mutate({
      key: 'adminTimezone', 
      value: adminTimezone,
      description: 'Admin dashboard timezone setting'
    });
    
    setAppTimezone(adminTimezone);
  };

  const handleSaveMaintenance = () => {
    updateSettingMutation.mutate({
      key: 'maintenanceMode',
      value: maintenanceMode.toString(),
      description: 'Whether the platform is in maintenance mode'
    });
  };

  const handleSaveAntiDdos = () => {
    updateSettingMutation.mutate({
      key: 'antiDdosEnabled',
      value: antiDdosEnabled.toString(),
      description: 'Enable/disable Anti-DDoS brute force protection for user login'
    });
  };





  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-gray-600">Configure essential platform settings and fees</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="general" className="flex items-center justify-center space-x-1 text-xs px-2 py-2">
            <Settings2 className="h-3 w-3" />
            <span className="hidden sm:inline">General Settings</span>
            <span className="sm:hidden">General</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center justify-center space-x-1 text-xs px-2 py-2">
            <Globe className="h-3 w-3" />
            <span>Platform</span>
          </TabsTrigger>
          <TabsTrigger value="password-reset" className="flex items-center justify-center space-x-1 text-xs px-2 py-2">
            <Key className="h-3 w-3" />
            <span className="hidden sm:inline">Password Reset</span>
            <span className="sm:hidden">Password</span>
          </TabsTrigger>
          <TabsTrigger value="rejection-reasons" className="flex items-center justify-center space-x-1 text-xs px-2 py-2">
            <Trash2 className="h-3 w-3" />
            <span className="hidden sm:inline">Rejection Reasons</span>
            <span className="sm:hidden">Reasons</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center justify-center space-x-1 text-xs px-2 py-2">
            <UserPlus className="h-3 w-3" />
            <span className="hidden sm:inline">Create Employee Account</span>
            <span className="sm:hidden">Employee</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center space-x-1 text-xs px-2 py-2">
            <AlertTriangle className="h-3 w-3" />
            <span className="hidden sm:inline">Global Notifications</span>
            <span className="sm:hidden">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">

      {/* Main Settings Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5" />
            <span>Essential Settings</span>
          </CardTitle>
          <CardDescription>
            Core platform configuration and fee management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Maintenance Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Maintenance Mode</Label>
              <div className="flex items-center space-x-3">
                <Switch
                  id="maintenance-mode"
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => {
                    setMaintenanceMode(checked);
                    // Auto-save when toggled
                    updateSettingMutation.mutate({
                      key: 'maintenanceMode',
                      value: checked.toString(),
                      description: 'Whether the platform is in maintenance mode'
                    });
                  }}
                />
                <span className="text-sm text-gray-600">
                  {maintenanceMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center py-2">
                Auto-saves when toggled
              </div>
            </div>

            {/* Anti-DDoS Protection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Anti-DDoS Protection</Label>
              <div className="flex items-center space-x-3">
                <Switch
                  id="anti-ddos-mode"
                  checked={antiDdosEnabled}
                  onCheckedChange={(checked) => {
                    setAntiDdosEnabled(checked);
                    // Auto-save when toggled
                    updateSettingMutation.mutate({
                      key: 'antiDdosEnabled',
                      value: checked.toString(),
                      description: 'Enable/disable Anti-DDoS brute force protection for user login'
                    });
                  }}
                />
                <span className="text-sm text-gray-600">
                  {antiDdosEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center py-2">
                Auto-saves when toggled
              </div>
              <p className="text-xs text-gray-500">
                3 failed attempts = 1 hour lockout (user login only)
              </p>
            </div>

            {/* Email Verification */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Require Email Verification on Sign-Up</Label>
              <div className="flex items-center space-x-3">
                <Switch
                  id="email-verification-mode"
                  checked={emailVerificationEnabled}
                  onCheckedChange={(checked) => {
                    setEmailVerificationEnabled(checked);
                    // Auto-save when toggled - update smtp_system table
                    updateSettingMutation.mutate({
                      key: 'emailVerificationEnabled',
                      value: checked.toString(),
                      description: 'Enable/disable email verification requirement for new user registrations'
                    });
                  }}
                />
                <span className="text-sm text-gray-600">
                  {emailVerificationEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center py-2">
                Auto-saves when toggled
              </div>
              <p className="text-xs text-gray-500">
                When disabled, users auto-login immediately after registration
              </p>
            </div>

            {/* Platform Fee Type */}
            <div className="space-y-3">
              <Label htmlFor="platform-fee-type" className="text-sm font-semibold text-gray-700">
                Platform Fee Type
              </Label>
              <Select value={platformFeeType} onValueChange={setPlatformFeeType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSavePlatformFeeType} 
                disabled={updateSettingMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Type
              </Button>
            </div>

            {/* Platform Fee Amount */}
            <div className="space-y-3">
              <Label htmlFor="platform-fee" className="text-sm font-semibold text-gray-700">
                Platform Fee {platformFeeType === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="platform-fee"
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                placeholder={platformFeeType === 'percentage' ? "5" : "10"}
                min="0"
                max={platformFeeType === 'percentage' ? "100" : undefined}
                step={platformFeeType === 'percentage' ? "0.1" : "0.01"}
                className="w-full"
              />
              <Button 
                onClick={handleSavePlatformFee} 
                disabled={updateSettingMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Fee
              </Button>
              <p className="text-xs text-gray-500">
                {platformFeeType === 'percentage' 
                  ? `Current: ${platformFee}% of order value`
                  : `Current: $${parseFloat(platformFee || '0').toFixed(2)} per order`
                }
              </p>
            </div>

            {/* Top-Up Fee */}
            <div className="space-y-3">
              <Label htmlFor="top-up-fee" className="text-sm font-semibold text-gray-700">
                Top-Up Fee
              </Label>
              <Input
                id="top-up-fee"
                type="number"
                value={topUpFee}
                onChange={(e) => setTopUpFee(e.target.value)}
                placeholder="200"
                min="0"
                step="1"
                className="w-full"
              />
              <Button 
                onClick={handleSaveTopUpFee} 
                disabled={updateSettingMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Fee
              </Button>
              <p className="text-xs text-gray-500">
                Current: ${parseFloat(topUpFee).toFixed(2)} per deposit
              </p>
            </div>

            {/* Withdrawal Fee */}
            <div className="space-y-3">
              <Label htmlFor="withdrawal-fee" className="text-sm font-semibold text-gray-700">
                Withdrawal Fee
              </Label>
              <Input
                id="withdrawal-fee"
                type="number"
                value={withdrawalFee}
                onChange={(e) => setWithdrawalFee(e.target.value)}
                placeholder="200"
                min="0"
                step="1"
                className="w-full"
              />
              <Button 
                onClick={handleSaveWithdrawalFee} 
                disabled={updateSettingMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Fee
              </Button>
              <p className="text-xs text-gray-500">
                Current: ${parseFloat(withdrawalFee).toFixed(2)} per withdrawal
              </p>
            </div>

            {/* Referral Commission */}
            <div className="space-y-3">
              <Label htmlFor="referral-commission" className="text-sm font-semibold text-gray-700">
                Referral Commission
              </Label>
              <Input
                id="referral-commission"
                type="number"
                value={referralCommission}
                onChange={(e) => setReferralCommission(e.target.value)}
                placeholder="200"
                min="0"
                step="1"
                className="w-full"
              />
              <Button 
                onClick={handleSaveReferralCommission} 
                disabled={updateSettingMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Commission
              </Button>
              <p className="text-xs text-gray-500">
                Current: ${parseFloat(referralCommission).toFixed(2)} per referral
              </p>
            </div>



            {/* Admin Timezone */}
            <div className="space-y-3">
              <Label htmlFor="timezone" className="text-sm font-semibold text-gray-700">
                Admin Timezone
              </Label>
              <Select value={adminTimezone} onValueChange={setAdminTimezone}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSaveTimezone} 
                disabled={updateSettingMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Zone
              </Button>
              <p className="text-xs text-gray-500">
                Displays timestamps in this timezone for admins
              </p>
            </div>



          </div>
        </CardContent>
      </Card>



      {/* Maintenance Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Maintenance Message</span>
          </CardTitle>
          <CardDescription>
            Custom message displayed to users during maintenance mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="maintenance-message" className="text-sm font-semibold text-gray-700">
                Maintenance Message
              </Label>
              <Textarea
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Enter maintenance message..."
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveMaintenanceMessage} 
                disabled={updateSettingMutation.isPending}
                className="w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Message
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              This message will be shown to users when maintenance mode is enabled
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Cache Management</span>
          </CardTitle>
          <CardDescription>
            Clear application cache to ensure latest settings are reflected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              If you notice settings changes aren't reflecting immediately, clear the cache to force a refresh from the database.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => clearCacheMutation.mutate()} 
                disabled={clearCacheMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                {clearCacheMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {clearCacheMutation.isPending ? 'Clearing...' : 'Clear Cache'}
              </Button>
              <div className="text-xs text-gray-500 flex items-center">
                Last cleared: When you save any setting
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Current Settings Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-700">Maintenance</div>
              <div className={maintenanceMode ? "text-red-600" : "text-green-600"}>
                {maintenanceMode ? "Active" : "Inactive"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Platform Fee</div>
              <div className="text-gray-900">
                {platformFeeType === 'percentage' 
                  ? `${platformFee}%`
                  : `$${parseFloat(platformFee || '0').toFixed(2)}`
                }
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Top-Up Fee</div>
              <div className="text-gray-900">${parseFloat(topUpFee).toFixed(2)}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Withdrawal Fee</div>
              <div className="text-gray-900">${parseFloat(withdrawalFee).toFixed(2)}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">App Timezone</div>
              <div className="text-gray-900">{adminTimezone} (System-wide)</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Anti-DDoS</div>
              <div className={antiDdosEnabled ? "text-green-600" : "text-red-600"}>
                {antiDdosEnabled ? "Enabled" : "Disabled"}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Time Zone Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🕒</span>
            <span>App Timezone Control (System-wide)</span>
          </CardTitle>
          <CardDescription>
            Controls ALL timestamps throughout the entire system - orders, transactions, messages, logs, admin filters, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">UTC Time (System Time)</Label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <LiveClock 
                  timezone="UTC"
                  showIcon={false}
                  showDate={true}
                  className="text-blue-700"
                  label="UTC"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">App Time ({adminTimezone}) - System-wide</Label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <LiveClock 
                  timezone={adminTimezone}
                  showIcon={false}
                  showDate={true}
                  className="text-green-700"
                  useAdminTimezone={true}
                />
              </div>
              <p className="text-xs text-green-600">All timestamps system-wide use this timezone</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            <strong>App Timezone System:</strong> All timestamps throughout the entire system (orders, transactions, messages, logs, admin filters) automatically follow this timezone setting. Changes apply instantly across all components without manual refresh.
          </p>
        </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Tab - Consolidated Platform Management */}
        <TabsContent value="platform" className="space-y-6 mt-6">
          {/* Platform Name Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Platform Name Management</span>
              </CardTitle>
              <CardDescription>
                Configure the display name for your platform across all pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name" className="text-sm font-semibold text-gray-700">
                    Platform Name
                  </Label>
                  <Input
                    id="platform-name"
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Enter platform name"
                    className="max-w-md"
                  />
                  <p className="text-xs text-gray-500">
                    This name will appear across all pages including the homepage, headers, and footer
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => {
                      updateSettingMutation.mutate({
                        key: 'platform_name',
                        value: platformName,
                        description: 'Display name for the platform'
                      });
                    }}
                    disabled={updateSettingMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? 'Saving...' : 'Save Platform Name'}</span>
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    Current: <span className="font-medium">{platformName}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Social Links Management</span>
              </CardTitle>
              <CardDescription>
                Manage social media links displayed in the footer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSocialLinks />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password-reset" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Password Reset</span>
              </CardTitle>
              <CardDescription>
                Search for users and reset their passwords securely. Works for admin, employees, and users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Search Section */}
              <div className="space-y-4">
                <Label htmlFor="user-search" className="text-sm font-semibold">Search User</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="user-search"
                      placeholder="Enter username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching || searchTerm.trim().length < 2}
                    className="px-6"
                  >
                    {isSearching ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Enter at least 2 characters to search</p>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Search Results</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {searchResults.map((user: any) => (
                      <div
                        key={user.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Status: {user.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected User & Password Reset */}
              {selectedUser && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <Label className="text-sm font-semibold text-blue-800">Selected User</Label>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-gray-600">@{selectedUser.username} • {selectedUser.email}</p>
                    <p className="text-sm">
                      <span className={`font-semibold ${
                        selectedUser.role === 'admin' ? 'text-red-600' :
                        selectedUser.role === 'employee' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-semibold">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Password will be securely hashed with bcrypt</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleResetPassword}
                      disabled={resetPasswordMutation.isPending || !newPassword || newPassword.length < 6}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {resetPasswordMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(null);
                        setNewPassword("");
                        setSearchTerm("");
                        setSearchResults([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejection-reasons" className="mt-6">
          <AdminRejectionReasons />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <CreateEmployee />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <GlobalNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
}