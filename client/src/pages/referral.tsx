import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  DollarSign, 
  Copy, 
  Share2,
  TrendingUp,
  Gift,
  UserPlus,
  Clock
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import DynamicTimestamp from "@/components/ui/dynamic-timestamp";

interface ReferralData {
  totalEarned: number;
  totalReferrals: number;
  referralHistory: {
    id: string;
    referredUserId: string;
    referredUserName: string;
    amount: number;
    status: 'pending' | 'paid';
    createdAt: string;
  }[];
}

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch public settings to get referral commission amount
  const { data: settings } = useQuery({
    queryKey: ["/api/settings/public"],
  });

  // Generate referral link
  const referralLink = user ? `${window.location.origin}/signup?ref=${user.username}` : "";

  // Fetch referral stats and history from real API
  const { data: referralStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/referrals', user?.id, 'stats'],
    enabled: !!user?.id,
  });

  const { data: referralHistoryResponse = {}, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/referrals', user?.id, 'history', 'pending', '1', '5'],
    queryFn: async () => {
      const response = await fetch(`/api/referrals/${user?.id}/history/pending/1/5`);
      if (!response.ok) throw new Error('Failed to fetch referral history');
      return response.json();
    },
    enabled: !!user?.id,
  });
  
  const referralHistory = referralHistoryResponse?.referrals || [];

  const isLoading = isStatsLoading || isHistoryLoading;

  // Map backend data to frontend format
  const referralData = {
    totalEarned: referralStats?.totalEarnings || 0, // Already in cents from backend
    totalReferrals: referralStats?.referredUserCount || 0,
    referralHistory: referralHistory.map((ref: any) => ({
      id: ref.id,
      referredUserId: ref.referredUserId,
      referredUserName: `Referred User`, // Backend might not have names
      amount: ref.referralAmount || 0, // Already in cents from backend
      status: ref.status,
      createdAt: ref.createdAt
    }))
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join OutMarkly',
        text: 'Join me on OutMarkly - The best platform for guest posts and link exchanges!',
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Refer & Earn</h1>
        <p className="text-gray-600">Earn rewards by referring new users to our platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(referralData?.totalEarned || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From referrals</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {referralData?.totalReferrals || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Users referred</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {referralData?.totalReferrals ? Math.round((referralData.referralHistory.filter(r => r.status === 'paid').length / referralData.totalReferrals) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Your Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends to start earning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Referral Link</Label>
              <div className="flex space-x-2">
                <Input 
                  value={referralLink}
                  readOnly
                  className="bg-gray-50"
                />
                <Button 
                  onClick={handleCopyLink}
                  size="sm"
                  variant={copied ? "default" : "outline"}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleShare} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Share your link</p>
                  <p className="text-sm text-gray-600">Send your referral link to friends and colleagues</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">They sign up</p>
                  <p className="text-sm text-gray-600">New users register using your referral link</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">You earn ${settings?.referralCommission || 3} USDT</p>
                  <p className="text-sm text-gray-600">Receive commission when they make their first order</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You earn commission only on the first order made by each referred user. 
                The reward is automatically added to your wallet balance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Referral History
          </CardTitle>
          <CardDescription>
            Track your referral earnings and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralData?.referralHistory && referralData.referralHistory.length > 0 ? (
            <div className="space-y-4">
              {referralData.referralHistory.map((referral) => (
                <div 
                  key={referral.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.referredUserName}</p>
                      <p className="text-sm text-gray-500">
                        <DynamicTimestamp timestamp={referral.createdAt} />
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(referral.amount)}
                      </p>
                      <Badge 
                        variant={referral.status === 'paid' ? 'default' : 'secondary'}
                        className={referral.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {referral.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No referrals yet</p>
              <p className="text-sm text-gray-400">Start sharing your referral link to see your earnings here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}